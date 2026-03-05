<script setup lang="ts">
/**
 * Doctor Strange Portal — fly-through transition to the next slide
 *
 * Uses Slidev's internal SlideContainer/SlideWrapper to render the ACTUAL
 * next slide inside the portal (no content duplication). On advance, GSAP
 * zooms through the portal ring into the next slide seamlessly.
 *
 * NOTE: Module-scoped mutable state (renderer, composer, portalGroup, etc.)
 * means only ONE instance of this component can exist at a time. If you need
 * portals on multiple slides simultaneously, move these into instance-scoped
 * refs or a setup-local closure.
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

// --- Constants ---

// Content renders at near-full scale — the portal is a peephole, not a miniature.
// Starts slightly pulled back so advancing feels like "entering" the slide.
const CONTENT_SCALE_INITIAL = 0.95
const CONTENT_SCALE_FINAL = 1

// Ratio of ringSize that becomes the clip-path radius (the visible peephole)
const CLIP_RADIUS_RATIO = 0.38

// How much the portal ring scales up during the zoom-through transition
const RING_SCALE_END = 14

// Animation durations (seconds)
const CREATION_DURATION = 2.5
const CONTENT_REVEAL_TIME = 1.8
const ZOOM_FORWARD_DURATION = 2.8
const ZOOM_REVERSE_DURATION = 2.0

// --- Refs & state ---

const stageRef = ref<HTMLDivElement>()
const contentRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLDivElement>()
const contentOverlayRef = ref<HTMLDivElement>()
const nav = useNav()
let animationId = 0
let renderer: THREE.WebGLRenderer | null = null
let composer: EffectComposer | null = null
let portalGroup: THREE.Group | null = null
let isZooming = false
let isZoomForward = false  // true = zooming to next slide, false = reverse entrance
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

// Cleanup functions for Three.js objects (geometries, materials, textures)
let disposeThreeObjects: (() => void) | null = null

// --- Derived helpers ---

function computeClipRadius(): number {
  return (props.ringSize * CLIP_RADIUS_RATIO) / CONTENT_SCALE_INITIAL
}

// --- Phase dispatchers ---

function advancePhase() {
  if (phase === 0) { phase = 1; playCreation() }
  else if (phase === 1) { skipCreationToEnd() }
  else if (phase === 2) { playZoom('forward') }
  else if (phase === 3) { cancelReverseCreation() }  // snap back to phase 2
}

function retreatPhase() {
  if (phase === 2) { playReverseCreation() }
  else if (phase === 3) { skipReverseCreationToEnd() }  // finish going back to phase 0
  else if (phase === 1) {
    // Cancel in-progress creation, return to phase 0 on same slide
    creationTl?.kill()
    creationTl = null
    resetState()
    interceptActive = true
  }
  else if (phase === 0) {
    // Let Slidev handle (v-clicks already at 0, so this goes to prev slide)
    interceptActive = false
    nav.prevSlide(true)
  }
}

/** Skip creation animation to end -> portal fully formed (phase 2) */
function skipCreationToEnd() {
  const tl = creationTl
  if (tl) {
    creationTl = null
    tl.progress(1)
    tl.kill()
  }
}

/** Skip reverse creation animation to end -> back to phase 0 */
function skipReverseCreationToEnd() {
  const tl = creationTl
  if (tl) {
    creationTl = null
    tl.progress(1)
    tl.kill()
  }
}

/** Cancel reverse creation and snap back to phase 2 (portal ready) */
function cancelReverseCreation() {
  creationTl?.kill()
  creationTl = null
  // Restore phase 2 state
  phase = 2
  arcProgress = Math.PI * 2
  sparksActivated = Infinity
  coreNeedsFullCircle = true
  if (contentRef.value) contentRef.value.style.visibility = 'visible'
  if (canvasRef.value) canvasRef.value.style.visibility = 'visible'
  if (contentOverlayRef.value) contentOverlayRef.value.style.opacity = '0'
}

/** Skip zoom animation to end (fires onComplete which navigates or settles) */
function skipZoomToEnd() {
  const tl = zoomTl
  if (tl) {
    zoomTl = null  // clear first to prevent re-entry from onComplete
    tl.progress(1)
    tl.kill()
  }
}

