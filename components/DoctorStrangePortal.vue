<script setup lang="ts">
/**
 * Doctor Strange Portal — fly-through transition to the next slide
 *
 * Uses Slidev's internal SlideContainer/SlideWrapper to render the ACTUAL
 * next slide inside the portal (no content duplication). On advance, GSAP
 * zooms through the portal ring into the next slide seamlessly.
 *
 * Usage in slides.md:
 *   <DoctorStrangePortal />
 *   <DoctorStrangePortal :ring-size="400" :next-slide="15" />
 */
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useNav, useSlideContext, onSlideEnter, onSlideLeave } from '@slidev/client'
import SlideContainer from '@slidev/client/internals/SlideContainer.vue'
import SlideWrapper from '@slidev/client/internals/SlideWrapper.vue'
import { getSlide } from '@slidev/client/logic/slides.ts'
import { createFixedClicks } from '@slidev/client/composables/useClicks.ts'
import { CLICKS_MAX } from '@slidev/client/constants.ts'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import gsap from 'gsap'

const props = withDefaults(defineProps<{
  ringSize?: number
  /** Enable ground plane that sparks settle on */
  ground?: boolean
  /** Override which slide to show through the portal (default: current + 1) */
  nextSlide?: number
}>(), {
  ringSize: 360,
  ground: true,
})

// --- Slidev internals: render the next slide ---

const { $page } = useSlideContext()
const targetSlideNo = computed(() => props.nextSlide ?? $page.value + 1)
const nextRoute = computed(() => getSlide(targetSlideNo.value))
const nextClicksContext = computed(() =>
  nextRoute.value ? createFixedClicks(nextRoute.value, CLICKS_MAX) : undefined,
)

// --- Refs & state ---

const stageRef = ref<HTMLDivElement>()
const contentRef = ref<HTMLDivElement>()
const ringRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLDivElement>()
const contentOverlayRef = ref<HTMLDivElement>()
const nav = useNav()
let animationId = 0
let renderer: THREE.WebGLRenderer | null = null
let composer: EffectComposer | null = null
let portalGroup: THREE.Group | null = null
let isZooming = false
let interceptActive = false
let zoomTl: gsap.core.Timeline | null = null

// Phase state machine: 0=black, 1=drawing, 2=ready, 3=un-drawing (reverse)
let phase: 0 | 1 | 2 | 3 = 0
let arcProgress = 0              // radians drawn (0 to 2*PI)
let sparksActivated = 0          // how many sparks are "alive"
let creationTl: gsap.core.Timeline | null = null
let coreNeedsFullCircle = false

// Callback set by initThreeScene to reset Three.js visual state
let resetPortalVisuals: (() => void) | null = null

// Content renders at near-full scale — the portal is a peephole, not a miniature.
// Starts slightly pulled back so advancing feels like "entering" the slide.
const CONTENT_SCALE_INITIAL = 0.95
const CONTENT_SCALE_FINAL = 1

// --- Phase dispatchers ---

function advancePhase() {
  if (phase === 0) { phase = 1; playCreation() }
  else if (phase === 1) { return } // ignore during draw
  else if (phase === 2) { playZoom('forward') }
  else if (phase === 3) { return } // ignore during reverse draw
}

function retreatPhase() {
  if (phase === 2) { playReverseCreation() }
  else if (phase === 3) { return } // ignore during reverse draw
  else if (phase === 1) {
    // Cancel in-progress creation, go back
    creationTl?.kill()
    creationTl = null
    interceptActive = false
    resetState()
    nav.prevSlide(true)
  }
  else if (phase === 0) {
    interceptActive = false
    nav.prevSlide(true)
  }
}

// --- Navigation interception ---

const FORWARD_KEYS = ['ArrowRight', 'ArrowDown', ' ', 'Enter', 'PageDown']
const BACKWARD_KEYS = ['ArrowLeft', 'ArrowUp', 'PageUp']

function onKeydown(e: KeyboardEvent) {
  if (!interceptActive || isZooming) return
  if (FORWARD_KEYS.includes(e.key)) {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    advancePhase()
  } else if (BACKWARD_KEYS.includes(e.key)) {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    retreatPhase()
  }
}

function onClickCapture(e: MouseEvent) {
  if (!interceptActive || isZooming) return
  const target = e.target as HTMLElement
  if (target.closest('.slidev-nav, nav, button, a')) return
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()
  advancePhase()
}

