<script setup lang="ts">
/**
 * RaceDiagram — GSAP-animated racing lanes with compare phase
 *
 * Phase state machine (fully reversible):
 *   idle → racing → raceComplete → comparing → compareComplete
 *
 * Forward during animation: skips to end state.
 * Backward during animation: cancels and snaps to previous state.
 * Backward from completed state: plays reverse animation.
 * Slide enter: restores correct state based on current click position.
 */
import { reactive, watch, onMounted } from 'vue'
import { useNav, onSlideEnter, onSlideLeave } from '@slidev/client'
import gsap from 'gsap'

const props = withDefaults(defineProps<{
  /** Which click number triggers the race */
  click?: number
  /** Which click number triggers the compare phase (losers resume) */
  compareClick?: number
}>(), {
  click: 1,
  compareClick: 0,
})

const nav = useNav()
let activeTl: gsap.core.Timeline | null = null

type Phase = 'idle' | 'racing' | 'raceComplete' | 'reversingRace'
  | 'comparing' | 'compareComplete' | 'reversingCompare'
let phase: Phase = 'idle'

const GREEN = 'linear-gradient(90deg, #10b981, #34d399)'
const RED = 'linear-gradient(90deg, #ef4444, #dc2626)'

// Reactive state for bar widths/styles — Vue controls rendering, no flash
const barState = reactive(
  Array.from({ length: 3 }, () => ({
    width: '0%',
    background: '',
    laneOpacity: '1',
    checkOpacity: '0',
    checkScale: 'scale(0.5)',
  }))
)

// Each lane has segments: [targetPercent, duration, ease]
const lanes = [
  {
    label: 'Agent A',
    winner: false,
    segments: [
      [35, 0.7, 'power3.in'],
      [42, 0.9, 'power1.out'],
      [45, 1.0, 'power1.inOut'],
      [48, 1.2, 'power1.out'],
      [55, 0.8, 'power2.in'],
      [58, 1.0, 'power1.out'],
      [62, 0.8, 'power1.inOut'],
      [65, 0.8, 'power2.out'],
    ] as [number, number, string][],
  },
  {
    label: 'Agent B',
    winner: true,
    segments: [
      [15, 1.0, 'power2.in'],
      [25, 0.8, 'power1.out'],
      [30, 1.2, 'power1.inOut'],
      [55, 1.0, 'power2.in'],
      [60, 0.8, 'power1.out'],
      [75, 0.6, 'power2.in'],
      [90, 0.7, 'power2.inOut'],
      [100, 0.6, 'power3.out'],
    ] as [number, number, string][],
  },
  {
    label: 'Agent C',
    winner: false,
    segments: [
      [25, 0.8, 'power2.in'],
      [45, 0.9, 'power1.out'],
      [60, 1.0, 'power2.inOut'],
      [65, 1.0, 'power1.out'],
      [70, 1.2, 'power1.inOut'],
      [75, 0.8, 'power1.out'],
      [80, 0.7, 'power2.out'],
      [85, 0.8, 'power1.out'],
    ] as [number, number, string][],
  },
]

// Pre-compute the race-end width for each loser
function loserFinalWidth(i: number): string {
  const segs = lanes[i].segments
  return `${segs[segs.length - 1][0]}%`
}

function killActive() {
  if (activeTl) { activeTl.kill(); activeTl = null }
}

// --- Snap-to-state functions (instant, no animation) ---

function snapToIdle() {
  killActive()
  phase = 'idle'
  for (let i = 0; i < barState.length; i++) {
    barState[i].width = '0%'
    barState[i].background = ''
    barState[i].laneOpacity = '1'
    barState[i].checkOpacity = '0'
    barState[i].checkScale = 'scale(0.5)'
  }
}

