import * as THREE from 'three'

export interface PortalState {
  phase: 0 | 1 | 2 | 3
  arcProgress: number
  sparksActivated: number
  coreNeedsFullCircle: boolean
}

export interface PortalSceneApi {
  init(el: HTMLDivElement, width: number, height: number): void
  resetVisuals(): void
  dispose(): void
  pause(): void
  resume(): void
  getPortalGroup(): THREE.Group | null
  getRenderer(): THREE.WebGLRenderer | null
}

export interface PortalSceneOpts {
  ringSize: number
  ground: boolean
  sparks: boolean
  core: boolean
  haze: boolean
  bloom: boolean
  ringSpeed: number
  trailLen: number
  bloomStrength: number
  bloomRadius: number
  bloomThreshold: number
  coreSize: number
  emberSize: number
  hazeIntensity: number
  groundY: number
  groundDim: number
}

export const PORTAL_SCENE_DEFAULTS: Omit<PortalSceneOpts, 'ringSize'>

export function createPortalScene(state: PortalState, opts: PortalSceneOpts): PortalSceneApi
export function usePortalScene(state: PortalState, opts: PortalSceneOpts): PortalSceneApi