function applyProgress(p: number, content: HTMLElement, initialClipRadius: number, ringScaleEnd: number, maxRadius: number) {
  const ringScale = 1 + (ringScaleEnd - 1) * p
  const clipRadius = Math.min(initialClipRadius * ringScale, maxRadius)
  const contentScale = CONTENT_SCALE_INITIAL + (CONTENT_SCALE_FINAL - CONTENT_SCALE_INITIAL) * p

  content.style.transform = `scale(${contentScale})`
  content.style.clipPath = `circle(${clipRadius}px at 50% 50%)`

  // Scale the Three.js portal group and fade the canvas via CSS
  if (portalGroup) {
    portalGroup.scale.setScalar(ringScale)
  }
  if (canvasRef.value) {
    canvasRef.value.style.opacity = `${Math.max(0, 1 - p * p * p * 2.5)}`
  }
}

// --- Creation animation ---

function playCreation() {
  arcProgress = 0
  sparksActivated = 0
  const proxy = { arc: 0 }
  creationTl = gsap.timeline({
    onComplete: () => { phase = 2; sparksActivated = Infinity; coreNeedsFullCircle = true },
  })
  // Draw the arc CCW from top
  creationTl.to(proxy, {
    arc: Math.PI * 2,
    duration: 2.5,
    ease: 'power2.inOut',
    onUpdate: () => { arcProgress = proxy.arc },
  })
  // Fade overlay to reveal content — starts midway through arc draw
  if (contentOverlayRef.value) {
    creationTl.to(contentOverlayRef.value, {
      opacity: 0, duration: 1.0, ease: 'power2.out',
    }, 1.8)
  }
}

// --- Reverse creation animation ---

function playReverseCreation() {
  phase = 3
  const proxy = { arc: arcProgress }
  creationTl = gsap.timeline({
    onComplete: () => {
      resetState()
      interceptActive = true
    },
  })
  // Fade content back to black and reverse the arc simultaneously
  if (contentOverlayRef.value) {
    creationTl.to(contentOverlayRef.value, {
      opacity: 1, duration: 0.5, ease: 'power2.in',
    }, 0)
  }
  creationTl.to(proxy, {
    arc: 0,
    duration: 2.5,
    ease: 'power2.inOut',
    onUpdate: () => { arcProgress = proxy.arc },
  }, 0)
}

function playZoom(direction: 'forward') {
  if (isZooming || !stageRef.value || !contentRef.value) return
  isZooming = true

  const stage = stageRef.value
  const maxRadius = Math.hypot(stage.offsetWidth, stage.offsetHeight) / 2

  const initialClipRadius = (props.ringSize * 0.38) / CONTENT_SCALE_INITIAL
  const ringScaleEnd = 14
  const content = contentRef.value
  const proxy = { progress: 0 }

  zoomTl = gsap.timeline({
    onComplete: () => {
      interceptActive = false
      nav.nextSlide()
      resetState()
    },
  })
  zoomTl.to(proxy, {
    progress: 1,
    duration: 2.8,
    ease: 'expo.in',
    onUpdate: () => applyProgress(proxy.progress, content, initialClipRadius, ringScaleEnd, maxRadius),
  }, 0)
}

