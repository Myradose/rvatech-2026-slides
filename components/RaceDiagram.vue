<script setup lang="ts">
/**
 * RaceDiagram — GSAP-animated racing lanes
 *
 * Shows empty lanes on slide enter. Race starts on the specified click.
 * Three progress bars race with varying speeds (surges and stalls).
 * Winner turns green with checkmark, losers turn red and fade.
 */
import { reactive, watch, onMounted } from 'vue'
import { useNav, onSlideEnter, onSlideLeave } from '@slidev/client'
import gsap from 'gsap'

const props = withDefaults(defineProps<{
  /** Which click number triggers the race */
  click?: number
}>(), {
  click: 1,
})

const nav = useNav()
let tl: gsap.core.Timeline | null = null
let hasPlayed = false

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

function killTimeline() {
  if (tl) {
    tl.kill()
    tl = null
  }
}

function resetState() {
  killTimeline()
  for (let i = 0; i < barState.length; i++) {
    barState[i].width = '0%'
    barState[i].background = ''
    barState[i].laneOpacity = '1'
    barState[i].checkOpacity = '0'
    barState[i].checkScale = 'scale(0.5)'
  }
}

function playRace() {
  killTimeline()
  tl = gsap.timeline()
  let winnerFinishTime = 0

  lanes.forEach((lane, i) => {
    const state = barState[i]
    let prevTarget = 0
    let offset = 0

    for (const [target, duration, ease] of lane.segments) {
      const from = prevTarget
      tl!.to(state, {
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

      tl!.to(state, {
        background: 'linear-gradient(90deg, #10b981, #34d399)',
        duration: 0.3,
        ease: 'power2.out',
      }, offset - 0.1)

      tl!.to(state, {
        checkOpacity: '1',
        checkScale: 'scale(1)',
        duration: 0.3,
        ease: 'back.out(2)',
      }, offset - 0.1)
    }
  })

  lanes.forEach((lane, i) => {
    if (lane.winner) return

    tl!.to(barState[i], {
      background: 'linear-gradient(90deg, #ef4444, #dc2626)',
      duration: 0.4,
      ease: 'power2.out',
    }, winnerFinishTime + 0.1)

    tl!.to(barState[i], {
      laneOpacity: '0.3',
      duration: 0.6,
      ease: 'power2.inOut',
    }, winnerFinishTime + 1.2)
  })
}

watch(() => nav.clicks.value, (clicks) => {
  if (clicks >= props.click && !hasPlayed) {
    hasPlayed = true
    playRace()
  }
})

onSlideEnter(() => {
  hasPlayed = false
  resetState()
})

onSlideLeave(() => {
  hasPlayed = false
  resetState()
})

onMounted(() => {
  resetState()
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
        <div :class="['race-finish', { 'race-winner': lane.winner }]">
          <span
            v-if="lane.winner"
            :style="{ opacity: barState[i].checkOpacity, transform: barState[i].checkScale }"
          >&#10003;</span>
        </div>
      </div>
    </div>
  </div>
</template>
