<script setup lang="ts">
/**
 * Doctor Strange Portal — fly-through transition to the next slide
 *
 * Uses Slidev's internal SlideContainer/SlideWrapper to render the ACTUAL
 * next slide inside the portal (no content duplication). On advance, GSAP
 * zooms through the portal ring into the next slide seamlessly.
 *
 * Three.js scene logic (renderer, particles, bloom) lives in usePortalScene().
 * This component owns the Slidev integration, phase state machine, navigation
 * interception, and GSAP timeline orchestration.
 *
 * Usage in slides.md:
 *   <DoctorStrangePortal />
 *   <DoctorStrangePortal :ring-size="400" :next-slide="15" />
 *   <DoctorStrangePortal :sparks="false" :haze="false" />  <!-- core-only minimal portal -->
 */
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useNav, useSlideContext, onSlideEnter, onSlideLeave } from '@slidev/client'
import SlideContainer from '@slidev/client/internals/SlideContainer.vue'
import SlideWrapper from '@slidev/client/internals/SlideWrapper.vue'
import { getSlide } from '@slidev/client/logic/slides.ts'
import { createFixedClicks } from '@slidev/client/composables/useClicks.ts'
import gsap from 'gsap'
import { usePortalScene, type PortalState, type PortalSceneOpts } from '../composables/usePortalScene'

const props = withDefaults(defineProps<{
  ringSize?: number
  /** Enable ground plane that sparks settle on */
  ground?: boolean
  /** Enable spark emitter with trails and ember heads */
  sparks?: boolean
  /** Enable core glow band around the ring */
  core?: boolean
  /** Enable red haze backdrop behind the ring */
  haze?: boolean
  /** Enable bloom post-processing */
  bloom?: boolean
  /** Show debug panel with runtime toggles */
  dev?: boolean
  /** Override which slide to show through the portal (default: current + 1) */
  nextSlide?: number
}>(), {
  ringSize: 360,
  ground: true,
  sparks: true,
  core: true,
  haze: true,
  bloom: true,
  dev: false,
})

// --- Slidev internals: render the next slide ---

const { $page } = useSlideContext()
const targetSlideNo = computed(() => props.nextSlide ?? $page.value + 1)
const nextRoute = computed(() => getSlide(targetSlideNo.value))
const nextClicksContext = computed(() =>
  nextRoute.value ? createFixedClicks(nextRoute.value, 0) : undefined,
)

// --- Constants ---

const CONTENT_SCALE_INITIAL = 0.95
const CONTENT_SCALE_FINAL = 1
const CLIP_RADIUS_RATIO = 0.38
const RING_SCALE_END = 14
const CREATION_DURATION = 2.5
const CONTENT_REVEAL_TIME = 1.8
const ZOOM_FORWARD_DURATION = 2.8
const ZOOM_REVERSE_DURATION = 2.0

// --- Refs & state ---

const stageRef = ref<HTMLDivElement>()
const contentRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLDivElement>()
const contentOverlayRef = ref<HTMLDivElement>()
const debugRef = ref<HTMLDivElement>()
const nav = useNav()
let isZooming = false
let isZoomForward = false
let interceptActive = false
let zoomTl: gsap.core.Timeline | null = null
let creationTl: gsap.core.Timeline | null = null

// Shared mutable state read by the composable's 60fps animation loop
const portalState: PortalState = {
  phase: 0,
  arcProgress: 0,
  sparksActivated: 0,
  coreNeedsFullCircle: false,
}

// Mutable opts object — composable reads these every frame.
// The debug panel (when dev=true) mutates this directly for live toggling.
const sceneOpts: PortalSceneOpts = reactive({
  ringSize: props.ringSize,
  ground: props.ground,
  sparks: props.sparks,
  core: props.core,
  haze: props.haze,
  bloom: props.bloom,
})

const scene = usePortalScene(portalState, sceneOpts)

const FEATURE_TOGGLES: { key: keyof PortalSceneOpts; label: string }[] = [
  { key: 'sparks', label: 'Sparks' },
  { key: 'core', label: 'Core' },
  { key: 'haze', label: 'Haze' },
  { key: 'bloom', label: 'Bloom' },
  { key: 'ground', label: 'Ground' },
]

// --- Derived helpers ---

