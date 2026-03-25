<script setup lang="ts">
/**
 * Doctor Strange Portal — fly-through transition to the next slide
 *
 * Uses Slidev's internal SlideContainer/SlideWrapper to render the ACTUAL
 * next slide inside the portal (no content duplication). On advance, GSAP
 * zooms through the portal ring into the next slide seamlessly.
 *
 * Three.js scene logic (renderer, particles, bloom) lives in usePortalScene().
 * Navigation interception lives in usePortalNavigation().
 * GSAP timeline orchestration lives in usePortalTimelines().
 * This component owns the Slidev integration and wires the composables together.
 *
 * Usage in slides.md:
 *   <DoctorStrangePortal />
 *   <DoctorStrangePortal :ring-size="400" :next-slide="15" />
 *   <DoctorStrangePortal :sparks="false" :haze="false" />  <!-- core-only minimal portal -->
 */
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useNav, useSlideContext, onSlideEnter, onSlideLeave, sharedState } from '@slidev/client'
import SlideContainer from '@slidev/client/internals/SlideContainer.vue'
import SlideWrapper from '@slidev/client/internals/SlideWrapper.vue'
import { getSlide } from '@slidev/client/logic/slides.ts'
import { createFixedClicks } from '@slidev/client/composables/useClicks.ts'
import { usePortalScene, PORTAL_SCENE_DEFAULTS, type PortalState, type PortalSceneOpts } from '../composables/usePortalScene'
import { usePortalNavigation } from '../composables/usePortalNavigation'
import { usePortalTimelines, CONTENT_SCALE_INITIAL } from '../composables/usePortalTimelines'
import PortalDebugPanel from './PortalDebugPanel.vue'

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

const { $page, $renderContext } = useSlideContext()
const isInteractive = computed(() => ['slide', 'presenter'].includes($renderContext.value))
const targetSlideNo = computed(() => props.nextSlide ?? $page.value + 1)
const nextRoute = computed(() => getSlide(targetSlideNo.value))
const nextClicksContext = computed(() =>
  nextRoute.value ? createFixedClicks(nextRoute.value, 0) : undefined,
)

// --- Refs ---

const stageRef = ref<HTMLDivElement>()
const contentRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLDivElement>()
const contentOverlayRef = ref<HTMLDivElement>()
const debugPanelRef = ref<InstanceType<typeof PortalDebugPanel>>()
const nav = useNav()

// Shared mutable state read by the composable's 60fps animation loop
const portalState: PortalState = {
  phase: 0,
  arcProgress: 0,
  sparksActivated: 0,
  coreNeedsFullCircle: false,
}

// Reactive status for the debug panel (avoids making portalState reactive)
const debugStatus = ref('idle')

// Mutable opts object — composable reads these every frame.
// The debug panel (when dev=true) mutates this directly for live toggling.
const sceneOpts: PortalSceneOpts = reactive({
  ...PORTAL_SCENE_DEFAULTS,
  ringSize: props.ringSize,
  ground: props.ground,
  sparks: props.sparks,
  core: props.core,
  haze: props.haze,
  bloom: props.bloom,
  dpr: 2,
})

const scene = usePortalScene(portalState, sceneOpts)

// --- Multi-window presenter sync ---
// In presenter mode with two windows (presenter + audience), the portal
// intercepts keyboard events in the presenter window. The audience window
// never receives those events. We sync animation commands through Slidev's
// sharedState so the audience window plays the same animations.

const isDriver = computed(() => $renderContext.value === 'presenter')
let followingSync = false
let lastSyncT = Date.now()

function syncCommand(action: string) {
  if (!isDriver.value) return
  ;(sharedState as any).portalCmd = { slide: $page.value, action, t: Date.now() }
}

// --- Timeline orchestration ---

const timelines = usePortalTimelines({
  portalState,
  scene,
  stageRef,
  contentRef,
  canvasRef,
  contentOverlayRef,
  ringSize: props.ringSize,
  navigateNext: () => { const skip = followingSync; followingSync = false; if (!skip) nav.nextSlide() },
  navigatePrev: () => { const skip = followingSync; followingSync = false; if (!skip) nav.prevSlide(true) },
  setNavIntercept: (v) => { navControl.interceptActive = v },
  onProgress: (p) => debugPanelRef.value?.setProgress(p),
  onStatusChange: (s) => { debugStatus.value = s },
})

// --- Navigation interception ---

const navControl = usePortalNavigation({
  portalState,
  clicks: () => nav.clicks.value,
  clicksTotal: () => nav.clicksTotal.value,
  isDebugElement: (target) => debugPanelRef.value?.containsElement(target as Node) ?? false,
  getZoomState: timelines.getZoomState,
  onAdvance: () => { timelines.advancePhase(); syncCommand('advance') },
  onRetreat: () => { timelines.retreatPhase(); syncCommand('retreat') },
  onSkipZoom: () => { timelines.skipZoomToEnd(); syncCommand('skipZoom') },
  onCancelZoom: () => { timelines.cancelZoomToPhase2(); syncCommand('cancelZoom') },
  onForwardDuringReverseZoom: () => { timelines.forwardDuringReverseZoom(); syncCommand('fwdRevZoom') },
})

// Watch for synced commands from the presenter window (audience window only)
watch(
  () => (sharedState as any).portalCmd?.t,
  () => {
    const cmd = (sharedState as any).portalCmd
    if (!cmd || cmd.slide !== $page.value || cmd.t <= lastSyncT || isDriver.value) return
    lastSyncT = cmd.t
    followingSync = true
    const actions: Record<string, (() => void) | undefined> = {
      advance: timelines.advancePhase,
      retreat: timelines.retreatPhase,
      skipZoom: timelines.skipZoomToEnd,
      cancelZoom: timelines.cancelZoomToPhase2,
      fwdRevZoom: timelines.forwardDuringReverseZoom,
    }
    actions[cmd.action]?.()
  },
)

// --- Lifecycle ---

onSlideEnter(async () => {
  if (!isInteractive.value) return
  navControl.attach()
  scene.resume()

  if (nav.navDirection.value < 0) {
    await nextTick()
    timelines.playReverseEntrance()
  } else {
    timelines.resetState()
    navControl.interceptActive = true
  }
})

onSlideLeave(() => {
  if (!isInteractive.value) return
  navControl.detach()
  timelines.killAll()
  scene.pause()
})

onMounted(() => {
  if (!isInteractive.value) return

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
  if (!isInteractive.value) return
  timelines.killAll()
  scene.dispose()
  navControl.detach()
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
        clipPath: `circle(${timelines.computeClipRadius()}px at 50% 50%)`,
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
    <PortalDebugPanel
      v-if="props.dev"
      ref="debugPanelRef"
      :status="debugStatus"
      :opts="sceneOpts"
    />
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