function playReverseEntrance() {
  if (!stageRef.value || !contentRef.value) return
  isZooming = true
  interceptActive = false

  // Skip to phase 2 — portal fully formed
  phase = 2
  arcProgress = Math.PI * 2
  sparksActivated = Infinity // all sparks active
  coreNeedsFullCircle = true
  if (contentOverlayRef.value) contentOverlayRef.value.style.opacity = '0'
  resetPortalVisuals?.() // ensure haze is visible for phase 2
  // Re-show haze immediately for reverse entrance
  // (resetPortalVisuals hides it, but we need it for phase 2)

  const stage = stageRef.value
  const maxRadius = Math.hypot(stage.offsetWidth, stage.offsetHeight) / 2
  const initialClipRadius = (props.ringSize * 0.38) / CONTENT_SCALE_INITIAL
  const ringScaleEnd = 14
  const content = contentRef.value

  // Start at full-screen state
  const proxy = { progress: 1 }
  applyProgress(1, content, initialClipRadius, ringScaleEnd, maxRadius)

  zoomTl = gsap.timeline({
    onComplete: () => {
      isZooming = false
      zoomTl = null
      // Settle at phase 2
      phase = 2
      arcProgress = Math.PI * 2
      sparksActivated = Infinity
      if (contentOverlayRef.value) contentOverlayRef.value.style.opacity = '0'
      // Reset clip/scale to resting state
      const clipRadius = (props.ringSize * 0.38) / CONTENT_SCALE_INITIAL
      if (contentRef.value) {
        gsap.set(contentRef.value, {
          scale: CONTENT_SCALE_INITIAL,
          clipPath: `circle(${clipRadius}px at 50% 50%)`,
        })
      }
      if (portalGroup) portalGroup.scale.setScalar(1)
      if (canvasRef.value) canvasRef.value.style.opacity = '1'
      interceptActive = true
    },
  })

  // Animate back to portal resting state — fast at first then decelerates
  zoomTl.to(proxy, {
    progress: 0,
    duration: 2.0,
    ease: 'expo.out',
    onUpdate: () => applyProgress(proxy.progress, content, initialClipRadius, ringScaleEnd, maxRadius),
  }, 0)
}

function resetState() {
  const clipRadius = (props.ringSize * 0.38) / CONTENT_SCALE_INITIAL
  if (contentRef.value) {
    gsap.set(contentRef.value, {
      scale: CONTENT_SCALE_INITIAL,
      clipPath: `circle(${clipRadius}px at 50% 50%)`,
    })
  }
  if (portalGroup) {
    portalGroup.scale.setScalar(1)
  }
  if (canvasRef.value) {
    canvasRef.value.style.opacity = '1'
  }
  // Reset phase state
  phase = 0
  arcProgress = 0
  sparksActivated = 0
  coreNeedsFullCircle = false
  if (contentOverlayRef.value) contentOverlayRef.value.style.opacity = '1'
  creationTl?.kill()
  creationTl = null
  isZooming = false
  zoomTl = null
  // Reset Three.js visual state (haze, core particles, kill alive sparks)
  resetPortalVisuals?.()
}

onSlideEnter(async () => {
  window.addEventListener('keydown', onKeydown, { capture: true })
  window.addEventListener('click', onClickCapture, { capture: true })

  if (nav.navDirection.value < 0) {
    // Entered from the next slide (backward navigation)
    await nextTick()
    playReverseEntrance()
  } else {
    resetState()
    interceptActive = true
  }
})

onSlideLeave(() => {
  interceptActive = false
  zoomTl?.kill()
  zoomTl = null
  creationTl?.kill()
  creationTl = null
  isZooming = false
  window.removeEventListener('keydown', onKeydown, { capture: true })
  window.removeEventListener('click', onClickCapture, { capture: true })
})

// --- Glow texture for particles ---

