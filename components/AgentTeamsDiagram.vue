<script setup lang="ts">
/**
 * AgentTeamsDiagram — 5-phase GSAP-animated team hierarchy diagram
 *
 * Single layout throughout. No layout swap. Side copies are absolutely positioned.
 *
 * Phase 1: Foundation (Human → Orchestrator → Agent A/B/C/D)
 * Phase 1.5: Roles Reveal (labels crossfade, all workers get text/icon emphasis, no glow)
 * Phase 2: Integrator Focus (F/B/D dim, Integrator gets full amber glow)
 * Phase 3: Escalation pulse (Integrator → Orchestrator → Human, then settles)
 * Phase 3b: Delegation flow (Human → Team Lead → Frontend/Backend/Database, green)
 * Phase 4: Morph + duplicate (~4s total)
 *   - Step 1 (0-1.2s): Boxes physically morph to mini-box size
 *   - Step 2 (1.3-2.0s): New Orchestrator pushes group down
 *   - Step 3 (2.1-2.7s): Left copy slides in
 *   - Step 4 (2.4-3.0s): Right copy slides in
 */
import { reactive, computed, watch, onMounted } from 'vue'
import { useNav, useSlideContext, onSlideEnter, onSlideLeave } from '@slidev/client'
import gsap from 'gsap'

const props = withDefaults(defineProps<{
  click?: number
  rolesRevealClick?: number
  rolesClick?: number
  escalationClick?: number
  delegationClick?: number
  teamsClick?: number
}>(), {
  click: 1,
  rolesRevealClick: 2,
  rolesClick: 3,
  escalationClick: 4,
  delegationClick: 5,
  teamsClick: 6,
})

const nav = useNav()
const { $renderContext } = useSlideContext()
const isInteractive = computed(() => ['slide', 'presenter'].includes($renderContext.value))
let activeTl: gsap.core.Timeline | null = null

type Phase = 'idle'
  | 'animatingPhase1' | 'phase1' | 'reversingPhase1'
  | 'animatingRolesReveal' | 'rolesReveal' | 'reversingRolesReveal'
  | 'animatingPhase2' | 'phase2' | 'reversingPhase2'
  | 'animatingEscalation' | 'escalationComplete' | 'reversingEscalation'
  | 'animatingDelegation' | 'delegationComplete' | 'reversingDelegation'
  | 'animatingTeams' | 'teams' | 'reversingTeams'
let phase: Phase = 'idle'

const state = reactive({
  diagramOpacity: 0,
  genericLabelOpacity: 1,
  roleLabelOpacity: 0,
  abbrevLabelOpacity: 0,
  integratorAccent: 0,
  pulseHuman: 0,
  pulseOrchestrator: 0,
  pulseIntegrator: 0,
  // Escalation line colors
  orchestratorGlow: 1,
  integratorDropFill: 0,
  barFill: 0,
  stemFill: 0,
  topConnectorFill: 0,
  // Phase 3b: Delegation flow (green, downward)
  greenHuman: 0,
  greenTopFill: 0,
  greenOrchestrator: 0,
  greenStemFill: 0,
  greenBarLeft: 0,       // green sweeps stem → F (left half of bar)
  greenBarRight: 0,      // green sweeps stem → D (right partial, not to I)
  greenWorkerDropFill: 0,
  greenWorkers: 0,
  redLineFade: 0,        // fades remaining red lines to gray after delegation
  colorFadeout: 0,       // fades all colored lines to gray (used in teams transition)
  // Roles Reveal — text/icon emphasis on all workers without border glow
  workerTextEmphasis: 0,
  // Phase 4 morph — drives dimensional changes on worker boxes
  morphProgress: 0, // 0 = full boxes, 1 = mini-box sized
  // Phase 4 push-down
  newOrchHeight: 0,
  newOrchestratorOpacity: 0,
  // Phase 4 side copies
  leftGroupOpacity: 0,
  leftGroupX: 80,
  leftGroupScale: 0.85,
  rightGroupOpacity: 0,
  rightGroupX: -80,
  rightGroupScale: 0.85,
  // Phase 4 branch connector (fades in with side copies)
  // New orchestrator glow (phase 4)
  newOrchestratorGlow: 0,
  // Legend (abbreviation key, bottom-center)
  legendOpacity: 0,
})

const workers = [
  { generic: 'Agent A', role: 'Frontend', abbrev: 'F' },
  { generic: 'Agent B', role: 'Backend', abbrev: 'B' },
  { generic: 'Agent C', role: 'Database', abbrev: 'D' },
  { generic: 'Agent D', role: 'Integrator', abbrev: 'I' },
]

const abbrevs = ['F', 'B', 'D', 'I']

// --- Morph-derived styles (morphProgress 0→1) ---

function workerBoxMorphStyle(idx: number): Record<string, string> {
  const m = state.morphProgress
  const style: Record<string, string> = {
    padding: `${0.6 - 0.4 * m}rem ${1.25 - 0.75 * m}rem`,
    borderRadius: `${8 - 2 * m}px`,
    gap: `${0.5 * (1 - m)}rem`,
    minWidth: m > 0.5 ? '1.6rem' : '',
    textAlign: m > 0.5 ? 'center' : '',
    justifyContent: m > 0.5 ? 'center' : '',
  }
  if (idx === 3) Object.assign(style, integratorStyle())
  else Object.assign(style, workerGlowStyle())
  return style
}

function workerIconMorphStyle(): Record<string, string> {
  const m = state.morphProgress
  return {
    opacity: String(1 - m),
    maxWidth: `${(1 - m) * 16}px`,
    overflow: 'hidden',
  }
}

