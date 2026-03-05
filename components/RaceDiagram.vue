<script setup lang="ts">
/**
 * RaceDiagram — GSAP-animated racing lanes
 *
 * Shows empty lanes on slide enter. Race starts on the specified click.
 * Three progress bars race with varying speeds (surges and stalls).
 * Winner turns green with checkmark, losers turn red and fade.
 */
import { ref, watch, onMounted } from 'vue'
import { useNav, onSlideEnter, onSlideLeave } from '@slidev/client'
import gsap from 'gsap'

const props = withDefaults(defineProps<{
  /** Which click number triggers the race */
  click?: number
}>(), {
  click: 1,
})

const containerRef = ref<HTMLElement>()
const nav = useNav()
let tl: gsap.core.Timeline | null = null
let hasPlayed = false

// Each lane has segments: [targetPercent, duration, ease]
// Designed so the lead changes hands multiple times before B wins
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

function applyResetState() {
  if (!containerRef.value) return
  const bars = containerRef.value.querySelectorAll<HTMLElement>('.race-progress')
  const laneEls = containerRef.value.querySelectorAll<HTMLElement>('.race-lane')
  const check = containerRef.value.querySelector<HTMLElement>('.race-winner')
  bars.forEach(bar => {
    bar.style.width = '0%'
    bar.style.background = ''
  })
  laneEls.forEach(el => { el.style.opacity = '1' })
  if (check) {
    check.style.opacity = '0'
    check.style.transform = 'scale(0.5)'
  }
}

function applyEndState() {
  if (!containerRef.value) return
  const bars = containerRef.value.querySelectorAll<HTMLElement>('.race-progress')
  const laneEls = containerRef.value.querySelectorAll<HTMLElement>('.race-lane')
  const check = containerRef.value.querySelector<HTMLElement>('.race-winner')

  lanes.forEach((lane, i) => {
    const lastSegment = lane.segments[lane.segments.length - 1]
    bars[i].style.width = `${lastSegment[0]}%`

    if (lane.winner) {
      bars[i].style.background = 'linear-gradient(90deg, #10b981, #34d399)'
    } else {
      bars[i].style.background = 'linear-gradient(90deg, #ef4444, #dc2626)'
      laneEls[i].style.opacity = '0.3'
    }
  })

  if (check) {
    check.style.opacity = '1'
    check.style.transform = 'scale(1)'
  }
}

function playRace() {
  if (!containerRef.value) return
  killTimeline()

  const bars = containerRef.value.querySelectorAll<HTMLElement>('.race-progress')
  const laneEls = containerRef.value.querySelectorAll<HTMLElement>('.race-lane')
  const check = containerRef.value.querySelector<HTMLElement>('.race-winner')

  tl = gsap.timeline()
  let winnerFinishTime = 0

  lanes.forEach((lane, i) => {
    const bar = bars[i]
    let prevTarget = 0
    let offset = 0
    for (const [target, duration, ease] of lane.segments) {
      tl!.fromTo(bar,
        { width: `${prevTarget}%` },
        { width: `${target}%`, duration, ease },
        offset,
      )
      prevTarget = target
      offset += duration
    }

    if (lane.winner) {
      winnerFinishTime = offset

      tl!.to(bar, {
        background: 'linear-gradient(90deg, #10b981, #34d399)',
        duration: 0.3,
        ease: 'power2.out',
      }, offset - 0.1)

      if (check) {
        tl!.fromTo(check,
          { opacity: 0, scale: 0.5 },
          { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' },
          offset - 0.1,
        )
      }
    }
  })

  lanes.forEach((lane, i) => {
    if (lane.winner) return

    tl!.to(bars[i], {
      background: 'linear-gradient(90deg, #ef4444, #dc2626)',
      duration: 0.4,
      ease: 'power2.out',
    }, winnerFinishTime + 0.1)

    tl!.to(laneEls[i], {
      opacity: 0.3,
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
  killTimeline()
  hasPlayed = false
  applyResetState()
})

onSlideLeave(() => {
  killTimeline()
  hasPlayed = false
  applyResetState()
})

onMounted(() => {
  applyResetState()
})
</script>

<template>
  <div ref="containerRef" class="race-diagram">
    <div class="race-lanes">
      <div v-for="(lane, i) in lanes" :key="i" class="race-lane">
        <div class="race-agent"><carbon:container-software /><span>{{ lane.label }}</span></div>
        <div class="race-track"><div class="race-progress" /></div>
        <div :class="['race-finish', { 'race-winner': lane.winner }]">
          <span v-if="lane.winner">&#10003;</span>
        </div>
      </div>
    </div>
  </div>
</template>
