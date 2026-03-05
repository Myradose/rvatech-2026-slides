<script setup lang="ts">
/**
 * EvolutionTimeline — GSAP auto-playing timeline for the evolution slide.
 *
 * Animates: Prompt Eng. → arrow → Context Eng. → arrow → Environment Eng. (with glow)
 * Total duration ~2s. Resets on slide leave.
 */
import { ref, onMounted } from 'vue'
import { onSlideEnter, onSlideLeave } from '@slidev/client'
import gsap from 'gsap'

const containerRef = ref<HTMLElement>()
let tl: gsap.core.Timeline | null = null

function resetElements() {
  if (!containerRef.value) return
  const items = containerRef.value.querySelectorAll('.evo-tl-item')
  const arrows = containerRef.value.querySelectorAll('.evo-tl-arrow')
  gsap.set([items, arrows], { opacity: 0, x: -30 })
}

function buildTimeline() {
  if (!containerRef.value) return

  const items = containerRef.value.querySelectorAll('.evo-tl-item')
  const arrows = containerRef.value.querySelectorAll('.evo-tl-arrow')
  const glowItem = containerRef.value.querySelector('.evo-tl-highlight')

  resetElements()

  tl = gsap.timeline()

  // T+0.0: First item slides in
  tl.to(items[0], { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0)

  // T+0.4: First arrow fades in
  tl.to(arrows[0], { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }, 0.4)

  // T+0.6: Second item slides in
  tl.to(items[1], { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0.6)

  // T+1.0: Second arrow fades in
  tl.to(arrows[1], { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }, 1.0)

  // T+1.2: Third item slides in
  tl.to(items[2], { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 1.2)

  // T+1.7: Glow pulse on the highlight item
  if (glowItem) {
    tl.to(glowItem, {
      boxShadow: '0 0 40px rgba(245, 158, 11, 0.5)',
      duration: 0.4,
      ease: 'power2.out',
    }, 1.7)
    tl.to(glowItem, {
      boxShadow: '0 0 30px rgba(245, 158, 11, 0.3)',
      duration: 0.6,
      ease: 'power2.inOut',
    }, 2.1)
  }
}

onSlideEnter(() => {
  buildTimeline()
})

onSlideLeave(() => {
  tl?.kill()
  tl = null
  resetElements()
})

onMounted(() => {
  resetElements()
})
</script>

<template>
  <div ref="containerRef" class="evolution-timeline">
    <div class="evo-tl-item evo-item">
      <span class="evo-label">Prompt Eng.</span>
      <span class="evo-desc">Craft better prompts</span>
    </div>
    <div class="evo-tl-arrow evo-arrow">→</div>
    <div class="evo-tl-item evo-item">
      <span class="evo-label">Context Eng.</span>
      <span class="evo-desc">Cultivate relevant context</span>
    </div>
    <div class="evo-tl-arrow evo-arrow">→</div>
    <div class="evo-tl-item evo-tl-highlight evo-item highlight">
      <span class="evo-label">Environment Eng.</span>
      <span class="evo-desc">Design the world agents live in</span>
    </div>
  </div>
</template>
