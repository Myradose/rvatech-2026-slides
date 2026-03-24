<script setup lang="ts">
/**
 * DemoSlide -- Centered title with optional button-triggered video reveal.
 *
 * When a `video` prop is provided, a "Show Demo" button appears below the
 * subtitle. Clicking it triggers the slide-up animation and reveals the
 * video with playback controls. Pressing left arrow reverses the animation.
 *
 * In dev mode the button is muted/subtle; in production it uses the accent color.
 */
import { ref, onMounted, onUnmounted } from 'vue'

defineProps<{
  title: string
  subtitle: string
  video?: string
}>()

const isProd = import.meta.env.PROD
const showDemo = ref(false)

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft' && showDemo.value) {
    e.stopPropagation()
    e.preventDefault()
    showDemo.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown, { capture: true })
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown, { capture: true })
})
</script>

<template>
  <div class="demo-slide-root">
    <div :class="['demo-title-wrap', { 'demo-centered': !showDemo }]">
      <h1>{{ title }}</h1>
    </div>
    <p :class="['demo-subtitle', { 'demo-subtitle-hidden': showDemo }]">{{ subtitle }}</p>
    <button
      v-if="video && !showDemo"
      :class="['demo-show-btn', { 'demo-show-btn-muted': !isProd }]"
      @click.stop="showDemo = true"
    >
      Show Demo
    </button>
    <div v-if="video" :class="['demo-viewer-container', { 'demo-viewer-shown': showDemo }]" @click.stop>
      <div class="demo-viewer-wrap">
        <video
          class="demo-video"
          :src="video"
          controls
        />
      </div>
    </div>
  </div>
</template>