function createGlowTexture(): THREE.Texture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255, 180, 60, 0.9)')
  gradient.addColorStop(0.2, 'rgba(240, 120, 20, 0.6)')
  gradient.addColorStop(0.5, 'rgba(200, 60, 5, 0.25)')
  gradient.addColorStop(0.8, 'rgba(140, 20, 2, 0.08)')
  gradient.addColorStop(1, 'rgba(80, 5, 0, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

// --- Three.js portal ring ---

function initThreeScene(el: HTMLDivElement, w: number, h: number) {
  if (renderer) return // already initialized

  const dpr = 2
  const scene = new THREE.Scene()
  const fov = 50
  const aspect = w / h
  const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100)
  const visualDiameter = 3.0
  camera.position.z = visualDiameter * h / (2 * props.ringSize * Math.tan((fov / 2) * Math.PI / 180))

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: false })
  renderer.setSize(w, h)
  renderer.setPixelRatio(dpr)
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.LinearToneMapping
  renderer.toneMappingExposure = 1.0
  el.appendChild(renderer.domElement)

  // Post-processing: subtle bloom makes sparks glow naturally
  const renderTarget = new THREE.WebGLRenderTarget(w * dpr, h * dpr, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    samples: 0,
  })
  composer = new EffectComposer(renderer, renderTarget)
  composer.addPass(new RenderPass(scene, camera))
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(w * dpr, h * dpr),
    0.4,   // strength — subtle glow
    0.4,   // radius — softer spread
    0.75,  // threshold
  )
  composer.addPass(bloomPass)
  composer.addPass(new OutputPass())

  portalGroup = new THREE.Group()
  scene.add(portalGroup)

  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.05, 32, 200),
    new THREE.MeshBasicMaterial({ color: 0xee8811 }),
  )
  torus.visible = false // TEMP: hidden to preview sparks-only look
  portalGroup.add(torus)

  const inner = new THREE.Mesh(
    new THREE.TorusGeometry(1.12, 0.025, 32, 200),
    new THREE.MeshBasicMaterial({ color: 0xdd6611, transparent: true, opacity: 0.7 }),
  )
  inner.visible = false // TEMP
  inner.rotation.z = 0.3
  portalGroup.add(inner)

  const outer = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.2, 32, 200),
    new THREE.MeshBasicMaterial({
      color: 0xdd7711, transparent: true, opacity: 0.08,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }),
  )
  outer.visible = false // TEMP
  portalGroup.add(outer)

  const outerGlow = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.35, 32, 200),
    new THREE.MeshBasicMaterial({
      color: 0xcc5500, transparent: true, opacity: 0.03,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }),
  )
  outerGlow.visible = false // TEMP
  portalGroup.add(outerGlow)

  // --- Spark emitter ---

  const glowTex = createGlowTexture()
  const RING_SPEED = 14.0
  const RING_RADIUS = 1.15
  const SPARK_COUNT = 2800
  const TRAIL_LEN = 0.18
  const GROUND_Y = -RING_RADIUS - 0.025
  const ARC_START = Math.PI / 2  // start drawing from top (12 o'clock)

  // Per-spark state
  const sparkX = new Float32Array(SPARK_COUNT)
  const sparkY = new Float32Array(SPARK_COUNT)
  const sparkVx = new Float32Array(SPARK_COUNT)
  const sparkVy = new Float32Array(SPARK_COUNT)
  const sparkAge = new Float32Array(SPARK_COUNT)
  const sparkMaxAge = new Float32Array(SPARK_COUNT)
  const sparkZ = new Float32Array(SPARK_COUNT)

  function spawnSpark(i: number, t: number) {
    let ringAngle: number
    if (phase === 1 || phase === 3) {
      // Constrain to drawn arc (phases 1 and 3)
      ringAngle = ARC_START + Math.random() * arcProgress
    } else {
      // Phase 2: full circle with rotation
      ringAngle = t * RING_SPEED + Math.random() * Math.PI * 2
    }
    const r = RING_RADIUS + (Math.random() - 0.5) * 0.06
    sparkX[i] = Math.cos(ringAngle) * r
    sparkY[i] = Math.sin(ringAngle) * r
    sparkZ[i] = (Math.random() - 0.5) * 0.08

    const tangentSpeed = RING_SPEED * r
    const tx = -Math.sin(ringAngle)
    const ty = Math.cos(ringAngle)
    const rx = Math.cos(ringAngle)
    const ry = Math.sin(ringAngle)
    const radialKick = 0.1 + Math.random() * 0.3
    const jitter = (Math.random() - 0.5) * 0.2
    sparkVx[i] = tx * tangentSpeed * (0.15 + Math.random() * 0.15) + rx * radialKick + jitter
    sparkVy[i] = ty * tangentSpeed * (0.15 + Math.random() * 0.15) + ry * radialKick + jitter

    sparkAge[i] = 0
    sparkMaxAge[i] = 0.12 + Math.random() * 0.35
  }

  function killAllSparks() {
    for (let i = 0; i < SPARK_COUNT; i++) {
      sparkAge[i] = 999
      sparkMaxAge[i] = 1
    }
  }

  // Initialize all sparks as dead
  killAllSparks()

  // Trail line segments
  const trailPositions = new Float32Array(SPARK_COUNT * 2 * 3)
  const trailColors = new Float32Array(SPARK_COUNT * 2 * 3)
  const trailGeo = new THREE.BufferGeometry()
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3))
  trailGeo.setAttribute('color', new THREE.BufferAttribute(trailColors, 3))
  const trailMesh = new THREE.LineSegments(trailGeo, new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }))
  trailMesh.frustumCulled = false
  portalGroup.add(trailMesh)

  // Ember heads
  const emberPositions = new Float32Array(SPARK_COUNT * 3)
  const emberGeo = new THREE.BufferGeometry()
  emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3))
  const emberMesh = new THREE.Points(emberGeo, new THREE.PointsMaterial({
    map: glowTex,
    color: 0xee8811,
    size: 0.045,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }))
  emberMesh.frustumCulled = false
  portalGroup.add(emberMesh)

  // Core glow band
  const coreCount = 800
  const corePositions = new Float32Array(coreCount * 3)
  for (let i = 0; i < coreCount; i++) {
    corePositions[i * 3 + 2] = -999
  }
  const coreGeo = new THREE.BufferGeometry()
  coreGeo.setAttribute('position', new THREE.BufferAttribute(corePositions, 3))
  const coreParticles = new THREE.Points(coreGeo, new THREE.PointsMaterial({
    map: glowTex, color: 0xee8811, size: 0.06,
    transparent: true, opacity: 0.7,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }))
  coreParticles.frustumCulled = false
  portalGroup.add(coreParticles)

  let lastTime = performance.now() * 0.001

  // --- Subtle red haze behind the portal ring ---
  const hazeSize = 256
  const hazeCanvas = document.createElement('canvas')
  hazeCanvas.width = hazeSize
  hazeCanvas.height = hazeSize
  const hazeCtx = hazeCanvas.getContext('2d')!
  const hazeCx = hazeSize / 2
  const hazeGrad = hazeCtx.createRadialGradient(hazeCx, hazeCx, 0, hazeCx, hazeCx, hazeCx)
  hazeGrad.addColorStop(0, 'rgba(0, 0, 0, 0)')
  hazeGrad.addColorStop(0.35, 'rgba(60, 8, 0, 0)')
  hazeGrad.addColorStop(0.52, 'rgba(120, 25, 2, 0.2)')
  hazeGrad.addColorStop(0.65, 'rgba(80, 12, 0, 0.12)')
  hazeGrad.addColorStop(0.85, 'rgba(40, 5, 0, 0.04)')
  hazeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
  hazeCtx.fillStyle = hazeGrad
  hazeCtx.fillRect(0, 0, hazeSize, hazeSize)
  const hazeTex = new THREE.CanvasTexture(hazeCanvas)
  const hazeMat = new THREE.SpriteMaterial({
    map: hazeTex,
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const hazeSprite = new THREE.Sprite(hazeMat)
  hazeSprite.scale.set(4.0, 4.0, 1)
  hazeSprite.position.z = -0.1
  hazeSprite.visible = false
  portalGroup.add(hazeSprite)

  // Track whether haze fade-in has been triggered (reset on portal reset)
  let hazeFadedIn = false

  // --- Reset callback for external use ---
  resetPortalVisuals = () => {
    // Kill all sparks
    killAllSparks()
    // Hide haze
    gsap.killTweensOf(hazeMat)
    hazeSprite.visible = false
    hazeMat.opacity = 1.0
    hazeFadedIn = false
    // Move core particles off-screen
    const cPos = coreGeo.attributes.position.array as Float32Array
    for (let i = 0; i < coreCount; i++) {
      cPos[i * 3] = 0
      cPos[i * 3 + 1] = 0
      cPos[i * 3 + 2] = -999
    }
    coreGeo.attributes.position.needsUpdate = true
    coreParticles.rotation.z = 0
  }

  function animate() {
    const t = performance.now() * 0.001
    const dt = Math.min(t - lastTime, 0.05)
    lastTime = t

    // Rotate torus rings (visual only)
    torus.rotation.z = t * 0.5
    inner.rotation.z = -t * 0.36 + 0.3
    outer.rotation.z = t * 0.2
    outerGlow.rotation.z = -t * 0.16

    // Core glow: phase-aware positioning
    const cPos = coreGeo.attributes.position.array as Float32Array
    if (phase === 0) {
      // No-op — core particles stay off-screen from reset
    } else if (phase === 1 || phase === 3) {
      // Constrain core particles to the drawn arc, no rotation
      coreParticles.rotation.z = 0
      for (let i = 0; i < coreCount; i++) {
        if (arcProgress < 0.01) {
          cPos[i * 3 + 2] = -999
        } else {
          const angle = ARC_START + Math.random() * arcProgress
          const r = RING_RADIUS + (Math.random() - 0.5) * 0.06
          cPos[i * 3] = Math.cos(angle) * r
          cPos[i * 3 + 1] = Math.sin(angle) * r
          cPos[i * 3 + 2] = (Math.random() - 0.5) * 0.05
        }
      }
      coreGeo.attributes.position.needsUpdate = true
    } else {
      // Phase 2: full circle, resume rotation
      if (coreNeedsFullCircle) {
        coreNeedsFullCircle = false
        for (let i = 0; i < coreCount; i++) {
          const angle = Math.random() * Math.PI * 2
          const r = RING_RADIUS + (Math.random() - 0.5) * 0.06
          cPos[i * 3] = Math.cos(angle) * r
          cPos[i * 3 + 1] = Math.sin(angle) * r
          cPos[i * 3 + 2] = (Math.random() - 0.5) * 0.05
        }
        coreGeo.attributes.position.needsUpdate = true
      }
      coreParticles.rotation.z = t * RING_SPEED
    }

    // Haze: fade in when arc > PI during creation, fade out when arc < PI during reverse
    if ((phase === 1 || phase === 3) && arcProgress > Math.PI && !hazeFadedIn) {
      hazeSprite.visible = true
      hazeMat.opacity = 0
      gsap.killTweensOf(hazeMat)
      gsap.to(hazeMat, { opacity: 1.0, duration: 1.0, ease: 'power2.out' })
      hazeFadedIn = true
    }
    if (phase === 3 && arcProgress <= Math.PI && hazeFadedIn) {
      gsap.killTweensOf(hazeMat)
      gsap.to(hazeMat, { opacity: 0, duration: 0.6, ease: 'power2.in', onComplete: () => { hazeSprite.visible = false } })
      hazeFadedIn = false
    }

    // Gradually adjust sparksActivated proportional to arc progress
    if (phase === 1 || phase === 3) {
      sparksActivated = Math.floor((arcProgress / (Math.PI * 2)) * SPARK_COUNT)
    }

    // Update sparks
    const tPos = trailGeo.attributes.position.array as Float32Array
    const tCol = trailGeo.attributes.color.array as Float32Array
    const ePos = emberGeo.attributes.position.array as Float32Array

    for (let i = 0; i < SPARK_COUNT; i++) {
      sparkAge[i] += dt

      // Respawn dead sparks — only if phase >= 1 and within activated count
      if (sparkAge[i] >= sparkMaxAge[i]) {
        if (phase >= 1 && i < sparksActivated) {
          spawnSpark(i, t)
        } else {
          // Keep dead — move ember off-screen
          ePos[i * 3] = 0
          ePos[i * 3 + 1] = 0
          ePos[i * 3 + 2] = -999
          tPos[i * 6] = 0; tPos[i * 6 + 1] = 0; tPos[i * 6 + 2] = -999
          tPos[i * 6 + 3] = 0; tPos[i * 6 + 4] = 0; tPos[i * 6 + 5] = -999
          tCol[i * 6] = 0; tCol[i * 6 + 1] = 0; tCol[i * 6 + 2] = 0
          tCol[i * 6 + 3] = 0; tCol[i * 6 + 4] = 0; tCol[i * 6 + 5] = 0
          continue
        }
      }

      // Gravity pulls sparks downward
      if (props.ground) sparkVy[i] -= 0.8 * dt

      // Advance position
      sparkX[i] += sparkVx[i] * dt
      sparkY[i] += sparkVy[i] * dt

      // Strong drag so sparks stay near the ring
      sparkVx[i] *= (1 - 3.0 * dt)
      sparkVy[i] *= (1 - 3.0 * dt)

      // Ground collision
      if (props.ground && sparkY[i] < GROUND_Y) {
        sparkY[i] = GROUND_Y
        sparkVy[i] = 0
        sparkVx[i] *= 0.85
      }

      const life = sparkAge[i] / sparkMaxAge[i]

      const hx = sparkX[i]
      const hy = sparkY[i]
      const hz = sparkZ[i]
      const trailScale = Math.max(0, 1 - life * life)
      const rawTailX = hx - sparkVx[i] * TRAIL_LEN * trailScale
      const rawTailY = hy - sparkVy[i] * TRAIL_LEN * trailScale
      const rawTailDist = Math.sqrt(rawTailX * rawTailX + rawTailY * rawTailY)
      const tailX = rawTailDist > 0 ? (rawTailX / rawTailDist) * RING_RADIUS : rawTailX
      const tailY = rawTailDist > 0 ? (rawTailY / rawTailDist) * RING_RADIUS : rawTailY

      const headX = tailX + (hx - tailX) * trailScale
      const headY = tailY + (hy - tailY) * trailScale
      tPos[i * 6] = headX
      tPos[i * 6 + 1] = headY
      tPos[i * 6 + 2] = hz
      tPos[i * 6 + 3] = tailX
      tPos[i * 6 + 4] = tailY
      tPos[i * 6 + 5] = hz

      const dist = Math.sqrt(hx * hx + hy * hy)
      const distFromRing = Math.max(0, dist - RING_RADIUS)
      const rs = Math.min(1, distFromRing * 7.0)
      const fade = Math.max(0, 1 - life * life)

      tCol[i * 6]     = (0.6 - rs * 0.15) * fade
      tCol[i * 6 + 1] = (0.25 - rs * 0.22) * fade
      tCol[i * 6 + 2] = (0.02 - rs * 0.02) * fade
      const trs = Math.min(1, rs + 0.4)
      const tailFade = fade * 0.6
      tCol[i * 6 + 3] = (0.5 - trs * 0.15) * tailFade
      tCol[i * 6 + 4] = (0.1 - trs * 0.09) * tailFade
      tCol[i * 6 + 5] = 0.0

      if (fade > 0.05) {
        ePos[i * 3] = hx
        ePos[i * 3 + 1] = hy
        ePos[i * 3 + 2] = hz
      } else {
        ePos[i * 3] = 0
        ePos[i * 3 + 1] = 0
        ePos[i * 3 + 2] = -999
      }
    }

    trailGeo.attributes.position.needsUpdate = true
    trailGeo.attributes.color.needsUpdate = true
    emberGeo.attributes.position.needsUpdate = true

    composer!.render()
    animationId = requestAnimationFrame(animate)
  }

  animate()
}

onMounted(() => {
  const el = canvasRef.value
  const stage = stageRef.value
  if (!el || !stage) return

  const w = stage.offsetWidth
  const h = stage.offsetHeight

  if (w > 0 && h > 0) {
    initThreeScene(el, w, h)
  } else {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        observer.disconnect()
        initThreeScene(el, entry.contentRect.width, entry.contentRect.height)
      }
    })
    observer.observe(stage)
  }
})

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
  creationTl?.kill()
  creationTl = null
  if (composer) {
    composer.dispose()
    composer = null
  }
  if (renderer) {
    renderer.dispose()
    renderer.domElement.remove()
    renderer = null
  }
  interceptActive = false
  window.removeEventListener('keydown', onKeydown, { capture: true })
  window.removeEventListener('click', onClickCapture, { capture: true })
})
</script>

