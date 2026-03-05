<script setup lang="ts">
/**
 * IsolatedEnvsSlide — Title starts centered above the diagram,
 * then on first click smoothly moves to top-left while bullets reveal.
 *
 * Uses GSAP transform (x, y) for GPU-accelerated movement.
 * The title is positioned at top-left in the DOM; transforms offset
 * it to center initially, then animate back to (0,0) on click.
 */
import { ref, watch, nextTick } from 'vue'
import { useNav, onSlideEnter, onSlideLeave } from '@slidev/client'
import gsap from 'gsap'

const titleRef = ref<HTMLElement>()
const diagramRef = ref<HTMLElement>()
const nav = useNav()
let hasMoved = false
let ready = false

function getCenterOffset() {
  const el = titleRef.value
  if (!el || !el.offsetWidth) return null
  const parent = el.offsetParent as HTMLElement
  if (!parent || !parent.offsetWidth) return null
  // Center horizontally (accounting for scale from center origin), place at ~18% from top
  const cx = (parent.offsetWidth / 2) - (el.offsetLeft + el.offsetWidth / 2)
  const cy = parent.offsetHeight * 0.18 - el.offsetTop
  return { x: cx, y: cy }
}

function applyCenter() {
  const offset = getCenterOffset()
  if (!offset || !titleRef.value) return
  gsap.set(titleRef.value, { x: offset.x, y: offset.y })
}

function applyNormal() {
  if (!titleRef.value) return
  gsap.set(titleRef.value, { x: 0, y: 0 })
}

function animateToNormal() {
  if (!titleRef.value) return
  gsap.to(titleRef.value, { x: 0, y: 0, duration: 0.6, ease: 'power2.inOut' })
}

function resetToCenter() {
  hasMoved = false
  applyCenter()
  if (diagramRef.value) gsap.set(diagramRef.value, { opacity: 0 })
}

function animateDiagramIn() {
  if (diagramRef.value) {
    gsap.to(diagramRef.value, { opacity: 1, duration: 0.6, delay: 0.4, ease: 'power2.out' })
  }
}

function moveTitle() {
  if (hasMoved) return
  hasMoved = true
  animateToNormal()
}

onSlideEnter(async () => {
  ready = false
  await nextTick()
  // Wait one frame for layout to stabilize
  requestAnimationFrame(() => {
    if (nav.clicks.value >= 1) {
      hasMoved = true
      applyNormal()
      if (diagramRef.value) gsap.set(diagramRef.value, { opacity: 1 })
    } else {
      resetToCenter()
      animateDiagramIn()
    }
    ready = true
  })
})

onSlideLeave(() => {
  hasMoved = false
  ready = false
})

function animateToCenter() {
  if (!hasMoved) return
  hasMoved = false
  const offset = getCenterOffset()
  if (!offset || !titleRef.value) return
  gsap.to(titleRef.value, { x: offset.x, y: offset.y, duration: 0.6, ease: 'power2.inOut' })
}

watch(() => nav.clicks.value, (clicks) => {
  if (!ready) return
  if (clicks >= 1) moveTitle()
  else animateToCenter()
})
</script>

<template>
  <div class="iso-slide">
    <h1 ref="titleRef" class="iso-title">Isolated Environments</h1>

    <div class="iso-bullets">
      <ul>
        <li v-click="1">Each agent runs in its own <strong>Docker container</strong> with the full application stack</li>
        <li v-click="2">Containers have <strong>restricted network access</strong> - isolated from your system and each other</li>
        <li v-click="3">Agents can run builds, serve the app, execute tests - all without touching your machine</li>
      </ul>
    </div>

    <div ref="diagramRef" class="env-visual">
      <div class="env-host-box"><carbon:laptop /><span>Your Machine</span></div>
      <div class="env-arrows">
        <span class="env-arrow-down">↓</span>
        <span class="env-arrow-label">tsk start</span>
        <span class="env-arrow-up">↑</span>
        <span class="env-arrow-label">git branches</span>
      </div>
      <div class="env-containers-row">
        <div class="env-box"><carbon:container-software /><span>Tabs</span></div>
        <div class="env-box"><carbon:container-software /><span>Accordions</span></div>
        <div class="env-box"><carbon:container-software /><span>Side Nav</span></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.iso-slide {
  position: absolute;
  inset: 0;
  padding: 40px 56px;
  background: var(--color-bg);
  color: var(--color-text);
  overflow: hidden;
}

.iso-title {
  font-weight: 700 !important;
  font-size: 36px;
  line-height: 48px;
  letter-spacing: -0.02em;
  color: var(--color-text) !important;
  margin: 0 0 12px 0;
  width: fit-content;
  will-change: transform;
  transform-origin: left top;
}

.iso-bullets {
  font-size: 17.6px;
}

.iso-bullets ul {
  list-style: square;
  padding-left: 1.5em;
  margin: 0;
}

.iso-bullets li {
  margin-bottom: 6.4px;
  padding-left: 3.5px;
  line-height: 1.8;
}

.iso-bullets li.slidev-vclick-target {
  transition: opacity 400ms ease 300ms, transform 400ms ease 300ms;
}

.iso-bullets li.slidev-vclick-hidden {
  opacity: 0;
  transform: translateY(8px);
  transition-delay: 0ms;
}

.iso-bullets li::marker {
  color: var(--color-accent);
}
</style>
