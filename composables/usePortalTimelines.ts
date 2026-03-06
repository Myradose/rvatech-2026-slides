import type { Ref } from 'vue'
import gsap from 'gsap'
import type { PortalState, PortalSceneApi } from './usePortalScene'

export const CONTENT_SCALE_INITIAL = 0.95
const CONTENT_SCALE_FINAL = 1
const CLIP_RADIUS_RATIO = 0.38
const RING_SCALE_END = 14
const CREATION_DURATION = 2.5
const CONTENT_REVEAL_TIME = 1.8
const ZOOM_FORWARD_DURATION = 2.8
const ZOOM_REVERSE_DURATION = 2.0

export interface PortalTimelineDeps {
  portalState: PortalState
  scene: PortalSceneApi
  stageRef: Ref<HTMLDivElement | undefined>
  contentRef: Ref<HTMLDivElement | undefined>
  canvasRef: Ref<HTMLDivElement | undefined>
  contentOverlayRef: Ref<HTMLDivElement | undefined>
  ringSize: number
  navigateNext(): void
  navigatePrev(): void
  setNavIntercept(v: boolean): void
  onProgress(p: number): void
  onStatusChange(status: string): void
}

export function usePortalTimelines(deps: PortalTimelineDeps) {
  const { portalState, scene } = deps

  let isZooming = false
  let isZoomForward = false
  let zoomTl: gsap.core.Timeline | null = null
  let creationTl: gsap.core.Timeline | null = null

  function computeClipRadius(): number {
    return (deps.ringSize * CLIP_RADIUS_RATIO) / CONTENT_SCALE_INITIAL
  }

  function updateStatus() {
    if (isZooming) {
      deps.onStatusChange(isZoomForward ? 'zooming in' : 'zooming out')
    } else {
      const labels = ['idle', 'creating', 'ready', 'reversing']
      deps.onStatusChange(labels[portalState.phase])
    }
  }

  function setPhase(p: 0 | 1 | 2 | 3) {
    portalState.phase = p
    if (p === 0 || p === 2) deps.onProgress(0)
    updateStatus()
  }

  function setZoom(zooming: boolean, forward = false) {
    isZooming = zooming
    isZoomForward = forward
    updateStatus()
  }

  function setReadyState() {
    setPhase(2)
    portalState.arcProgress = Math.PI * 2
    portalState.sparksActivated = Infinity
    portalState.coreNeedsFullCircle = true
  }

  function restoreReadyVisuals() {
    const clipRadius = computeClipRadius()
    if (deps.contentRef.value) {
      deps.contentRef.value.style.visibility = 'visible'
      gsap.set(deps.contentRef.value, {
        scale: CONTENT_SCALE_INITIAL,
        clipPath: `circle(${clipRadius}px at 50% 50%)`,
      })
    }
    if (deps.canvasRef.value) {
      deps.canvasRef.value.style.visibility = 'visible'
      deps.canvasRef.value.style.opacity = '1'
    }
    if (deps.contentOverlayRef.value) deps.contentOverlayRef.value.style.opacity = '0'
    scene.getPortalGroup()?.scale.setScalar(1)
  }

  function applyProgress(p: number, content: HTMLElement, initialClipRadius: number, maxRadius: number) {
    const ringScale = 1 + (RING_SCALE_END - 1) * p
    const clipRadius = Math.min(initialClipRadius * ringScale, maxRadius)
    const contentScale = CONTENT_SCALE_INITIAL + (CONTENT_SCALE_FINAL - CONTENT_SCALE_INITIAL) * p

    content.style.transform = `scale(${contentScale})`
    content.style.clipPath = `circle(${clipRadius}px at 50% 50%)`

    scene.getPortalGroup()?.scale.setScalar(ringScale)
    if (deps.canvasRef.value) {
      deps.canvasRef.value.style.opacity = `${Math.max(0, 1 - p * p * p * 2.5)}`
    }
  }

  function resetState() {
    const clipRadius = computeClipRadius()
    if (deps.contentRef.value) {
      gsap.set(deps.contentRef.value, {
        scale: CONTENT_SCALE_INITIAL,
        clipPath: `circle(${clipRadius}px at 50% 50%)`,
      })
      deps.contentRef.value.style.visibility = 'hidden'
    }
    scene.getPortalGroup()?.scale.setScalar(1)
    if (deps.canvasRef.value) {
      deps.canvasRef.value.style.opacity = '1'
      deps.canvasRef.value.style.visibility = 'hidden'
    }
    setPhase(0)
    deps.onProgress(0)
    portalState.arcProgress = 0
    portalState.sparksActivated = 0
    portalState.coreNeedsFullCircle = false
    if (deps.contentOverlayRef.value) deps.contentOverlayRef.value.style.opacity = '1'
    creationTl?.kill()
    creationTl = null
    setZoom(false)
    zoomTl = null
    scene.resetVisuals()
  }

  // --- Creation animation ---

  function playCreation() {
    portalState.arcProgress = 0
    portalState.sparksActivated = 0
    if (deps.canvasRef.value) deps.canvasRef.value.style.visibility = 'visible'
    const proxy = { arc: 0 }
    creationTl = gsap.timeline({
      onComplete: () => setReadyState(),
    })
    creationTl.to(proxy, {
      arc: Math.PI * 2,
      duration: CREATION_DURATION,
      ease: 'power2.inOut',
      onUpdate: () => { portalState.arcProgress = proxy.arc; deps.onProgress(proxy.arc / (Math.PI * 2)) },
    })
    creationTl.call(() => {
      if (deps.contentRef.value) deps.contentRef.value.style.visibility = 'visible'
    }, [], CONTENT_REVEAL_TIME)
    if (deps.contentOverlayRef.value) {
      creationTl.to(deps.contentOverlayRef.value, {
        opacity: 0, duration: 1.0, ease: 'power2.out',
      }, CONTENT_REVEAL_TIME)
    }
  }

  function playReverseCreation() {
    setPhase(3)
    const proxy = { arc: portalState.arcProgress }
    creationTl = gsap.timeline({
      onComplete: () => {
        resetState()
        deps.setNavIntercept(true)
      },
    })
    if (deps.contentOverlayRef.value) {
      creationTl.to(deps.contentOverlayRef.value, {
        opacity: 1, duration: 0.8, ease: 'power2.in',
      }, 0)
    }
    creationTl.call(() => {
      if (deps.contentRef.value) deps.contentRef.value.style.visibility = 'hidden'
    }, [], 0.8)
    creationTl.to(proxy, {
      arc: 0,
      duration: CREATION_DURATION,
      ease: 'power2.inOut',
      onUpdate: () => { portalState.arcProgress = proxy.arc; deps.onProgress(proxy.arc / (Math.PI * 2)) },
    }, 0)
  }

  function skipCreationToEnd() {
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
    setReadyState()
    restoreReadyVisuals()
  }

  // --- Zoom animation ---

  function playZoom() {
    if (isZooming || !deps.stageRef.value || !deps.contentRef.value) return
    setZoom(true, true)

    const stage = deps.stageRef.value
    const maxRadius = Math.hypot(stage.offsetWidth, stage.offsetHeight) / 2
    const initialClipRadius = computeClipRadius()
    const content = deps.contentRef.value
    const proxy = { progress: 0 }

    zoomTl = gsap.timeline({
      onComplete: () => {
        deps.setNavIntercept(false)
        deps.navigateNext()
        resetState()
      },
    })
    zoomTl.to(proxy, {
      progress: 1,
      duration: ZOOM_FORWARD_DURATION,
      ease: 'expo.in',
      onUpdate: () => { applyProgress(proxy.progress, content, initialClipRadius, maxRadius); deps.onProgress(proxy.progress) },
    }, 0)
  }

  function playReverseEntrance() {
    if (!deps.stageRef.value || !deps.contentRef.value) return
    setZoom(true, false)
    deps.setNavIntercept(true)

    setReadyState()
    restoreReadyVisuals()
    scene.resetVisuals()

    const stage = deps.stageRef.value
    const maxRadius = Math.hypot(stage.offsetWidth, stage.offsetHeight) / 2
    const initialClipRadius = computeClipRadius()
    const content = deps.contentRef.value

    const proxy = { progress: 1 }
    applyProgress(1, content, initialClipRadius, maxRadius)

    zoomTl = gsap.timeline({
      onComplete: () => {
        setZoom(false)
        zoomTl = null
        setReadyState()
        restoreReadyVisuals()
        deps.setNavIntercept(true)
      },
    })

    zoomTl.to(proxy, {
      progress: 0,
      duration: ZOOM_REVERSE_DURATION,
      ease: 'expo.out',
      onUpdate: () => { applyProgress(proxy.progress, content, initialClipRadius, maxRadius); deps.onProgress(proxy.progress) },
    }, 0)
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
    setZoom(false)
    setReadyState()
    restoreReadyVisuals()
    deps.setNavIntercept(true)
  }

  function forwardDuringReverseZoom() {
    zoomTl?.kill()
    zoomTl = null
    setZoom(false)
    deps.setNavIntercept(false)
    deps.navigateNext()
    resetState()
  }

  // --- Phase dispatchers ---

  function advancePhase() {
    if (portalState.phase === 0) { setPhase(1); playCreation() }
    else if (portalState.phase === 1) { skipCreationToEnd() }
    else if (portalState.phase === 2) { playZoom() }
    else if (portalState.phase === 3) { cancelReverseCreation() }
  }

  function retreatPhase() {
    if (portalState.phase === 2) { playReverseCreation() }
    else if (portalState.phase === 3) { skipCreationToEnd() }
    else if (portalState.phase === 1) {
      creationTl?.kill()
      creationTl = null
      resetState()
      deps.setNavIntercept(true)
    }
    else if (portalState.phase === 0) {
      deps.setNavIntercept(false)
      deps.navigatePrev()
    }
  }

  function getZoomState() {
    return { zooming: isZooming, forward: isZoomForward }
  }

  function killAll() {
    creationTl?.kill()
    creationTl = null
    zoomTl?.kill()
    zoomTl = null
    setZoom(false)
  }

  return {
    computeClipRadius,
    advancePhase,
    retreatPhase,
    playReverseEntrance,
    resetState,
    skipZoomToEnd,
    cancelZoomToPhase2,
    forwardDuringReverseZoom,
    getZoomState,
    killAll,
  }
}