function snapToRaceComplete() {
  killActive()
  phase = 'raceComplete'
  lanes.forEach((lane, i) => {
    const state = barState[i]
    if (lane.winner) {
      state.width = '100%'
      state.background = GREEN
      state.laneOpacity = '1'
      state.checkOpacity = '1'
      state.checkScale = 'scale(1)'
    } else {
      state.width = loserFinalWidth(i)
      state.background = RED
      state.laneOpacity = '0.3'
      state.checkOpacity = '0'
      state.checkScale = 'scale(0.5)'
    }
  })
}

function snapToCompareComplete() {
  killActive()
  phase = 'compareComplete'
  lanes.forEach((_lane, i) => {
    const state = barState[i]
    state.width = '100%'
    state.background = GREEN
    state.laneOpacity = '1'
    state.checkOpacity = '1'
    state.checkScale = 'scale(1)'
  })
}

// --- Forward animations ---

function playRace() {
  killActive()
  phase = 'racing'
  const tl = gsap.timeline({
    onComplete: () => { activeTl = null; phase = 'raceComplete' },
  })
  activeTl = tl
  let winnerFinishTime = 0

  lanes.forEach((lane, i) => {
    const state = barState[i]
    let prevTarget = 0
    let offset = 0

    for (const [target, duration, ease] of lane.segments) {
      const from = prevTarget
      tl.to(state, {
        width: `${target}%`,
        duration,
        ease,
        onStart() { state.width = `${from}%` },
      }, offset)
      prevTarget = target
      offset += duration
    }

    if (lane.winner) {
      winnerFinishTime = offset
      tl.to(state, { background: GREEN, duration: 0.3, ease: 'power2.out' }, offset - 0.1)
      tl.to(state, { checkOpacity: '1', checkScale: 'scale(1)', duration: 0.3, ease: 'back.out(2)' }, offset - 0.1)
    }
  })

  lanes.forEach((lane, i) => {
    if (lane.winner) return
    tl.to(barState[i], { background: RED, duration: 0.4, ease: 'power2.out' }, winnerFinishTime + 0.1)
    tl.to(barState[i], { laneOpacity: '0.3', duration: 0.6, ease: 'power2.inOut' }, winnerFinishTime + 1.2)
  })
}

function playCompare() {
  killActive()
  // Ensure race end state is fully established
  snapToRaceComplete()
  phase = 'comparing'
  const tl = gsap.timeline({
    onComplete: () => { activeTl = null; phase = 'compareComplete' },
  })
  activeTl = tl

  lanes.forEach((lane, i) => {
    if (lane.winner) return
    const state = barState[i]

    tl.to(state, { laneOpacity: '1', duration: 0.4, ease: 'power2.out' }, 0)
    tl.set(state, { background: '' }, 0)
    tl.to(state, { width: '100%', duration: 1.2, ease: 'power2.inOut' }, 0.3)
    tl.to(state, { background: GREEN, duration: 0.3, ease: 'power2.out' }, 1.3)
    tl.to(state, { checkOpacity: '1', checkScale: 'scale(1)', duration: 0.3, ease: 'back.out(2)' }, 1.4)
  })
}

// --- Reverse animations ---

function reverseRace() {
  killActive()
  phase = 'reversingRace'
  const tl = gsap.timeline({
    onComplete: () => { activeTl = null; snapToIdle() },
  })
  activeTl = tl

  lanes.forEach((lane, i) => {
    const state = barState[i]
    if (!lane.winner) {
      tl.to(state, { laneOpacity: '1', duration: 0.3, ease: 'power2.out' }, 0)
    }
    tl.set(state, { background: '' }, 0)
    tl.to(state, { checkOpacity: '0', checkScale: 'scale(0.5)', duration: 0.2, ease: 'power2.in' }, 0)
    tl.to(state, { width: '0%', duration: 0.6, ease: 'power2.inOut' }, 0.1)
  })
}

