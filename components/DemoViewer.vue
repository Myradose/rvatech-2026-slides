<script setup lang="ts">
import { ref, computed } from 'vue'
import { demoUrls } from '../demo-config'

const props = withDefaults(defineProps<{
  /** Key from demoUrls config */
  src?: keyof typeof demoUrls
  /** Or pass a raw URL directly */
  url?: string
}>(), {
  src: 'pocketManager',
})

const iframeSrc = props.url || demoUrls[props.src]
const isProd = import.meta.env.PROD

const demoLabels: Record<string, string> = {
  app: 'Fullstack Test App',
  pocketManager: 'Pocket Manager',
}

const label = computed(() => demoLabels[props.src] || props.src)

const showPlaceholder = ref(isProd)
</script>

<template>
  <div class="demo-viewer-wrap">
    <div v-if="showPlaceholder" class="demo-placeholder">
      <div class="demo-placeholder-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <path d="M8 21h8M12 17v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="demo-placeholder-label">{{ label }}</p>
      <p class="demo-placeholder-hint">{{ isProd ? 'Demo video coming soon' : 'Live demo' }}</p>
    </div>
    <iframe v-else :src="iframeSrc" class="demo-viewer" frameborder="0" allowfullscreen />
    <button
      v-if="!isProd"
      class="demo-toggle-btn"
      @click="showPlaceholder = !showPlaceholder"
    >
      {{ showPlaceholder ? 'Show Live' : 'Show Placeholder' }}
    </button>
  </div>
</template>
