<script setup lang="ts">
/**
 * GlowReveal — wraps an element and plays a GSAP glow pulse when it becomes visible.
 * Uses MutationObserver + opacity check to detect v-click/v-motion reveals.
 * Resets when the element hides so the pulse replays on re-reveal.
 *
 * Usage: <GlowReveal><div class="my-card">...</div></GlowReveal>
 */
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

const props = defineProps<{
  glow?: string
  settledGlow?: string
}>()

const elRef = ref<HTMLElement>()
let visible = false
let observer: MutationObserver | null = null
let tl: gsap.core.Timeline | null = null

const brightGlow = props.glow ?? '0 0 28px rgba(245, 158, 11, 0.4)'
const normalGlow = props.settledGlow ?? '0 0 20px rgba(245, 158, 11, 0.3)'

function check() {
  if (!elRef.value) return
  const child = elRef.value.firstElementChild as HTMLElement | null
  if (!child) return

  const isVisible = parseFloat(getComputedStyle(child).opacity) >= 0.5

  if (isVisible && !visible) {
    visible = true
    tl?.kill()
    tl = gsap.timeline()
    tl.to(child, { boxShadow: brightGlow, duration: 0.4, ease: 'power2.out' })
    tl.to(child, { boxShadow: normalGlow, duration: 0.6, ease: 'power2.inOut' })
  } else if (!isVisible && visible) {
    visible = false
    tl?.kill()
  }
}

onMounted(() => {
  if (!elRef.value) return

  observer = new MutationObserver(() => check())
  observer.observe(elRef.value, {
    attributes: true,
    attributeFilter: ['style', 'class'],
    subtree: true,
  })

  check()
})

onUnmounted(() => {
  observer?.disconnect()
  tl?.kill()
})
</script>

<template>
  <span ref="elRef" style="display: contents;"><slot /></span>
</template>
