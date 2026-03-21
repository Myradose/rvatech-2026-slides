<script setup lang="ts">
/**
 * DemoSlide — CSS-transitioned title with Pocket Manager reveal.
 *
 * Accepts `clicks` as a prop (from $clicks) so the portal preview
 * renders the correct state (slide-scoped, not global nav).
 */
defineProps<{
  title: string
  subtitle: string
  clicks: number
}>()
</script>

<template>
  <div class="demo-slide-root">
    <div :class="['demo-title-wrap', { 'demo-centered': clicks < 1 }]">
      <h1>{{ title }}</h1>
    </div>
    <p :class="['demo-subtitle', { 'demo-subtitle-hidden': clicks >= 1 }]">{{ subtitle }}</p>
    <div :class="['demo-viewer-container', { 'demo-viewer-shown': clicks >= 1 }]">
      <slot />
    </div>
  </div>
</template>