/** Cancel zoom and snap back to phase 2 (portal ready) */
function cancelZoomToPhase2() {
  zoomTl?.kill()
  zoomTl = null
  isZooming = false
  // Restore phase 2 resting state
  phase = 2
  arcProgress = Math.PI * 2
  sparksActivated = Infinity
  coreNeedsFullCircle = true
  const clipRadius = computeClipRadius()
  if (contentRef.value) {
    contentRef.value.style.visibility = 'visible'
    gsap.set(contentRef.value, {
      scale: CONTENT_SCALE_INITIAL,
      clipPath: `circle(${clipRadius}px at 50% 50%)`,
    })
  }
  if (canvasRef.value) {
    canvasRef.value.style.visibility = 'visible'
    canvasRef.value.style.opacity = '1'
  }
  if (contentOverlayRef.value) contentOverlayRef.value.style.opacity = '0'
  if (portalGroup) portalGroup.scale.setScalar(1)
  interceptActive = true
}

// --- Navigation interception ---

const FORWARD_KEYS = ['ArrowRight', 'ArrowDown', ' ', 'Enter', 'PageDown']
const BACKWARD_KEYS = ['ArrowLeft', 'ArrowUp', 'PageUp']

function blockEvent(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()
}

function onKeydown(e: KeyboardEvent) {
  if (!interceptActive) return
  const isForward = FORWARD_KEYS.includes(e.key)
  const isBackward = BACKWARD_KEYS.includes(e.key)
  if (!isForward && !isBackward) return

  // In phase 0, let Slidev handle v-clicks
  if (phase === 0 && isForward && nav.clicks.value < nav.clicksTotal.value) return
  if (phase === 0 && isBackward && nav.clicks.value > 0) return

  // Block the event for all other states (including mid-animation)
  blockEvent(e)

  // During zoom, same-direction skips to end, opposite cancels back to phase 2
  if (isZooming) {
    if (isZoomForward) {
      // Forward zoom: forward skips to next slide, backward cancels to phase 2
      if (isForward) skipZoomToEnd()
      else cancelZoomToPhase2()
    } else {
      // Reverse entrance: forward cancels and goes to next slide, backward skips to phase 2
      if (isForward) {
        zoomTl?.kill()
        zoomTl = null
        isZooming = false
        interceptActive = false
        nav.nextSlide()
        resetState()
      } else {
        skipZoomToEnd()
      }
    }
    return
  }
  if (isForward) advancePhase()
  else retreatPhase()
}

function onClickCapture(e: MouseEvent) {
  if (!interceptActive) return
  const target = e.target as HTMLElement
  if (target.closest('.slidev-nav, nav, button, a')) return

  // In phase 0, let Slidev handle v-clicks
  if (phase === 0 && nav.clicks.value < nav.clicksTotal.value) return

  // Block the event for all other states (including mid-animation)
  blockEvent(e)

  if (isZooming) {
    if (isZoomForward) {
      skipZoomToEnd()
    } else {
      // Reverse entrance: click (forward) goes back to next slide
      zoomTl?.kill()
      zoomTl = null
      isZooming = false
      interceptActive = false
      nav.nextSlide()
      resetState()
    }
    return
  }
  advancePhase()
}

function applyProgress(p: number, content: HTMLElement, initialClipRadius: number, maxRadius: number) {
  const ringScale = 1 + (RING_SCALE_END - 1) * p
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
  // Show canvas layer for sparks (content stays hidden until arc nears completion)
  if (canvasRef.value) canvasRef.value.style.visibility = 'visible'
  const proxy = { arc: 0 }
  creationTl = gsap.timeline({
    onComplete: () => { phase = 2; sparksActivated = Infinity; coreNeedsFullCircle = true },
  })
  // Draw the arc CCW from top
  creationTl.to(proxy, {
    arc: Math.PI * 2,
    duration: CREATION_DURATION,
    ease: 'power2.inOut',
    onUpdate: () => { arcProgress = proxy.arc },
  })
  // Show portal content and immediately start fading overlay to reveal next slide
  creationTl.call(() => {
    if (contentRef.value) contentRef.value.style.visibility = 'visible'
  }, [], CONTENT_REVEAL_TIME)
  if (contentOverlayRef.value) {
    creationTl.to(contentOverlayRef.value, {
      opacity: 0, duration: 1.0, ease: 'power2.out',
    }, CONTENT_REVEAL_TIME)
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
  // Fade content back to black, then hide the circle so it doesn't show during arc unwind
  if (contentOverlayRef.value) {
    creationTl.to(contentOverlayRef.value, {
      opacity: 1, duration: 0.8, ease: 'power2.in',
    }, 0)
  }
  creationTl.call(() => {
    if (contentRef.value) contentRef.value.style.visibility = 'hidden'
  }, [], 0.8)
  creationTl.to(proxy, {
    arc: 0,
    duration: CREATION_DURATION,
    ease: 'power2.inOut',
    onUpdate: () => { arcProgress = proxy.arc },
  }, 0)
}

function playZoom(direction: 'forward') {
  if (isZooming || !stageRef.value || !contentRef.value) return
  isZooming = true
  isZoomForward = true

  const stage = stageRef.value
  const maxRadius = Math.hypot(stage.offsetWidth, stage.offsetHeight) / 2

  const initialClipRadius = computeClipRadius()
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
    duration: ZOOM_FORWARD_DURATION,
    ease: 'expo.in',
    onUpdate: () => applyProgress(proxy.progress, content, initialClipRadius, maxRadius),
  }, 0)
}

