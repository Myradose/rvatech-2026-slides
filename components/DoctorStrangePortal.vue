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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
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
    playZoom()
  }
}

function onClickCapture(e: MouseEvent) {
  if (!interceptActive || isZooming) return
  const target = e.target as HTMLElement
  if (target.closest('.slidev-nav, nav, button, a')) return
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()
  playZoom()
}

function playZoom() {
  if (isZooming || !stageRef.value || !contentRef.value || !ringRef.value) return
  isZooming = true

  const stage = stageRef.value
  const maxRadius = Math.hypot(stage.offsetWidth, stage.offsetHeight) / 2

  // The clip must grow multiplicatively with the ring scale so they stay aligned.
  // We animate a single proxy and derive both clip + ring from it.
  const initialClipRadius = (props.ringSize * 0.285) / CONTENT_SCALE_INITIAL
  const ringScaleEnd = 12
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
    duration: 1.0,
    ease: 'power2.in',
    onUpdate: () => {
      const p = proxy.progress
      // Ring scale: 1 → 12
      const ringScale = 1 + (ringScaleEnd - 1) * p
      // Clip radius tracks ring's inner edge: grows at the same rate
      const clipRadius = Math.min(initialClipRadius * ringScale, maxRadius)
      // Content scale: subtle zoom in
      const contentScale = CONTENT_SCALE_INITIAL + (CONTENT_SCALE_FINAL - CONTENT_SCALE_INITIAL) * p

      content!.style.transform = `scale(${contentScale})`
      content!.style.clipPath = `circle(${clipRadius}px at 50% 50%)`
      ring!.style.transform = `translate(-50%, -50%) scale(${ringScale})`
      ring!.style.opacity = `${1 - p}`
    },
  }, 0)
}

