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
import gsap from 'gsap'

const props = withDefaults(defineProps<{
  ringSize?: number
  /** Override which slide to show through the portal (default: current + 1) */
  nextSlide?: number
}>(), {
  ringSize: 360,
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
const nav = useNav()
let animationId = 0
let renderer: THREE.WebGLRenderer | null = null
let isZooming = false
let interceptActive = false
let zoomTl: gsap.core.Timeline | null = null

// Content renders at near-full scale — the portal is a peephole, not a miniature.
// Starts slightly pulled back so advancing feels like "entering" the slide.
const CONTENT_SCALE_INITIAL = 0.95
const CONTENT_SCALE_FINAL = 1

// --- Navigation interception ---

function onKeydown(e: KeyboardEvent) {
  if (!interceptActive || isZooming) return
  if (['ArrowRight', 'ArrowDown', 'Space', 'Enter', 'PageDown'].includes(e.key)) {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    playZoom('forward')
  }
}

function onClickCapture(e: MouseEvent) {
  if (!interceptActive || isZooming) return
  const target = e.target as HTMLElement
  if (target.closest('.slidev-nav, nav, button, a')) return
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()
  playZoom('forward')
}

function applyProgress(p: number, content: HTMLElement, ring: HTMLElement, initialClipRadius: number, ringScaleEnd: number, maxRadius: number) {
  const ringScale = 1 + (ringScaleEnd - 1) * p
  const clipRadius = Math.min(initialClipRadius * ringScale, maxRadius)
  const contentScale = CONTENT_SCALE_INITIAL + (CONTENT_SCALE_FINAL - CONTENT_SCALE_INITIAL) * p

  content.style.transform = `scale(${contentScale})`
  content.style.clipPath = `circle(${clipRadius}px at 50% 50%)`
  ring.style.transform = `translate(-50%, -50%) scale(${ringScale})`
  ring.style.opacity = `${Math.max(0, 1 - p * p * p * 2.5)}`
}

function playZoom(direction: 'forward') {
  if (isZooming || !stageRef.value || !contentRef.value || !ringRef.value) return
  isZooming = true

  const stage = stageRef.value
  const maxRadius = Math.hypot(stage.offsetWidth, stage.offsetHeight) / 2

  const initialClipRadius = (props.ringSize * 0.32) / CONTENT_SCALE_INITIAL
  const ringScaleEnd = 14
  const content = contentRef.value
  const ring = ringRef.value
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
    onUpdate: () => applyProgress(proxy.progress, content, ring, initialClipRadius, ringScaleEnd, maxRadius),
  }, 0)
}

function playReverseEntrance() {
  if (!stageRef.value || !contentRef.value || !ringRef.value) return
  isZooming = true
  interceptActive = false

  const stage = stageRef.value
  const maxRadius = Math.hypot(stage.offsetWidth, stage.offsetHeight) / 2
  const initialClipRadius = (props.ringSize * 0.32) / CONTENT_SCALE_INITIAL
  const ringScaleEnd = 14
  const content = contentRef.value
  const ring = ringRef.value

  // Start at full-screen state
  const proxy = { progress: 1 }
  applyProgress(1, content, ring, initialClipRadius, ringScaleEnd, maxRadius)

  zoomTl = gsap.timeline({
    onComplete: () => {
      resetState()
      interceptActive = true
    },
  })

  // Animate back to portal resting state — fast at first then decelerates
  zoomTl.to(proxy, {
    progress: 0,
    duration: 2.0,
    ease: 'expo.out',
    onUpdate: () => applyProgress(proxy.progress, content, ring, initialClipRadius, ringScaleEnd, maxRadius),
  }, 0)
}

function resetState() {
  // Clip radius matches the portal ring's inner visual radius on screen.
  // The torus inner edge (~radius 1.1) maps to roughly ringSize * 0.32 in screen px.
  // Divide by initial scale so the circle aligns correctly in element coordinates.
  const clipRadius = (props.ringSize * 0.32) / CONTENT_SCALE_INITIAL
  if (contentRef.value) {
    gsap.set(contentRef.value, {
      scale: CONTENT_SCALE_INITIAL,
      clipPath: `circle(${clipRadius}px at 50% 50%)`,
    })
  }
  if (ringRef.value) {
    gsap.set(ringRef.value, { scale: 1, opacity: 1 })
  }
  isZooming = false
  zoomTl = null
}