function playReverseEntrance() {
  if (!stageRef.value || !contentRef.value) return
  isZooming = true
  isZoomForward = false
  interceptActive = true  // block events during reverse zoom

  // Skip to phase 2 — portal fully formed
  phase = 2
  arcProgress = Math.PI * 2
  sparksActivated = Infinity // all sparks active
  coreNeedsFullCircle = true
  if (contentOverlayRef.value) contentOverlayRef.value.style.opacity = '0'
  // Show portal layers (hidden in phase 0)
  if (contentRef.value) contentRef.value.style.visibility = 'visible'
  if (canvasRef.value) canvasRef.value.style.visibility = 'visible'
  resetPortalVisuals?.() // ensure haze is visible for phase 2

  const stage = stageRef.value
  const maxRadius = Math.hypot(stage.offsetWidth, stage.offsetHeight) / 2
  const initialClipRadius = computeClipRadius()
  const content = contentRef.value

  // Start at full-screen state
  const proxy = { progress: 1 }
  applyProgress(1, content, initialClipRadius, maxRadius)

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
      const clipRadius = computeClipRadius()
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
    duration: ZOOM_REVERSE_DURATION,
    ease: 'expo.out',
    onUpdate: () => applyProgress(proxy.progress, content, initialClipRadius, maxRadius),
  }, 0)
}

function resetState() {
  const clipRadius = computeClipRadius()
  if (contentRef.value) {
    gsap.set(contentRef.value, {
      scale: CONTENT_SCALE_INITIAL,
      clipPath: `circle(${clipRadius}px at 50% 50%)`,
    })
    contentRef.value.style.visibility = 'hidden'
  }
  if (portalGroup) {
    portalGroup.scale.setScalar(1)
  }
  if (canvasRef.value) {
    canvasRef.value.style.opacity = '1'
    canvasRef.value.style.visibility = 'hidden'
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
  isZoomForward = false
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
  const trailMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const trailMesh = new THREE.LineSegments(trailGeo, trailMat)
  trailMesh.frustumCulled = false
  portalGroup.add(trailMesh)

  // Ember heads
  const emberPositions = new Float32Array(SPARK_COUNT * 3)
  const emberGeo = new THREE.BufferGeometry()
  emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3))
  const emberMat = new THREE.PointsMaterial({
    map: glowTex,
    color: 0xee8811,
    size: 0.045,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const emberMesh = new THREE.Points(emberGeo, emberMat)
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
  const coreMat = new THREE.PointsMaterial({
    map: glowTex, color: 0xee8811, size: 0.06,
    transparent: true, opacity: 0.7,
    blending: THREE.AdditiveBlending, depthWrite: false,
  })
  const coreParticles = new THREE.Points(coreGeo, coreMat)
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

  // --- Disposal callback for cleanup ---
  disposeThreeObjects = () => {
    trailGeo.dispose()
    trailMat.dispose()
    emberGeo.dispose()
    emberMat.dispose()
    coreGeo.dispose()
    coreMat.dispose()
    glowTex.dispose()
    hazeTex.dispose()
    hazeMat.dispose()
    renderTarget.dispose()
  }

  function animate() {
    const t = performance.now() * 0.001
    const dt = Math.min(t - lastTime, 0.05)
    lastTime = t

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
  disposeThreeObjects?.()
  disposeThreeObjects = null
  resetPortalVisuals = null
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
        clipPath: `circle(${computeClipRadius()}px at 50% 50%)`,
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
  background: transparent;
}

.portal-content {
  position: absolute;
  inset: 0;
  z-index: 2;
  transform-origin: center center;
  will-change: transform, clip-path;
  visibility: hidden;
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
  z-index: 3;
  pointer-events: none;
}

.portal-canvas-full {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  visibility: hidden;
}

.portal-canvas-full canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