function computeClipRadius(): number {
  return (props.ringSize * CLIP_RADIUS_RATIO) / CONTENT_SCALE_INITIAL
}

// --- Phase dispatchers ---

function advancePhase() {
  if (portalState.phase === 0) { portalState.phase = 1; playCreation() }
  else if (portalState.phase === 1) { skipCreationToEnd() }
  else if (portalState.phase === 2) { playZoom('forward') }
  else if (portalState.phase === 3) { cancelReverseCreation() }
}

function retreatPhase() {
  if (portalState.phase === 2) { playReverseCreation() }
  else if (portalState.phase === 3) { skipReverseCreationToEnd() }
  else if (portalState.phase === 1) {
    creationTl?.kill()
    creationTl = null
    resetState()
    interceptActive = true
  }
  else if (portalState.phase === 0) {
    interceptActive = false
    nav.prevSlide(true)
  }
}

function skipCreationToEnd() {
  const tl = creationTl
  if (tl) {
    creationTl = null
    tl.progress(1)
    tl.kill()
  }
}

function skipReverseCreationToEnd() {
  const tl = creationTl
  if (tl) {
    creationTl = null
    tl.progress(1)
    tl.kill()
  }
}

function cancelReverseCreation() {
  creationTl?.kill()
  creationTl = null
  portalState.phase = 2
  portalState.arcProgress = Math.PI * 2
  portalState.sparksActivated = Infinity
  portalState.coreNeedsFullCircle = true
  if (contentRef.value) contentRef.value.style.visibility = 'visible'
  if (canvasRef.value) canvasRef.value.style.visibility = 'visible'
  if (contentOverlayRef.value) contentOverlayRef.value.style.opacity = '0'
}

function skipZoomToEnd() {
  const tl = zoomTl
  if (tl) {
    zoomTl = null
    tl.progress(1)
    tl.kill()
  }
}