<template>
  <div ref="stageRef" class="portal-stage">
    <!-- Next slide rendered by Slidev's own internals, clipped to portal circle -->
    <div
      ref="contentRef"
      class="portal-content"
      :style="{
        transform: `scale(${CONTENT_SCALE_INITIAL})`,
        clipPath: `circle(${(ringSize * 0.38) / CONTENT_SCALE_INITIAL}px at 50% 50%)`,
      }"
    >
      <SlideContainer
        v-if="nextRoute"
        :no="nextRoute.no"
        class="portal-slide-container"
      >
        <SlideWrapper
          v-if="nextClicksContext"
          :clicks-context="nextClicksContext"
          :route="nextRoute"
          render-context="overview"
        />
      </SlideContainer>
      <!-- Black overlay hides content until portal creation completes -->
      <div ref="contentOverlayRef" class="portal-content-overlay" />
    </div>

    <!-- Three.js canvas fills full stage so bloom fades seamlessly -->
    <div ref="canvasRef" class="portal-canvas-full" />
  </div>
</template>

<style scoped>
.portal-stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #000;
}

.portal-content {
  position: absolute;
  inset: 0;
  z-index: 0;
  transform-origin: center center;
  will-change: transform, clip-path;
}

/* Make the SlideContainer fill the portal-content layer exactly */
.portal-slide-container {
  width: 100%;
  height: 100%;
}

.portal-content-overlay {
  position: absolute;
  inset: 0;
  background: #000;
  z-index: 1;
  pointer-events: none;
}

.portal-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  pointer-events: none;
  transform-origin: center center;
  will-change: transform, opacity;
}

.portal-canvas-full {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.portal-canvas-full canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
