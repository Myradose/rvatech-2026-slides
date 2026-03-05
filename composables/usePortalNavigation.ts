import type { PortalState } from './usePortalScene'

const FORWARD_KEYS = ['ArrowRight', 'ArrowDown', ' ', 'Enter', 'PageDown']
const BACKWARD_KEYS = ['ArrowLeft', 'ArrowUp', 'PageUp']

function blockEvent(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()
}

export interface PortalNavigationConfig {
  portalState: PortalState
  clicks: () => number
  clicksTotal: () => number
  isDebugElement: (target: EventTarget | null) => boolean
  getZoomState: () => { zooming: boolean; forward: boolean }
  onAdvance(): void
  onRetreat(): void
  onSkipZoom(): void
  onCancelZoom(): void
  onForwardDuringReverseZoom(): void
}

export function usePortalNavigation(config: PortalNavigationConfig) {
  let interceptActive = false

  function onKeydown(e: KeyboardEvent) {
    if (!interceptActive || config.isDebugElement(e.target)) return
    const isForward = FORWARD_KEYS.includes(e.key)
    const isBackward = BACKWARD_KEYS.includes(e.key)
    if (!isForward && !isBackward) return

    if (config.portalState.phase === 0 && isForward && config.clicks() < config.clicksTotal()) return
    if (config.portalState.phase === 0 && isBackward && config.clicks() > 0) return

    blockEvent(e)

    const zoom = config.getZoomState()
    if (zoom.zooming) {
      if (zoom.forward) {
        if (isForward) config.onSkipZoom()
        else config.onCancelZoom()
      } else {
        if (isForward) config.onForwardDuringReverseZoom()
        else config.onSkipZoom()
      }
      return
    }
    if (isForward) config.onAdvance()
    else config.onRetreat()
  }

  function onClickCapture(e: MouseEvent) {
    if (!interceptActive || config.isDebugElement(e.target)) return
    const target = e.target as HTMLElement
    if (target.closest('.slidev-nav, nav, button, a')) return

    if (config.portalState.phase === 0 && config.clicks() < config.clicksTotal()) return

    blockEvent(e)

    const zoom = config.getZoomState()
    if (zoom.zooming) {
      if (zoom.forward) config.onSkipZoom()
      else config.onForwardDuringReverseZoom()
      return
    }
    config.onAdvance()
  }

  function attach() {
    window.addEventListener('keydown', onKeydown, { capture: true })
    window.addEventListener('click', onClickCapture, { capture: true })
  }

  function detach() {
    interceptActive = false
    window.removeEventListener('keydown', onKeydown, { capture: true })
    window.removeEventListener('click', onClickCapture, { capture: true })
  }

  return {
    attach,
    detach,
    get interceptActive() { return interceptActive },
    set interceptActive(v: boolean) { interceptActive = v },
  }
}