function cancelZoomToPhase2() {
  zoomTl?.kill()
  zoomTl = null
  isZooming = false
  portalState.phase = 2
  portalState.arcProgress = Math.PI * 2
  portalState.sparksActivated = Infinity
  portalState.coreNeedsFullCircle = true
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
  scene.getPortalGroup()?.scale.setScalar(1)
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

function isDebugEvent(e: Event): boolean {
  return !!debugRef.value?.contains(e.target as Node)
}

function onKeydown(e: KeyboardEvent) {
  if (!interceptActive || isDebugEvent(e)) return
  const isForward = FORWARD_KEYS.includes(e.key)
  const isBackward = BACKWARD_KEYS.includes(e.key)
  if (!isForward && !isBackward) return

  if (portalState.phase === 0 && isForward && nav.clicks.value < nav.clicksTotal.value) return
  if (portalState.phase === 0 && isBackward && nav.clicks.value > 0) return

  blockEvent(e)

  if (isZooming) {
    if (isZoomForward) {
      if (isForward) skipZoomToEnd()
      else cancelZoomToPhase2()
    } else {
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
  if (!interceptActive || isDebugEvent(e)) return
  const target = e.target as HTMLElement
  if (target.closest('.slidev-nav, nav, button, a')) return

  if (portalState.phase === 0 && nav.clicks.value < nav.clicksTotal.value) return

  blockEvent(e)

  if (isZooming) {
    if (isZoomForward) {
      skipZoomToEnd()
    } else {
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

  scene.getPortalGroup()?.scale.setScalar(ringScale)
  if (canvasRef.value) {
    canvasRef.value.style.opacity = `${Math.max(0, 1 - p * p * p * 2.5)}`
  }
}

// --- Creation animation ---

function playCreation() {
  portalState.arcProgress = 0
  portalState.sparksActivated = 0
  if (canvasRef.value) canvasRef.value.style.visibility = 'visible'
  const proxy = { arc: 0 }
  creationTl = gsap.timeline({
    onComplete: () => { portalState.phase = 2; portalState.sparksActivated = Infinity; portalState.coreNeedsFullCircle = true },
  })
  creationTl.to(proxy, {
    arc: Math.PI * 2,
    duration: CREATION_DURATION,
    ease: 'power2.inOut',
    onUpdate: () => { portalState.arcProgress = proxy.arc },
  })
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
  portalState.phase = 3
  const proxy = { arc: portalState.arcProgress }
  creationTl = gsap.timeline({
    onComplete: () => {
      resetState()
      interceptActive = true
    },
  })
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
    onUpdate: () => { portalState.arcProgress = proxy.arc },
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
  interceptActive = true

  portalState.phase = 2
  portalState.arcProgress = Math.PI * 2
  portalState.sparksActivated = Infinity
  portalState.coreNeedsFullCircle = true
  if (contentOverlayRef.value) contentOverlayRef.value.style.opacity = '0'
  if (contentRef.value) contentRef.value.style.visibility = 'visible'
  if (canvasRef.value) canvasRef.value.style.visibility = 'visible'
  scene.resetVisuals()

  const stage = stageRef.value
  const maxRadius = Math.hypot(stage.offsetWidth, stage.offsetHeight) / 2
  const initialClipRadius = computeClipRadius()
  const content = contentRef.value

  const proxy = { progress: 1 }
  applyProgress(1, content, initialClipRadius, maxRadius)

  zoomTl = gsap.timeline({
    onComplete: () => {
      isZooming = false
      zoomTl = null
      portalState.phase = 2
      portalState.arcProgress = Math.PI * 2
      portalState.sparksActivated = Infinity
      if (contentOverlayRef.value) contentOverlayRef.value.style.opacity = '0'
      const clipRadius = computeClipRadius()
      if (contentRef.value) {
        gsap.set(contentRef.value, {
          scale: CONTENT_SCALE_INITIAL,
          clipPath: `circle(${clipRadius}px at 50% 50%)`,
        })
      }
      scene.getPortalGroup()?.scale.setScalar(1)
      if (canvasRef.value) canvasRef.value.style.opacity = '1'
      interceptActive = true
    },
  })

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
  scene.getPortalGroup()?.scale.setScalar(1)
  if (canvasRef.value) {
    canvasRef.value.style.opacity = '1'
    canvasRef.value.style.visibility = 'hidden'
  }
  portalState.phase = 0
  portalState.arcProgress = 0
  portalState.sparksActivated = 0
  portalState.coreNeedsFullCircle = false
  if (contentOverlayRef.value) contentOverlayRef.value.style.opacity = '1'
  creationTl?.kill()
  creationTl = null
  isZooming = false
  isZoomForward = false
  zoomTl = null
  scene.resetVisuals()
}

onSlideEnter(async () => {
  window.addEventListener('keydown', onKeydown, { capture: true })
  window.addEventListener('click', onClickCapture, { capture: true })

  if (nav.navDirection.value < 0) {
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
  resetState()
  window.removeEventListener('keydown', onKeydown, { capture: true })
  window.removeEventListener('click', onClickCapture, { capture: true })
})

onMounted(() => {
  const el = canvasRef.value
  const stage = stageRef.value
  if (!el || !stage) return

  const w = stage.offsetWidth
  const h = stage.offsetHeight

  if (w > 0 && h > 0) {
    scene.init(el, w, h)
  } else {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        observer.disconnect()
        scene.init(el, entry.contentRect.width, entry.contentRect.height)
      }
    })
    observer.observe(stage)
  }
})

onBeforeUnmount(() => {
  creationTl?.kill()
  creationTl = null
  scene.dispose()
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

    <!-- Debug panel for live feature toggling -->
    <div v-if="props.dev" ref="debugRef" class="portal-debug">
      <div class="portal-debug-title">Portal Debug</div>
      <label v-for="toggle in FEATURE_TOGGLES" :key="toggle.key" class="portal-debug-toggle">
        <input
          type="checkbox"
          :checked="sceneOpts[toggle.key] as boolean"
          @change="(sceneOpts[toggle.key] as any) = ($event.target as HTMLInputElement).checked"
        />
        {{ toggle.label }}
      </label>
    </div>
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

.portal-debug {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 100;
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(255, 140, 40, 0.4);
  border-radius: 8px;
  padding: 10px 14px;
  font-family: monospace;
  font-size: 13px;
  color: #eee;
  pointer-events: auto;
  user-select: none;
}

.portal-debug-title {
  font-weight: bold;
  color: rgba(255, 140, 40, 0.9);
  margin-bottom: 6px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.portal-debug-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
  cursor: pointer;
}

.portal-debug-toggle input {
  accent-color: #ee8811;
  cursor: pointer;
}
</style>