function treeChildrenMorphStyle(): Record<string, string | number> {
  const m = state.morphProgress
  const gap = `${0.75 - 0.4 * m}rem`
  return {
    gridTemplateColumns: `repeat(${workers.length}, 1fr)`,
    '--cols': workers.length,
    '--gap': gap,
    gap,
    '--bar-fill': rightBarFill(),
    '--bar-green-left': greenBarLeftFill(),
  }
}

function morphedHeight(): string {
  return '28px'
}

function morphedFontSize(): string {
  return `${0.85 - 0.15 * state.morphProgress}rem`
}

// --- Color constants (RGB channels) ---

const MUTED: [number, number, number] = [107, 114, 128]
const AMBER: [number, number, number] = [245, 158, 11]
const RED: [number, number, number] = [239, 68, 68]
const GREEN: [number, number, number] = [16, 185, 129]
const TEXT_BRIGHT: [number, number, number] = [232, 232, 237]

function lerpRgb(from: readonly number[], to: readonly number[], t: number): string {
  return `rgb(${Math.round(from[0] + (to[0] - from[0]) * t)}, ${Math.round(from[1] + (to[1] - from[1]) * t)}, ${Math.round(from[2] + (to[2] - from[2]) * t)})`
}

function glowBorder(color: readonly number[], i: number): Record<string, string> {
  return i <= 0
    ? { borderColor: 'rgba(255, 255, 255, 0.06)', boxShadow: 'none' }
    : { borderColor: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${Math.min(i, 1)})`,
        boxShadow: `0 0 ${20 * i}px rgba(${color[0]}, ${color[1]}, ${color[2]}, ${0.3 * i})` }
}

// --- Base style helpers ---

function humanBoxStyle(): Record<string, string> {
  const redI = Math.min(state.pulseHuman, 1)
  const greenI = Math.min(state.greenHuman, 1)
  const i = Math.max(redI, greenI)
  const color = greenI > redI ? GREEN : RED
  const style = glowBorder(color, i)
  style['--hl-icon-color'] = lerpRgb(MUTED, color, i)
  style['--hl-text-color'] = lerpRgb(MUTED, TEXT_BRIGHT, i)
  return style
}

function integratorStyle(): Record<string, string> {
  const amberI = state.integratorAccent
  const redI = state.pulseIntegrator
  const textEmph = state.workerTextEmphasis
  // Border follows whichever is active; they don't overlap in practice
  // workerTextEmphasis intentionally does NOT drive border (text-only emphasis)
  const borderI = Math.max(amberI, redI)
  const color = amberI >= redI ? AMBER : RED
  const style = glowBorder(color, borderI)
  // Text/icon follows integratorAccent OR workerTextEmphasis (whichever is higher)
  const t = Math.min(Math.max(amberI, textEmph), 1)
  style['--hl-icon-color'] = lerpRgb(MUTED, AMBER, t)
  style['--hl-text-color'] = lerpRgb(MUTED, TEXT_BRIGHT, t)
  return style
}

function orchestratorGlowStyle(): Record<string, string> {
  const amberI = state.orchestratorGlow
  const redI = state.pulseOrchestrator
  const greenI = state.greenOrchestrator
  const borderI = Math.max(amberI, redI, greenI)
  const color = greenI > redI && greenI > amberI ? GREEN : amberI >= redI ? AMBER : RED
  const style = glowBorder(color, borderI)
  // Text/icon follows whichever emphasis is active (amber or green, not red pulse)
  const iconColor = greenI > amberI ? GREEN : AMBER
  const t = Math.min(Math.max(amberI, greenI), 1)
  style['--hl-icon-color'] = lerpRgb(MUTED, iconColor, t)
  style['--hl-text-color'] = lerpRgb(MUTED, TEXT_BRIGHT, t)
  return style
}

function newOrchestratorStyle(): Record<string, string> {
  const i = Math.min(state.newOrchestratorGlow, 1)
  const style: Record<string, string> = { opacity: String(state.newOrchestratorOpacity) }
  Object.assign(style, glowBorder(AMBER, i))
  style['--hl-icon-color'] = lerpRgb(MUTED, AMBER, i)
  style['--hl-text-color'] = lerpRgb(MUTED, TEXT_BRIGHT, i)
  return style
}

function workerGlowStyle(): Record<string, string> {
  const greenI = Math.min(state.greenWorkers, 1)
  const amberTextI = Math.min(state.workerTextEmphasis, 1)
  // Border glow: only green (delegation) triggers border/boxShadow
  // workerTextEmphasis intentionally does NOT drive border (text-only emphasis)
  const style = glowBorder(GREEN, greenI)
  // Icon/text: whichever emphasis channel is active
  const textI = Math.max(greenI, amberTextI)
  const iconColor = greenI > amberTextI ? GREEN : AMBER
  style['--hl-icon-color'] = lerpRgb(MUTED, iconColor, textI)
  style['--hl-text-color'] = lerpRgb(MUTED, TEXT_BRIGHT, textI)
  return style
}

/** Vertical line fill: red rises from bottom to top */
function vlineFill(fill: number): string {
  if (fill <= 0) return 'rgba(255, 255, 255, 0.15)'
  if (fill >= 1) return 'rgba(239, 68, 68, 0.6)'
  const pct = (1 - fill) * 100
  return `linear-gradient(rgba(255, 255, 255, 0.15) ${pct}%, rgba(239, 68, 68, 0.6) ${pct}%)`
}

/** Horizontal bar fill: red sweeps right-to-left (Integrator → stem) */
function hbarFill(fill: number): string {
  if (fill <= 0) return 'transparent'
  if (fill >= 1) return 'rgba(239, 68, 68, 0.6)'
  const pct = (1 - fill) * 100
  return `linear-gradient(to left, rgba(239, 68, 68, 0.6) ${100 - pct}%, transparent ${100 - pct}%)`
}

/** Vertical line fill: green descends from top to bottom */
function greenVlineFill(fill: number): string {
  if (fill <= 0) return 'rgba(255, 255, 255, 0.15)'
  if (fill >= 1) return 'rgba(16, 185, 129, 0.6)'
  const pct = fill * 100
  return `linear-gradient(rgba(16, 185, 129, 0.6) ${pct}%, rgba(255, 255, 255, 0.15) ${pct}%)`
}

/** Blend any line color toward base gray based on colorFadeout */
function fadeToGray(color: string): string {
  const f = state.colorFadeout
  if (f <= 0) return color
  if (f >= 1) return 'rgba(255, 255, 255, 0.15)'
  // Parse rgba values and lerp toward gray (255, 255, 255, 0.15)
  const m = color.match(/[\d.]+/g)
  if (!m || m.length < 4) return color
  const [r, g, b, a] = m.map(Number)
  return `rgba(${Math.round(r + (255 - r) * f)}, ${Math.round(g + (255 - g) * f)}, ${Math.round(b + (255 - b) * f)}, ${+(a + (0.15 - a) * f).toFixed(3)})`
}

/** Interpolate red toward gray based on redLineFade */
function fadedRed(): string {
  const f = state.redLineFade
  if (f <= 0) return 'rgba(239, 68, 68, 0.6)'
  if (f >= 1) return 'rgba(255, 255, 255, 0.15)'
  const r = Math.round(239 + (255 - 239) * f)
  const g = Math.round(68 + (255 - 68) * f)
  const b = Math.round(68 + (255 - 68) * f)
  const a = +(0.6 - 0.45 * f).toFixed(3)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

/** Combined vline: green traces top-down over existing red */
function combinedVline(redFill: number, greenFill: number): string {
  let result: string
  if (greenFill > 0 && redFill > 0) {
    const greenPct = greenFill * 100
    const green = 'rgba(16, 185, 129, 0.6)'
    result = `linear-gradient(${fadeToGray(green)} ${greenPct}%, ${fadeToGray(fadedRed())} ${greenPct}%)`
    return result
  }
  if (greenFill > 0) {
    if (state.colorFadeout > 0 && greenFill >= 1) return fadeToGray('rgba(16, 185, 129, 0.6)')
    return greenVlineFill(greenFill)
  }
  if (redFill > 0 && state.redLineFade > 0) return fadeToGray(fadedRed())
  if (redFill > 0 && state.colorFadeout > 0 && redFill >= 1) return fadeToGray('rgba(239, 68, 68, 0.6)')
  return vlineFill(redFill)
}

/** Green bar left half: sweeps from stem (right) to F (left) */
function greenBarLeftFill(): string {
  const fill = state.greenBarLeft
  if (fill <= 0) return 'transparent'
  const green = fadeToGray('rgba(16, 185, 129, 0.6)')
  if (fill >= 1) return green
  const pct = (1 - fill) * 100
  return `linear-gradient(to left, ${green} ${100 - pct}%, transparent ${100 - pct}%)`
}

/** Right-half bar: green retraces red stem→D, remaining red D→I fades */
function rightBarFill(): string {
  const redFill = state.barFill
  const greenRight = state.greenBarRight
  const rf = state.redLineFade
  if (greenRight > 0) {
    const greenPct = Math.min(greenRight * 33.3, 33.3)
    const green = fadeToGray('rgba(16, 185, 129, 0.6)')
    const remaining = fadeToGray(fadedRed())
    return `linear-gradient(to right, ${green} ${greenPct}%, ${remaining} ${greenPct}%)`
  }
  if (redFill > 0 && state.colorFadeout > 0 && redFill >= 1) return fadeToGray('rgba(239, 68, 68, 0.6)')
  return hbarFill(redFill)
}

// --- State management ---

function killActive() {
  if (activeTl) { activeTl.kill(); activeTl = null }
}

function resetMorphState() {
  state.abbrevLabelOpacity = 0
  state.morphProgress = 0
  state.newOrchHeight = 0
  state.newOrchestratorOpacity = 0
  state.leftGroupOpacity = 0
  state.leftGroupX = 80
  state.leftGroupScale = 0.85
  state.rightGroupOpacity = 0
  state.rightGroupX = -80
  state.rightGroupScale = 0.85
  state.newOrchestratorGlow = 0
  state.legendOpacity = 0
}

function resetEscalationState() {
  state.orchestratorGlow = 1
  state.integratorDropFill = 0
  state.barFill = 0
  state.stemFill = 0
  state.topConnectorFill = 0
}

function resetDelegationState() {
  state.greenHuman = 0
  state.greenTopFill = 0
  state.greenOrchestrator = 0
  state.greenStemFill = 0
  state.greenBarLeft = 0
  state.greenBarRight = 0
  state.greenWorkerDropFill = 0
  state.greenWorkers = 0
  state.redLineFade = 0
  state.colorFadeout = 0
}

// --- Snap functions ---

function snapToIdle() {
  killActive(); phase = 'idle'
  state.diagramOpacity = 0
  state.genericLabelOpacity = 1; state.roleLabelOpacity = 0
  state.workerTextEmphasis = 0
  state.integratorAccent = 0
  state.pulseHuman = 0; state.pulseOrchestrator = 0; state.pulseIntegrator = 0
  resetEscalationState(); resetDelegationState(); resetMorphState()
}

function snapToPhase1() {
  killActive(); phase = 'phase1'
  state.diagramOpacity = 1
  state.genericLabelOpacity = 1; state.roleLabelOpacity = 0
  state.workerTextEmphasis = 0
  state.integratorAccent = 0
  state.pulseHuman = 0; state.pulseOrchestrator = 0; state.pulseIntegrator = 0
  resetEscalationState(); resetDelegationState(); resetMorphState()
}

function snapToRolesReveal() {
  killActive(); phase = 'rolesReveal'
  state.diagramOpacity = 1
  state.genericLabelOpacity = 0; state.roleLabelOpacity = 1
  state.workerTextEmphasis = 1
  state.integratorAccent = 0; state.orchestratorGlow = 0
  state.pulseHuman = 0; state.pulseOrchestrator = 0; state.pulseIntegrator = 0
  resetEscalationState(); resetDelegationState(); resetMorphState()
}

function snapToPhase2() {
  killActive(); phase = 'phase2'
  state.diagramOpacity = 1
  state.genericLabelOpacity = 0; state.roleLabelOpacity = 1
  state.workerTextEmphasis = 0
  state.integratorAccent = 1
  state.pulseHuman = 0; state.pulseOrchestrator = 0; state.pulseIntegrator = 0
  resetEscalationState(); resetDelegationState(); resetMorphState()
  state.orchestratorGlow = 0
}

function snapToEscalationComplete() {
  killActive(); phase = 'escalationComplete'
  state.diagramOpacity = 1
  state.genericLabelOpacity = 0; state.roleLabelOpacity = 1
  state.workerTextEmphasis = 0
  // Everything lit — holds until next click
  state.integratorAccent = 0; state.orchestratorGlow = 0
  state.pulseHuman = 1; state.pulseOrchestrator = 0.4; state.pulseIntegrator = 0.4
  state.integratorDropFill = 1; state.barFill = 1; state.stemFill = 1; state.topConnectorFill = 1
  resetDelegationState(); resetMorphState()
}

function snapToDelegationComplete() {
  killActive(); phase = 'delegationComplete'
  state.diagramOpacity = 1
  state.genericLabelOpacity = 0; state.roleLabelOpacity = 1
  state.workerTextEmphasis = 0
  state.integratorAccent = 0; state.orchestratorGlow = 0
  state.pulseHuman = 0; state.pulseOrchestrator = 0; state.pulseIntegrator = 0
  // Red escalation lines (faded to gray)
  state.integratorDropFill = 1; state.barFill = 1; state.stemFill = 1; state.topConnectorFill = 1
  state.redLineFade = 1
  // Green delegation fully lit
  state.greenHuman = 0.4
  state.greenTopFill = 1
  state.greenOrchestrator = 0.4
  state.greenStemFill = 1
  state.greenBarLeft = 1
  state.greenBarRight = 1
  state.greenWorkerDropFill = 1
  state.greenWorkers = 1
  resetMorphState()
}

function snapToTeams() {
  killActive(); phase = 'teams'
  state.diagramOpacity = 1
  state.genericLabelOpacity = 0; state.roleLabelOpacity = 0; state.abbrevLabelOpacity = 1
  state.workerTextEmphasis = 0
  state.integratorAccent = 0
  state.pulseHuman = 0; state.pulseOrchestrator = 0; state.pulseIntegrator = 0
  resetEscalationState(); resetDelegationState()
  state.orchestratorGlow = 0
  state.morphProgress = 1
  state.newOrchHeight = 120; state.newOrchestratorOpacity = 1
  state.leftGroupOpacity = 1; state.leftGroupX = 0; state.leftGroupScale = 1
  state.rightGroupOpacity = 1; state.rightGroupX = 0; state.rightGroupScale = 1
  state.newOrchestratorGlow = 1
  state.legendOpacity = 1
}

// --- Forward animations ---

function playPhase1() {
  killActive(); phase = 'animatingPhase1'
  const tl = gsap.timeline({ onComplete: () => { activeTl = null; phase = 'phase1' } })
  activeTl = tl
  tl.to(state, { diagramOpacity: 1, duration: 0.5, ease: 'power2.out' })
}

function playRolesReveal() {
  killActive(); phase = 'animatingRolesReveal'
  const tl = gsap.timeline({ onComplete: () => { activeTl = null; phase = 'rolesReveal' } })
  activeTl = tl
  tl.to(state, { genericLabelOpacity: 0, duration: 0.4, ease: 'power2.in' }, 0)
  tl.to(state, { roleLabelOpacity: 1, duration: 0.4, ease: 'power2.out' }, 0.2)
  tl.to(state, { orchestratorGlow: 0, duration: 0.4, ease: 'power2.in' }, 0.2)
  tl.to(state, { workerTextEmphasis: 1, duration: 0.4, ease: 'power2.out' }, 0.4)
}

function playPhase2() {
  killActive(); phase = 'animatingPhase2'
  const tl = gsap.timeline({ onComplete: () => { activeTl = null; phase = 'phase2' } })
  activeTl = tl
  tl.to(state, { workerTextEmphasis: 0, duration: 0.4, ease: 'power2.in' }, 0)
  tl.to(state, { integratorAccent: 1, duration: 0.4, ease: 'power2.out' }, 0.2)
}

function playEscalation() {
  killActive(); phase = 'animatingEscalation'
  const tl = gsap.timeline({ onComplete: () => { activeTl = null; phase = 'escalationComplete' } })
  activeTl = tl
  // Clear existing glows
  tl.to(state, { orchestratorGlow: 0, duration: 0.4, ease: 'power2.in' }, 0)
  tl.to(state, { integratorAccent: 0, duration: 0.4, ease: 'power2.in' }, 0)
  // Signal travels upward: Integrator → drop → bar → stem → Team Lead → vline → Human
  tl.to(state, { pulseIntegrator: 0.4, duration: 0.3, ease: 'power2.out' }, 0.5)
  tl.to(state, { integratorDropFill: 1, duration: 0.4, ease: 'none' }, 0.8)
  tl.to(state, { barFill: 1, duration: 0.4, ease: 'none' }, 1.2)
  tl.to(state, { stemFill: 1, duration: 0.4, ease: 'none' }, 1.6)
  tl.to(state, { pulseOrchestrator: 0.4, duration: 0.3, ease: 'power2.out' }, 2.0)
  tl.to(state, { topConnectorFill: 1, duration: 0.4, ease: 'none' }, 2.3)
  // Human glows full brightness
  tl.to(state, { pulseHuman: 1, duration: 0.4, ease: 'power2.out' }, 2.7)
  // Holds here — everything stays lit until the next click
}

function playDelegation() {
  killActive(); phase = 'animatingDelegation'
  const tl = gsap.timeline({ onComplete: () => { activeTl = null; phase = 'delegationComplete' } })
  activeTl = tl
  // Clear red human pulse as green takes over
  tl.to(state, { pulseHuman: 0, duration: 0.3, ease: 'power2.in' }, 0.3)
  // Human glows green bright, then dims
  tl.to(state, { greenHuman: 1, duration: 0.4, ease: 'power2.out' }, 0.3)
  tl.to(state, { greenHuman: 0.4, duration: 0.4, ease: 'power2.in' }, 0.9)
  // Top connector fills green (downward, retracing red)
  tl.to(state, { greenTopFill: 1, duration: 0.4, ease: 'none' }, 1.0)
  // Team Lead: clear red pulse, glow dim green
  tl.to(state, { pulseOrchestrator: 0, duration: 0.3, ease: 'power2.in' }, 1.4)
  tl.to(state, { greenOrchestrator: 0.4, duration: 0.3, ease: 'power2.out' }, 1.4)
  // Stem fills green (downward, retracing red)
  tl.to(state, { greenStemFill: 1, duration: 0.4, ease: 'none' }, 1.7)
  // Bar fills green: left (stem→F) and right (stem→D only, not I)
  tl.to(state, { greenBarLeft: 1, duration: 0.3, ease: 'none' }, 2.1)
  tl.to(state, { greenBarRight: 1, duration: 0.3, ease: 'none' }, 2.1)
  // Worker drops fill green (F, B, D simultaneously)
  tl.to(state, { greenWorkerDropFill: 1, duration: 0.4, ease: 'none' }, 2.4)
  // F, B, D glow green bright
  tl.to(state, { greenWorkers: 1, duration: 0.4, ease: 'power2.out' }, 2.8)
  // Remaining red (integrator drop, bar D→I, integrator pulse) fades to gray
  tl.to(state, { pulseIntegrator: 0, duration: 0.4, ease: 'power2.in' }, 3.0)
  tl.to(state, { redLineFade: 1, duration: 0.6, ease: 'power2.inOut' }, 3.0)
}

function playTeams() {
  killActive()
  phase = 'animatingTeams'
  const tl = gsap.timeline({ onComplete: () => { activeTl = null; phase = 'teams' } })
  activeTl = tl

  // Step 0 (0-0.8s): Fade all colors to muted gray, then clear fills
  tl.to(state, { greenWorkers: 0, greenHuman: 0, greenOrchestrator: 0, duration: 0.5, ease: 'power2.in' }, 0)
  tl.to(state, { colorFadeout: 1, duration: 0.5, ease: 'power2.in' }, 0)
  tl.to(state, { pulseHuman: 0, pulseOrchestrator: 0, pulseIntegrator: 0, duration: 0.3, ease: 'power2.in' }, 0)
  // After fade, snap all fills to 0 and reset color state
  tl.call(() => {
    state.greenTopFill = 0; state.greenStemFill = 0; state.greenBarLeft = 0
    state.greenBarRight = 0; state.greenWorkerDropFill = 0
    state.integratorDropFill = 0; state.barFill = 0; state.stemFill = 0; state.topConnectorFill = 0
    state.redLineFade = 0; state.colorFadeout = 0
  }, undefined, undefined, 0.6)

  // Step 1 (0.8-2.6s): Morph — boxes physically transform
  tl.to(state, { roleLabelOpacity: 0, duration: 0.6, ease: 'power2.in' }, 0.9)
  tl.to(state, { abbrevLabelOpacity: 1, duration: 0.6, ease: 'power2.out' }, 1.3)
  tl.to(state, { integratorAccent: 0, duration: 0.5, ease: 'power2.in' }, 0.8)
  tl.to(state, { orchestratorGlow: 0, duration: 0.8, ease: 'power2.in' }, 1.1)
  tl.to(state, { morphProgress: 1, duration: 1.5, ease: 'power2.inOut' }, 1.1)

  // Step 2 (2.8-3.8s): New Team Orchestrator pushes morphed group down
  tl.to(state, { newOrchHeight: 120, duration: 0.8, ease: 'power2.inOut' }, 2.8)
  tl.to(state, { newOrchestratorOpacity: 1, duration: 0.6, ease: 'power2.out' }, 3.0)

  // Step 3 (3.8-4.5s): Left branch + left copy slides in
  tl.to(state, { leftGroupOpacity: 1, leftGroupX: 0, leftGroupScale: 1, duration: 0.6, ease: 'power3.out' }, 3.8)

  // Step 4 (4.2-4.9s): Right copy slides in
  tl.to(state, { rightGroupOpacity: 1, rightGroupX: 0, rightGroupScale: 1, duration: 0.6, ease: 'power3.out' }, 4.2)

  // After everything is revealed: orchestrator glows, legend fades in
  tl.to(state, { newOrchestratorGlow: 1, duration: 0.4, ease: 'power2.out' }, 4.8)
  tl.to(state, { legendOpacity: 1, duration: 0.4, ease: 'power2.out' }, 4.8)
}

// --- Reverse animations ---

function reversePhase1() {
  killActive(); phase = 'reversingPhase1'
  const tl = gsap.timeline({ onComplete: () => { activeTl = null; snapToIdle() } })
  activeTl = tl
  tl.to(state, { diagramOpacity: 0, duration: 0.4, ease: 'power2.in' })
}

function reverseRolesReveal() {
  killActive(); phase = 'reversingRolesReveal'
  const tl = gsap.timeline({ onComplete: () => { activeTl = null; snapToPhase1() } })
  activeTl = tl
  tl.to(state, { workerTextEmphasis: 0, duration: 0.3, ease: 'power2.in' }, 0)
  tl.to(state, { roleLabelOpacity: 0, duration: 0.4, ease: 'power2.in' }, 0)
  tl.to(state, { orchestratorGlow: 1, duration: 0.3, ease: 'power2.out' }, 0.2)
  tl.to(state, { genericLabelOpacity: 1, duration: 0.4, ease: 'power2.out' }, 0.2)
}

function reversePhase2() {
  killActive(); phase = 'reversingPhase2'
  const tl = gsap.timeline({ onComplete: () => { activeTl = null; snapToRolesReveal() } })
  activeTl = tl
  tl.to(state, { integratorAccent: 0, duration: 0.3, ease: 'power2.in' }, 0)
  tl.to(state, { workerTextEmphasis: 1, duration: 0.3, ease: 'power2.out' }, 0.2)
}

function reverseDelegation() {
  killActive(); phase = 'reversingDelegation'
  const tl = gsap.timeline({ onComplete: () => { activeTl = null; snapToEscalationComplete() } })
  activeTl = tl
  // Restore red lines from gray
  tl.to(state, { redLineFade: 0, duration: 0.3, ease: 'power2.in' }, 0)
  // Fade out green glows and fills
  tl.to(state, { greenWorkers: 0, duration: 0.3, ease: 'power2.in' }, 0)
  tl.to(state, { greenWorkerDropFill: 0, greenBarLeft: 0, greenBarRight: 0, duration: 0.3, ease: 'power2.in' }, 0)
  tl.to(state, { greenStemFill: 0, greenOrchestrator: 0, duration: 0.3, ease: 'power2.in' }, 0.1)
  tl.to(state, { greenTopFill: 0, greenHuman: 0, duration: 0.3, ease: 'power2.in' }, 0.2)
  // Restore red pulses
  tl.to(state, { pulseHuman: 1, pulseOrchestrator: 0.4, pulseIntegrator: 0.4, duration: 0.3, ease: 'power2.out' }, 0.4)
}

function reverseTeams() {
  killActive(); phase = 'reversingTeams'
  const tl = gsap.timeline({ onComplete: () => { activeTl = null; snapToDelegationComplete() } })
  activeTl = tl
  // Fade out legend and orchestrator glow
  tl.to(state, { legendOpacity: 0, newOrchestratorGlow: 0, duration: 0.3, ease: 'power2.in' }, 0)
  // Reverse side copies (branch bars/drops are driven by group opacities)
  tl.to(state, { leftGroupOpacity: 0, leftGroupX: 80, leftGroupScale: 0.85, duration: 0.3, ease: 'power2.in' }, 0)
  tl.to(state, { rightGroupOpacity: 0, rightGroupX: -80, rightGroupScale: 0.85, duration: 0.3, ease: 'power2.in' }, 0)
  // Collapse new orchestrator
  tl.to(state, { newOrchestratorOpacity: 0, duration: 0.3, ease: 'power2.in' }, 0.2)
  tl.to(state, { newOrchHeight: 0, duration: 0.3, ease: 'power2.in' }, 0.2)
  // Restore morph
  tl.to(state, { morphProgress: 0, duration: 0.5, ease: 'power2.out' }, 0.3)
  tl.to(state, { roleLabelOpacity: 1, abbrevLabelOpacity: 0, duration: 0.3, ease: 'power2.out' }, 0.3)
  // After unmorph: snap fills behind colorFadeout, then fade colors in (mirrors playTeams step 0)
  tl.call(() => {
    state.colorFadeout = 1
    state.integratorDropFill = 1; state.barFill = 1; state.stemFill = 1; state.topConnectorFill = 1
    state.redLineFade = 1
    state.greenTopFill = 1; state.greenStemFill = 1
    state.greenBarLeft = 1; state.greenBarRight = 1; state.greenWorkerDropFill = 1
  }, undefined, undefined, 0.8)
  tl.to(state, { colorFadeout: 0, duration: 0.5, ease: 'power2.out' }, 0.8)
  tl.to(state, { greenWorkers: 1, greenHuman: 0.4, greenOrchestrator: 0.4, duration: 0.5, ease: 'power2.out' }, 0.8)
}

// --- Phase dispatchers ---

function handleForward(clicks: number) {
  switch (phase) {
    case 'idle':
      if (clicks >= props.click) playPhase1(); break
    case 'animatingPhase1': case 'reversingPhase1':
      snapToPhase1(); break
    case 'phase1':
      if (clicks >= props.rolesRevealClick) playRolesReveal(); break
    case 'animatingRolesReveal': case 'reversingRolesReveal':
      snapToRolesReveal(); break
    case 'rolesReveal':
      if (clicks >= props.rolesClick) playPhase2(); break
    case 'animatingPhase2': case 'reversingPhase2':
      snapToPhase2(); break
    case 'phase2':
      if (clicks >= props.escalationClick) playEscalation(); break
    case 'animatingEscalation': case 'reversingEscalation':
      snapToEscalationComplete(); break
    case 'escalationComplete':
      if (clicks >= props.delegationClick) playDelegation(); break
    case 'animatingDelegation': case 'reversingDelegation':
      snapToDelegationComplete(); break
    case 'delegationComplete':
      if (clicks >= props.teamsClick) playTeams(); break
    case 'animatingTeams': case 'reversingTeams':
      snapToTeams(); break
  }
}

function handleBackward(clicks: number) {
  switch (phase) {
    case 'teams':
      if (clicks < props.teamsClick) reverseTeams(); break
    case 'animatingTeams': case 'reversingTeams':
      snapToDelegationComplete(); break
    case 'delegationComplete':
      if (clicks < props.delegationClick) reverseDelegation(); break
    case 'animatingDelegation': case 'reversingDelegation':
      snapToEscalationComplete(); break
    case 'escalationComplete':
      if (clicks < props.escalationClick) snapToPhase2(); break
    case 'animatingEscalation': case 'reversingEscalation':
      snapToPhase2(); break
    case 'phase2':
      if (clicks < props.rolesClick) reversePhase2(); break
    case 'animatingPhase2': case 'reversingPhase2':
      snapToRolesReveal(); break
    case 'rolesReveal':
      if (clicks < props.rolesRevealClick) reverseRolesReveal(); break
    case 'animatingRolesReveal': case 'reversingRolesReveal':
      snapToPhase1(); break
    case 'phase1':
      if (clicks < props.click) reversePhase1(); break
    case 'animatingPhase1': case 'reversingPhase1':
      snapToIdle(); break
  }
}

// --- Event interception ---

const FORWARD_KEYS = ['ArrowRight', 'ArrowDown', ' ', 'Enter', 'PageDown']
const BACKWARD_KEYS = ['ArrowLeft', 'ArrowUp', 'PageUp']

function isAnimating(): boolean {
  return phase.startsWith('animating') || phase.startsWith('reversing')
}

function blockEvent(e: Event) {
  e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation()
}

/** Skip forward animation to end state (only used when blocking forward events) */
function skipAnimForward() {
  switch (phase) {
    case 'animatingPhase1': snapToPhase1(); break
    case 'animatingRolesReveal': snapToRolesReveal(); break
    case 'animatingPhase2': snapToPhase2(); break
    case 'animatingEscalation': snapToEscalationComplete(); break
    case 'animatingDelegation': snapToDelegationComplete(); break
    case 'animatingTeams': snapToTeams(); break
  }
}

function onKeydownCapture(e: KeyboardEvent) {
  if (!active || !isAnimating()) return
  const isForward = FORWARD_KEYS.includes(e.key)
  const isBackward = BACKWARD_KEYS.includes(e.key)
  if (!isForward && !isBackward) return
  if (isForward && phase.startsWith('animating')) {
    // Block forward during forward animation to prevent overshooting the slide
    blockEvent(e)
    skipAnimForward()
  }
  // All other cases: let through to Slidev, watcher handles the snap
}

function onClickCapture(e: MouseEvent) {
  if (!active || !isAnimating()) return
  if ((e.target as HTMLElement).closest('.slidev-nav, nav, button, a')) return
  if (phase.startsWith('animating')) {
    blockEvent(e)
    skipAnimForward()
  }
}

let active = false

function initSlide() {
  if (active) return
  active = true
  window.addEventListener('keydown', onKeydownCapture, { capture: true })
  window.addEventListener('click', onClickCapture, { capture: true })
  const clicks = nav.clicks.value
  if (clicks >= props.teamsClick) snapToTeams()
  else if (clicks >= props.delegationClick) snapToDelegationComplete()
  else if (clicks >= props.escalationClick) snapToEscalationComplete()
  else if (clicks >= props.rolesClick) snapToPhase2()
  else if (clicks >= props.rolesRevealClick) snapToRolesReveal()
  else if (clicks >= props.click) snapToPhase1()
  else snapToIdle()
}

watch(() => nav.clicks.value, (clicks, prev) => {
  if (!active || !isInteractive.value) return
  const forward = clicks > (prev ?? 0)
  if (forward) handleForward(clicks)
  else handleBackward(clicks)
})

onSlideEnter(() => {
  if (!isInteractive.value || active) return
  initSlide()
})

onSlideLeave(() => {
  if (!isInteractive.value) return
  active = false
  window.removeEventListener('keydown', onKeydownCapture, { capture: true })
  window.removeEventListener('click', onClickCapture, { capture: true })
  killActive(); snapToIdle()
})

onMounted(() => {
  if (isInteractive.value) initSlide()
  else snapToIdle()
})
</script>

<template>
  <div class="agent-teams-diagram" :style="{ opacity: state.diagramOpacity }">
    <div class="agent-teams-layout">
      <!-- Human -->
      <div class="agent-teams-level">
        <div class="agent-teams-box highlight" :style="humanBoxStyle()">
          <carbon:user /><span>Human</span>
        </div>
      </div>
      <div class="agent-teams-vline" :style="{ background: combinedVline(state.topConnectorFill, state.greenTopFill) }" />

      <!-- New Orchestrator (grows in during phase 4 step 2) -->
      <div class="agent-teams-new-orch" :style="{ maxHeight: state.newOrchHeight + 'px' }">
        <div class="agent-teams-level">
          <div class="agent-teams-box highlight" :style="newOrchestratorStyle()">
            <carbon:machine-learning-model /><span>Team Orchestrator</span>
          </div>
        </div>
        <div class="agent-teams-vline agent-teams-vline-long" :style="{ opacity: state.newOrchestratorOpacity }" />
      </div>

      <!-- Morph group: Team Lead + workers + side copies -->
      <div class="agent-teams-morph-group">
        <!-- Branch bar + side drops (overlays vline midpoint, fades in with side copies) -->
        <div class="agent-teams-branch">
          <div class="agent-teams-branch-bar agent-teams-branch-bar-left" :style="{ opacity: state.leftGroupOpacity }" />
          <div class="agent-teams-branch-bar agent-teams-branch-bar-right" :style="{ opacity: state.rightGroupOpacity }" />
          <div class="agent-teams-branch-drop agent-teams-branch-left" :style="{ opacity: state.leftGroupOpacity }" />
          <div class="agent-teams-branch-drop agent-teams-branch-right" :style="{ opacity: state.rightGroupOpacity }" />
        </div>
        <!-- Team Lead (center) -->
        <div class="agent-teams-level">
          <div class="agent-teams-box highlight" :style="orchestratorGlowStyle()">
            <carbon:machine-learning-model /><span>Team Lead</span>
          </div>
        </div>

        <!-- Worker tree — boxes physically morph via morphProgress -->
        <div class="agent-teams-tree">
          <div class="agent-teams-tree-stem" :style="{
            background: combinedVline(state.stemFill, state.greenStemFill),
            height: morphedHeight(),
          }" />
          <div class="agent-teams-tree-children" :style="treeChildrenMorphStyle()">
            <div class="agent-teams-bar-green-left" :style="{ background: greenBarLeftFill() }" />
            <div v-for="(w, i) in workers" :key="i" class="agent-teams-tree-col">
              <div class="agent-teams-tree-drop" :style="{
                height: morphedHeight(),
                ...(i === 3 ? { background: combinedVline(state.integratorDropFill, 0) } : {}),
                ...(i < 3 ? { background: combinedVline(0, state.greenWorkerDropFill) } : {}),
              }" />
              <div class="agent-teams-box highlight" :style="workerBoxMorphStyle(i)">
                <carbon:container-software :style="{
                  ...workerIconMorphStyle(),
                  fontSize: `${1 - state.morphProgress}rem`,
                }" />
                <div class="agent-teams-label-wrap">
                  <span :style="{
                    opacity: state.genericLabelOpacity,
                    maxWidth: state.genericLabelOpacity > 0.01 ? '200px' : '0',
                    overflow: 'hidden',
                    fontSize: `${0.85 * (1 - state.morphProgress)}rem`,
                    lineHeight: `${1 - state.morphProgress}`,
                  }">{{ w.generic }}</span>
                  <span :style="{
                    opacity: state.roleLabelOpacity,
                    maxWidth: `${(1 - state.morphProgress) * 200}px`,
                    overflow: 'hidden',
                    fontSize: `${0.85 * (1 - state.morphProgress)}rem`,
                    lineHeight: `${1 - state.morphProgress}`,
                  }">{{ w.role }}</span>
                  <span :style="{
                    opacity: state.abbrevLabelOpacity,
                    fontSize: morphedFontSize(),
                  }">{{ w.abbrev }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Left side copy -->
        <div class="agent-teams-side-copy agent-teams-side-left" :style="{
          opacity: state.leftGroupOpacity,
          transform: `translateX(${state.leftGroupX}px) scale(${state.leftGroupScale})`,
        }">
          <div class="agent-teams-lead-group">
            <div class="agent-teams-box"><carbon:machine-learning-model /><span>Team Lead</span></div>
            <div class="agent-teams-tree agent-teams-tree-mini">
              <div class="agent-teams-tree-stem" />
              <div class="agent-teams-tree-children" :style="{ gridTemplateColumns: 'repeat(4, auto)', '--cols': 4, '--gap': '0.35rem', gap: '0.35rem' }">
                <div v-for="a in abbrevs" :key="a" class="agent-teams-tree-col">
                  <div class="agent-teams-tree-drop" />
                  <div class="agent-teams-mini-box">{{ a }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right side copy -->
        <div class="agent-teams-side-copy agent-teams-side-right" :style="{
          opacity: state.rightGroupOpacity,
          transform: `translateX(${state.rightGroupX}px) scale(${state.rightGroupScale})`,
        }">
          <div class="agent-teams-lead-group">
            <div class="agent-teams-box"><carbon:machine-learning-model /><span>Team Lead</span></div>
            <div class="agent-teams-tree agent-teams-tree-mini">
              <div class="agent-teams-tree-stem" />
              <div class="agent-teams-tree-children" :style="{ gridTemplateColumns: 'repeat(4, auto)', '--cols': 4, '--gap': '0.35rem', gap: '0.35rem' }">
                <div v-for="a in abbrevs" :key="a" class="agent-teams-tree-col">
                  <div class="agent-teams-tree-drop" />
                  <div class="agent-teams-mini-box">{{ a }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Abbreviation legend -->
    <div class="agent-teams-legend" :style="{ opacity: state.legendOpacity }">
      <span><b>F</b> Frontend</span>
      <span><b>B</b> Backend</span>
      <span><b>D</b> Database</span>
      <span><b>I</b> Integrator</span>
    </div>
  </div>
</template>