function reverseCompare() {
  killActive()
  phase = 'reversingCompare'
  const tl = gsap.timeline({
    onComplete: () => { activeTl = null; snapToRaceComplete() },
  })
  activeTl = tl

  lanes.forEach((lane, i) => {
    if (lane.winner) return
    const state = barState[i]

    tl.to(state, { checkOpacity: '0', checkScale: 'scale(0.5)', duration: 0.2, ease: 'power2.in' }, 0)
    tl.set(state, { background: '' }, 0.1)
    tl.to(state, { width: loserFinalWidth(i), duration: 0.6, ease: 'power2.inOut' }, 0.1)
    tl.to(state, { background: RED, duration: 0.3, ease: 'power2.out' }, 0.5)
    tl.to(state, { laneOpacity: '0.3', duration: 0.4, ease: 'power2.inOut' }, 0.5)
  })
}

// --- Phase dispatchers ---

function handleForward(clicks: number) {
  switch (phase) {
    case 'idle':
      if (clicks >= props.click) playRace()
      break
    case 'racing':
      snapToRaceComplete()
      break
    case 'reversingRace':
      snapToRaceComplete()
      break
    case 'raceComplete':
      if (props.compareClick && clicks >= props.compareClick) playCompare()
      break
    case 'comparing':
      snapToCompareComplete()
      break
    case 'reversingCompare':
      snapToCompareComplete()
      break
  }
}

function handleBackward(clicks: number) {
  switch (phase) {
    case 'compareComplete':
      if (props.compareClick && clicks < props.compareClick) reverseCompare()
      break
    case 'comparing':
      if (props.compareClick && clicks < props.compareClick) snapToRaceComplete()
      break
    case 'reversingCompare':
      snapToRaceComplete()
      break
    case 'raceComplete':
      if (clicks < props.click) reverseRace()
      break
    case 'racing':
      if (clicks < props.click) snapToIdle()
      break
    case 'reversingRace':
      snapToIdle()
      break
  }
}

let active = false

watch(() => nav.clicks.value, (clicks, prev) => {
  if (!active) return
  const forward = clicks > (prev ?? 0)
  if (forward) handleForward(clicks)
  else handleBackward(clicks)
})

// Restore correct state when entering the slide (handles backward navigation)
onSlideEnter(() => {
  if (active) return
  active = true
  const clicks = nav.clicks.value
  if (props.compareClick && clicks >= props.compareClick) {
    snapToCompareComplete()
  } else if (clicks >= props.click) {
    snapToRaceComplete()
  } else {
    snapToIdle()
  }
})

onSlideLeave(() => {
  active = false
  killActive()
  snapToIdle()
})

onMounted(() => {
  snapToIdle()
})
</script>

<template>
  <div class="race-diagram">
    <div class="race-lanes">
      <div
        v-for="(lane, i) in lanes"
        :key="i"
        class="race-lane"
        :style="{ opacity: barState[i].laneOpacity }"
      >
        <div class="race-agent"><carbon:container-software /><span>{{ lane.label }}</span></div>
        <div class="race-track">
          <div
            class="race-progress"
            :style="{ width: barState[i].width, background: barState[i].background || undefined }"
          />
        </div>
        <div class="race-finish">
          <span
            class="race-check"
            :style="{ opacity: barState[i].checkOpacity, transform: barState[i].checkScale }"
          >&#10003;</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.race-diagram {
  margin-top: 1rem;
  margin-bottom: 1.5rem;
}

.race-lanes {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.race-lane {
  display: grid;
  grid-template-columns: 100px 1fr 32px;
  align-items: center;
  gap: 0.75rem;
}

.race-agent {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  background: var(--color-bg-light);
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.race-agent svg {
  font-size: 0.9rem;
  color: var(--color-accent);
}

.race-agent span {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 500;
  white-space: nowrap;
}

.race-track {
  height: 6px;
  background: var(--color-border);
  border-radius: 3px;
  overflow: hidden;
}

.race-progress {
  height: 100%;
  width: 0%;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-bright));
}

.race-finish {
  font-size: 0.85rem;
  text-align: center;
  min-width: 32px;
}

.race-check {
  color: var(--color-success);
  font-weight: 700;
  display: inline-block;
}
</style>
