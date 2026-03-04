<script setup lang="ts">
/**
 * AnimatedText — GSAP-powered text reveal
 *
 * Splits text into words and animates them in with a stagger.
 * Uses onSlideEnter to trigger only when the slide becomes active.
 *
 * Usage:
 *   <AnimatedText text="Hello world" />
 *   <AnimatedText text="Hello world" tag="h1" :delay="0.5" />
 */
import { ref, onMounted } from 'vue'
import { onSlideEnter, onSlideLeave } from '@slidev/client'
import gsap from 'gsap'

const props = withDefaults(defineProps<{
  text: string
  tag?: string
  delay?: number
  stagger?: number
  duration?: number
}>(), {
  tag: 'p',
  delay: 0,
  stagger: 0.08,
  duration: 0.6,
})

const containerRef = ref<HTMLElement>()
const words = props.text.split(' ')
let tl: gsap.core.Timeline | null = null

onSlideEnter(() => {
  if (!containerRef.value) return

  const wordEls = containerRef.value.querySelectorAll('.anim-word')

  tl = gsap.timeline({ delay: props.delay })
  tl.fromTo(
    wordEls,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: props.duration,
      stagger: props.stagger,
      ease: 'power2.out',
    },
  )
})

onSlideLeave(() => {
  tl?.kill()
  tl = null
  // Reset words to hidden state
  if (containerRef.value) {
    const wordEls = containerRef.value.querySelectorAll('.anim-word')
    gsap.set(wordEls, { opacity: 0, y: 20 })
  }
})

onMounted(() => {
  // Start hidden
  if (containerRef.value) {
    const wordEls = containerRef.value.querySelectorAll('.anim-word')
    gsap.set(wordEls, { opacity: 0, y: 20 })
  }
})
</script>

<template>
  <component :is="tag" ref="containerRef" class="animated-text">
    <span
      v-for="(word, i) in words"
      :key="i"
      class="anim-word"
    >{{ word }}&nbsp;</span>
  </component>
</template>

<style scoped>
.animated-text {
  overflow: hidden;
}

.anim-word {
  display: inline-block;
  will-change: transform, opacity;
}
</style>