onSlideEnter(async () => {
  window.addEventListener('keydown', onKeydown, { capture: true })
  window.addEventListener('click', onClickCapture, { capture: true })

  if (nav.navDirection.value < 0) {
    // Entered from the next slide (backward navigation)
    // Wait for the SlideContainer content to render before animating
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

onMounted(() => {
  const el = canvasRef.value
  if (!el) return

  const dpr = 2
  const w = props.ringSize
  const h = props.ringSize

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
  camera.position.z = 4

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: false })
  renderer.setSize(w, h)
  renderer.setPixelRatio(dpr)
  renderer.setClearColor(0x000000, 0)
  el.appendChild(renderer.domElement)

  const portalGroup = new THREE.Group()
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

  // --- Spark emitter: sparks fly off a spinning ring like a sparkler on a rope ---
  // Each spark is born on the ring, inherits tangential velocity, flies outward, fades, dies, respawns.

  const glowTex = createGlowTexture()
  const RING_SPEED = 3.5         // ring rotation speed (rad/s) — fast spinning
  const RING_RADIUS = 1.15       // where sparks emit from
  const SPARK_COUNT = 6000
  const TRAIL_LEN = 0.18         // trail length in seconds (how far back the tail reaches)

  // Per-spark state
  const sparkX = new Float32Array(SPARK_COUNT)
  const sparkY = new Float32Array(SPARK_COUNT)
  const sparkVx = new Float32Array(SPARK_COUNT)
  const sparkVy = new Float32Array(SPARK_COUNT)
  const sparkAge = new Float32Array(SPARK_COUNT)
  const sparkMaxAge = new Float32Array(SPARK_COUNT)
  const sparkZ = new Float32Array(SPARK_COUNT)

  function spawnSpark(i: number, t: number) {
    // Spawn at a random point on the ring at its current rotation
    const ringAngle = t * RING_SPEED + Math.random() * Math.PI * 2
    const r = RING_RADIUS + (Math.random() - 0.5) * 0.06
    sparkX[i] = Math.cos(ringAngle) * r
    sparkY[i] = Math.sin(ringAngle) * r
    sparkZ[i] = (Math.random() - 0.5) * 0.08

    // Velocity: mostly tangential, gentle radial push so sparks hug the ring
    const tangentSpeed = RING_SPEED * r
    const tx = -Math.sin(ringAngle)
    const ty = Math.cos(ringAngle)
    const rx = Math.cos(ringAngle)
    const ry = Math.sin(ringAngle)
    const radialKick = 0.1 + Math.random() * 0.3 // gentle outward push
    const jitter = (Math.random() - 0.5) * 0.2
    sparkVx[i] = tx * tangentSpeed * (0.15 + Math.random() * 0.15) + rx * radialKick + jitter
    sparkVy[i] = ty * tangentSpeed * (0.15 + Math.random() * 0.15) + ry * radialKick + jitter

    sparkAge[i] = 0
    sparkMaxAge[i] = 0.12 + Math.random() * 0.35 // short lives, stay close to ring
  }

  // Initialize all sparks with staggered ages so the ring is pre-filled
  for (let i = 0; i < SPARK_COUNT; i++) {
    spawnSpark(i, 0)
    sparkAge[i] = Math.random() * sparkMaxAge[i] // pre-age
    // Advance position by age
    sparkX[i] += sparkVx[i] * sparkAge[i]
    sparkY[i] += sparkVy[i] * sparkAge[i]
  }

  // Trail line segments: head (current pos) → tail (pos - velocity * TRAIL_LEN)
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
  portalGroup.add(trailMesh)

  // Ember heads (glowing point at each spark's current position)
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
  portalGroup.add(emberMesh)

  // Core glow band along the ring (stays on the ring, bright gold)
  const coreCount = 800
  const corePositions = new Float32Array(coreCount * 3)
  for (let i = 0; i < coreCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = RING_RADIUS + (Math.random() - 0.5) * 0.06
    corePositions[i * 3] = Math.cos(angle) * r
    corePositions[i * 3 + 1] = Math.sin(angle) * r
    corePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.05
  }
  const coreGeo = new THREE.BufferGeometry()
  coreGeo.setAttribute('position', new THREE.BufferAttribute(corePositions, 3))
  const coreParticles = new THREE.Points(coreGeo, new THREE.PointsMaterial({
    map: glowTex, color: 0xee8811, size: 0.06,
    transparent: true, opacity: 0.7,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }))
  portalGroup.add(coreParticles)

  // --- Red haze behind the portal ring ---
  const hazeSize = 256
  const hazeCanvas = document.createElement('canvas')
  hazeCanvas.width = hazeSize
  hazeCanvas.height = hazeSize
  const hazeCtx = hazeCanvas.getContext('2d')!
  // Ring-shaped radial gradient: transparent center, red around ring radius, fade out
  const hazeCx = hazeSize / 2
  const hazeGrad = hazeCtx.createRadialGradient(hazeCx, hazeCx, 0, hazeCx, hazeCx, hazeCx)
  hazeGrad.addColorStop(0, 'rgba(0, 0, 0, 0)')          // transparent center
  hazeGrad.addColorStop(0.35, 'rgba(60, 8, 0, 0)')       // still transparent approaching ring
  hazeGrad.addColorStop(0.52, 'rgba(120, 25, 2, 0.35)')  // deep red at ring
  hazeGrad.addColorStop(0.65, 'rgba(80, 12, 0, 0.2)')    // red fading outward
  hazeGrad.addColorStop(0.85, 'rgba(40, 5, 0, 0.06)')    // dim red
  hazeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')           // transparent edge
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
  hazeSprite.scale.set(5.5, 5.5, 1) // large enough to extend well past the ring
  hazeSprite.position.z = -0.1 // slightly behind the sparks
  portalGroup.add(hazeSprite)

  let lastTime = performance.now() * 0.001

  function animate() {
    const t = performance.now() * 0.001
    const dt = Math.min(t - lastTime, 0.05) // cap delta to avoid explosion on tab switch
    lastTime = t

    // Rotate torus rings (visual only, slower than spark emission)
    torus.rotation.z = t * 0.5
    inner.rotation.z = -t * 0.36 + 0.3
    outer.rotation.z = t * 0.2
    outerGlow.rotation.z = -t * 0.16

    // Core glow rotates with the ring
    coreParticles.rotation.z = t * RING_SPEED

    // Update sparks
    const tPos = trailGeo.attributes.position.array as Float32Array
    const tCol = trailGeo.attributes.color.array as Float32Array
    const ePos = emberGeo.attributes.position.array as Float32Array

    for (let i = 0; i < SPARK_COUNT; i++) {
      sparkAge[i] += dt

      // Respawn dead sparks
      if (sparkAge[i] >= sparkMaxAge[i]) {
        spawnSpark(i, t)
      }

      // Advance position
      sparkX[i] += sparkVx[i] * dt
      sparkY[i] += sparkVy[i] * dt

      // Strong drag so sparks stay near the ring
      sparkVx[i] *= (1 - 3.0 * dt)
      sparkVy[i] *= (1 - 3.0 * dt)

      const life = sparkAge[i] / sparkMaxAge[i] // 0→1

      // Head position (current)
      const hx = sparkX[i]
      const hy = sparkY[i]
      const hz = sparkZ[i]
      // Tail position (where it was TRAIL_LEN seconds ago)
      const tailX = hx - sparkVx[i] * TRAIL_LEN
      const tailY = hy - sparkVy[i] * TRAIL_LEN

      // Trail: head = vertex 0, tail = vertex 1
      tPos[i * 6] = hx
      tPos[i * 6 + 1] = hy
      tPos[i * 6 + 2] = hz
      tPos[i * 6 + 3] = tailX
      tPos[i * 6 + 4] = tailY
      tPos[i * 6 + 5] = hz

      // Color: distance from ring drives orange→red hue shift, age drives fade to black
      const dist = Math.sqrt(hx * hx + hy * hy)
      const distFromRing = Math.max(0, dist - RING_RADIUS)
      // Hue shift: 0 at ring (orange), 1 at ~0.15 units out (deep red)
      const rs = Math.min(1, distFromRing * 7.0)
      const fade = 1 - life * life // overall fade with age

      // Head: orange at ring, shifting to deep red further out
      // Lower base brightness so additive overlap reads as orange, not white
      tCol[i * 6]     = (0.6 - rs * 0.15) * fade   // R: stays high
      tCol[i * 6 + 1] = (0.25 - rs * 0.22) * fade  // G: drops fast → red
      tCol[i * 6 + 2] = (0.02 - rs * 0.02) * fade  // B: near zero
      // Tail: one step redder + dimmer than head
      const trs = Math.min(1, rs + 0.4)
      const tailFade = fade * 0.6
      tCol[i * 6 + 3] = (0.5 - trs * 0.15) * tailFade
      tCol[i * 6 + 4] = (0.1 - trs * 0.09) * tailFade
      tCol[i * 6 + 5] = 0.0

      // Ember at head position
      ePos[i * 3] = hx
      ePos[i * 3 + 1] = hy
      ePos[i * 3 + 2] = hz
    }

    trailGeo.attributes.position.needsUpdate = true
    trailGeo.attributes.color.needsUpdate = true
    emberGeo.attributes.position.needsUpdate = true

    renderer!.render(scene, camera)
    animationId = requestAnimationFrame(animate)
  }

  animate()
})

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
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
        clipPath: `circle(${(ringSize * 0.32) / CONTENT_SCALE_INITIAL}px at 50% 50%)`,
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
    </div>

    <!-- Three.js ring, centered, animates independently -->
    <div
      ref="ringRef"
      class="portal-ring"
      :style="{ width: ringSize + 'px', height: ringSize + 'px' }"
    >
      <div ref="canvasRef" class="portal-canvas" />
    </div>
  </div>
</template>

<style scoped>
.portal-stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #0a0a0f;
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

.portal-canvas {
  width: 100%;
  height: 100%;
}

.portal-canvas canvas {
  display: block;
}
</style>