function resetState() {
  // Clip radius matches the portal ring's inner visual radius on screen.
  // The torus inner edge (~radius 1.1) maps to roughly ringSize * 0.285 in screen px.
  // Divide by initial scale so the circle aligns correctly in element coordinates.
  const clipRadius = (props.ringSize * 0.285) / CONTENT_SCALE_INITIAL
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

onSlideEnter(() => {
  resetState()
  interceptActive = true
  window.addEventListener('keydown', onKeydown, { capture: true })
  window.addEventListener('click', onClickCapture, { capture: true })
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
  gradient.addColorStop(0, 'rgba(255, 220, 100, 0.9)')
  gradient.addColorStop(0.2, 'rgba(255, 160, 30, 0.6)')
  gradient.addColorStop(0.5, 'rgba(220, 80, 10, 0.25)')
  gradient.addColorStop(0.8, 'rgba(160, 30, 5, 0.08)')
  gradient.addColorStop(1, 'rgba(100, 10, 0, 0)')
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
    new THREE.MeshBasicMaterial({ color: 0xf59e0b }),
  )
  torus.visible = false // TEMP: hidden to preview sparks-only look
  portalGroup.add(torus)

  const inner = new THREE.Mesh(
    new THREE.TorusGeometry(1.12, 0.025, 32, 200),
    new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.7 }),
  )
  inner.visible = false // TEMP
  inner.rotation.z = 0.3
  portalGroup.add(inner)

  const outer = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.2, 32, 200),
    new THREE.MeshBasicMaterial({
      color: 0xf59e0b, transparent: true, opacity: 0.08,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }),
  )
  outer.visible = false // TEMP
  portalGroup.add(outer)

  const outerGlow = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.35, 32, 200),
    new THREE.MeshBasicMaterial({
      color: 0xf59e0b, transparent: true, opacity: 0.03,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }),
  )
  outerGlow.visible = false // TEMP
  portalGroup.add(outerGlow)

  // --- Spark system: tangential fiery streaks like the Doctor Strange portal ---
  // Sparks trail along the ring's tangent direction (CCW), with slight radial spread.
  // Multiple layers all rotating CCW at slightly different speeds for depth.

  const glowTex = createGlowTexture()

  const sparkLayers: {
    trailMesh: THREE.LineSegments
    trailGeo: THREE.BufferGeometry
    emberMesh: THREE.Points
    emberGeo: THREE.BufferGeometry
    count: number
    angles: Float32Array
    lengths: Float32Array
    baseRadii: Float32Array
    radialBias: Float32Array
    speeds: Float32Array
    phases: Float32Array
    rotSpeed: number
  }[] = []

  function createSparkLayer(count: number, rotSpeed: number, trailOpacity: number) {
    const trailPositions = new Float32Array(count * 2 * 3)
    const trailColors = new Float32Array(count * 2 * 3)
    const emberPositions = new Float32Array(count * 3)
    const angles = new Float32Array(count)
    const lengths = new Float32Array(count)
    const baseRadii = new Float32Array(count)
    const radialBias = new Float32Array(count)
    const speeds = new Float32Array(count)
    const phases = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const baseR = 1.12 + Math.random() * 0.08
      const r = Math.random()
      const len = r < 0.5 ? 0.06 + Math.random() * 0.18
        : r < 0.85 ? 0.15 + Math.random() * 0.35
        : 0.3 + Math.random() * 0.55

      angles[i] = angle
      lengths[i] = len
      baseRadii[i] = baseR
      radialBias[i] = 0.1 + Math.random() * 0.35
      speeds[i] = 0.8 + Math.random() * 2.5
      phases[i] = Math.random() * Math.PI * 2

      const z = (Math.random() - 0.5) * 0.12

      // Base point on the ring
      const bx = Math.cos(angle) * baseR
      const by = Math.sin(angle) * baseR
      trailPositions[i * 6] = bx
      trailPositions[i * 6 + 1] = by
      trailPositions[i * 6 + 2] = z

      // Tip: tangent + radial
      const tx = -Math.sin(angle)
      const ty = Math.cos(angle)
      const rx = Math.cos(angle)
      const ry = Math.sin(angle)
      const rb = radialBias[i]
      trailPositions[i * 6 + 3] = bx + (tx + rx * rb) * len
      trailPositions[i * 6 + 4] = by + (ty + ry * rb) * len
      trailPositions[i * 6 + 5] = z

      // Ember head at the base
      emberPositions[i * 3] = bx
      emberPositions[i * 3 + 1] = by
      emberPositions[i * 3 + 2] = z

      // Trail colors: base = orange (not gold), tip = deep red
      const heat = 0.7 + Math.random() * 0.3
      // Base: orange (transitions from the gold core quickly)
      trailColors[i * 6] = 1.0 * heat
      trailColors[i * 6 + 1] = 0.4 * heat
      trailColors[i * 6 + 2] = 0.02 * heat
      // Tip: deep red
      const tipHeat = 0.5 + Math.random() * 0.5
      trailColors[i * 6 + 3] = 0.8 * tipHeat
      trailColors[i * 6 + 4] = 0.08 * tipHeat
      trailColors[i * 6 + 5] = 0.0
    }

    // Trail lines (dimmer, just the streak)
    const trailGeo = new THREE.BufferGeometry()
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3))
    trailGeo.setAttribute('color', new THREE.BufferAttribute(trailColors, 3))
    const trailMesh = new THREE.LineSegments(trailGeo, new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: trailOpacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }))
    portalGroup.add(trailMesh)

    // Ember heads (bright glowing points at each spark base)
    const emberGeo = new THREE.BufferGeometry()
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3))
    const emberMesh = new THREE.Points(emberGeo, new THREE.PointsMaterial({
      map: glowTex,
      color: 0xff8811,
      size: 0.045 + Math.random() * 0.02,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }))
    portalGroup.add(emberMesh)

    sparkLayers.push({ trailMesh, trailGeo, emberMesh, emberGeo, count, angles, lengths, baseRadii, radialBias, speeds, phases, rotSpeed })
  }

  // 5 layers, all CCW, fast rotation
  createSparkLayer(2000, 0.7, 0.5)
  createSparkLayer(1800, 0.56, 0.4)
  createSparkLayer(1500, 0.84, 0.35)
  createSparkLayer(1200, 0.4, 0.3)
  createSparkLayer(1000, 1.0, 0.25)

  // --- Bright glowing core along the ring (hot white-gold band) ---
  const coreCount = 800
  const corePositions = new Float32Array(coreCount * 3)
  const coreSpeeds = new Float32Array(coreCount)
  for (let i = 0; i < coreCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = 1.15 + (Math.random() - 0.5) * 0.08
    corePositions[i * 3] = Math.cos(angle) * r
    corePositions[i * 3 + 1] = Math.sin(angle) * r
    corePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.08
    coreSpeeds[i] = 0.3 + Math.random() * 0.7
  }
  const coreGeo = new THREE.BufferGeometry()
  coreGeo.setAttribute('position', new THREE.BufferAttribute(corePositions, 3))
  const coreParticles = new THREE.Points(coreGeo, new THREE.PointsMaterial({
    map: glowTex, color: 0xffbb44, size: 0.09,
    transparent: true, opacity: 1.0,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }))
  portalGroup.add(coreParticles)

  // --- Outer red/orange glow halo (larger soft particles at wider radius) ---
  const redGlowCount = 500
  const redGlowPositions = new Float32Array(redGlowCount * 3)
  const redGlowSpeeds = new Float32Array(redGlowCount)
  for (let i = 0; i < redGlowCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = 1.15 + Math.random() * 0.2 // tighter around ring
    redGlowPositions[i * 3] = Math.cos(angle) * r
    redGlowPositions[i * 3 + 1] = Math.sin(angle) * r
    redGlowPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.1
    redGlowSpeeds[i] = 0.2 + Math.random() * 0.5
  }
  const redGlowGeo = new THREE.BufferGeometry()
  redGlowGeo.setAttribute('position', new THREE.BufferAttribute(redGlowPositions, 3))
  const redGlowParticles = new THREE.Points(redGlowGeo, new THREE.PointsMaterial({
    map: glowTex, color: 0xcc3300, size: 0.18,
    transparent: true, opacity: 0.6,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }))
  portalGroup.add(redGlowParticles)

  function animate() {
    const t = performance.now() * 0.001
    torus.rotation.z = t * 0.5
    inner.rotation.z = -t * 0.36 + 0.3
    outer.rotation.z = t * 0.2
    outerGlow.rotation.z = -t * 0.16

    // Animate all spark layers — flicker trails + ember heads
    for (const layer of sparkLayers) {
      const sPos = layer.trailGeo.attributes.position.array as Float32Array
      const sCol = layer.trailGeo.attributes.color.array as Float32Array
      for (let i = 0; i < layer.count; i++) {
        const angle = layer.angles[i]
        const phase = layer.phases[i]
        const speed = layer.speeds[i]
        const baseR = layer.baseRadii[i]
        const rb = layer.radialBias[i]

        // Flickering length
        const pulse = Math.sin(t * speed * 2.5 + phase)
        const lenMult = 0.3 + 0.7 * Math.max(0, pulse)
        const len = layer.lengths[i] * lenMult

        // Recompute tip from base using tangent + radial
        const bx = sPos[i * 6]
        const by = sPos[i * 6 + 1]
        const tx = -Math.sin(angle)
        const ty = Math.cos(angle)
        const rx = Math.cos(angle)
        const ry = Math.sin(angle)
        sPos[i * 6 + 3] = bx + (tx + rx * rb) * len
        sPos[i * 6 + 4] = by + (ty + ry * rb) * len

        // Animated tip: deep red
        const brightness = 0.4 + 0.6 * lenMult
        sCol[i * 6 + 3] = 0.8 * brightness
        sCol[i * 6 + 4] = 0.08 * brightness
        sCol[i * 6 + 5] = 0.0
      }
      layer.trailGeo.attributes.position.needsUpdate = true
      layer.trailGeo.attributes.color.needsUpdate = true
      layer.trailMesh.rotation.z = t * layer.rotSpeed
      layer.emberMesh.rotation.z = t * layer.rotSpeed
    }

    // Animate core particles
    coreParticles.rotation.z = t * 0.7
    const cPos = coreGeo.attributes.position.array as Float32Array
    for (let i = 0; i < coreCount; i++) {
      cPos[i * 3 + 2] = Math.sin(t * 2 * coreSpeeds[i] + i * 0.5) * 0.06
    }
    coreGeo.attributes.position.needsUpdate = true

    // Animate red outer glow
    redGlowParticles.rotation.z = t * 0.6
    const rPos = redGlowGeo.attributes.position.array as Float32Array
    for (let i = 0; i < redGlowCount; i++) {
      rPos[i * 3 + 2] = Math.sin(t * 1.5 * redGlowSpeeds[i] + i * 0.3) * 0.08
    }
    redGlowGeo.attributes.position.needsUpdate = true

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
        clipPath: `circle(${(ringSize * 0.285) / CONTENT_SCALE_INITIAL}px at 50% 50%)`,
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
