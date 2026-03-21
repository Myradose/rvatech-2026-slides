<script setup lang="ts">
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
</script>

<template>
  <div class="demo-viewer-wrap">
    <iframe :src="iframeSrc" class="demo-viewer" frameborder="0" allowfullscreen />
  </div>
</template>
