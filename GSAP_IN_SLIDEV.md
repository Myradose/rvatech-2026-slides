# Integrating GSAP into Slidev

A guide to using GSAP animations in Slidev presentations without fighting the framework.

---

## Decision: Do You Actually Need GSAP?

Before reaching for GSAP, check if Slidev's built-in tools cover your case:

| Need | Slidev-native solution |
|------|----------------------|
| Click-based show/hide | `v-click`, `<v-clicks>` |
| Click-based movement/scale/fade | `v-motion` with `:click-N` states |
| Enter animation | `v-motion` with `:initial` / `:enter` |
| Staggered list reveals | `<v-clicks>` |
| Slide transitions | Frontmatter `transition:` property |

**Use GSAP when you need:** multi-step timelines, staggered animations with custom easing, SVG path drawing, coordinated sequences across multiple elements, or anything `v-motion` can't express.

---

## Pattern 1: Component Alongside Markdown (Recommended)

The component handles only the animated element. The rest of the slide stays as Markdown in the default layout — inheriting all Slidev styles automatically.

### slides.md

```md
---
clicks: 3
---

# My Slide Title

<MyAnimation />

- Regular bullet point
- Another bullet point
```

### components/MyAnimation.vue

```vue
<script setup>
import { onSlideEnter, onSlideLeave, useNav } from '@slidev/client'
import gsap from 'gsap'
import { ref, watch } from 'vue'

const containerRef = ref()
const nav = useNav()
let tl

onSlideEnter(() => {
  // Build the timeline on slide entry
  tl = gsap.timeline({ paused: true })
  tl.from('.my-item', {
    opacity: 0,
    y: 20,
    stagger: 0.15,
    duration: 0.5,
    ease: 'power2.out',
  })

  // If entering with clicks already advanced, jump to end
  if (nav.clicks.value >= 1) {
    tl.progress(1)
  }
})

onSlideLeave(() => {
  // Always kill timelines on leave to prevent leaks
  tl?.kill()
  tl = null
})

// React to click changes
watch(() => nav.clicks.value, (clicks) => {
  if (clicks >= 1) tl?.play()
  else tl?.reverse()
})
</script>

<template>
  <div ref="containerRef">
    <div class="my-item">Animated item 1</div>
    <div class="my-item">Animated item 2</div>
    <div class="my-item">Animated item 3</div>
  </div>
</template>
```

**Key points:**
- The default layout provides all standard Slidev styling (padding, typography, transitions)
- The component only owns the animated part — title, bullets, etc. stay as Markdown
- GSAP targets are inside the component's own template

---

## Pattern 2: Custom Layout (Full Slide Control + Slidev Styles)

When GSAP needs to control the entire slide but you still want Slidev's default styling, create a custom layout.

### layouts/animated-diagram.vue

```vue
<template>
  <div class="slidev-layout animated-diagram">
    <slot />
  </div>
</template>

<style scoped>
.animated-diagram {
  /* Inherits all Slidev defaults via .slidev-layout */
  /* Add layout-specific styles here */
}
</style>
```

### slides.md

```md
---
layout: animated-diagram
---

# Title Here

Content rendered via `<slot />`
```

**Why this works:** The `class="slidev-layout"` on the root element inherits all of Slidev's default styling — padding (`40px 56px`), h1 sizing, list markers, and v-click transitions. Your Markdown content flows into the `<slot />` and renders identically to the default layout.

---

## Pattern 3: Full Custom Component (Escape Hatch)

Use `layout: none` with a full-page component only when you need complete control and accept the tradeoff of manually matching all styles.

### slides.md

```md
---
layout: none
clicks: 3
---

<MyFullSlide />
```

### components/MyFullSlide.vue

```vue
<script setup>
import { onSlideEnter, onSlideLeave, useNav } from '@slidev/client'
import gsap from 'gsap'
// ... GSAP logic
</script>

<template>
  <div class="my-slide">
    <!-- You own everything here -->
  </div>
</template>

<style scoped>
.my-slide {
  position: absolute;
  inset: 0;
  /* Must manually set: padding, background, font sizes, list styles, etc. */
  padding: 40px 56px;
  background: var(--color-bg);
  color: var(--color-text);
}
</style>
```

**Tradeoffs:**
- No `.slidev-layout` wrapper — must manually match padding, typography, transitions
- `v-click` directives still work inside components, but `.slidev-vclick-target` transitions may need explicit overrides due to specificity
- Good for: the Three.js portal, full-canvas visualizations, non-standard layouts

---

## Lifecycle Rules

```
onSlideEnter  →  Build/start timelines, check current click state
onSlideLeave  →  Kill all timelines, reset state
watch(clicks)  →  React to click changes (forward and backward)
```

**Never use `onMounted`/`onUnmounted`** — Slidev keeps component instances alive even when the slide is not active.

**Always handle re-entry:** When a user navigates backward to a slide, `onSlideEnter` fires again. Check `nav.clicks.value` to determine whether to play from the start or jump to the correct state.

```js
onSlideEnter(() => {
  buildTimeline()

  // Jump to correct state if entering mid-slide
  if (nav.clicks.value >= 2) {
    tl.progress(1) // or seek to a specific label
  } else if (nav.clicks.value >= 1) {
    tl.play()
  }
})
```

**Always handle backward navigation:** Watch clicks for decreases, not just increases.

```js
watch(() => nav.clicks.value, (clicks, prev) => {
  if (clicks > prev) tl?.play()
  else tl?.reverse()
})
```

---

## v-motion Tips (When GSAP Isn't Needed)

Slidev's `v-motion` uses `@vueuse/motion` (popmotion under the hood). Key gotchas:

### Default is spring, not tween

```md
<!-- Rubber-bands! Spring is the default -->
<div v-motion :initial="{ x: 200 }" :click-1="{ x: 0 }">

<!-- Smooth tween — specify type explicitly -->
<div v-motion
  :initial="{ x: 200, transition: { type: 'tween', duration: 600, ease: 'easeInOut' } }"
  :click-1="{ x: 0, transition: { type: 'tween', duration: 600, ease: 'easeInOut' } }"
>
```

### Reverse uses the target state's transition

When going backward (click-1 → initial), v-motion uses the `transition` defined on `:initial`. Define transitions on both states for smooth bidirectional animation.

### Canvas dimensions are fixed

Slidev renders at a fixed canvas size (default 980x552). Hardcoded pixel offsets in `v-motion` are safe — they won't break at different viewport sizes because Slidev scales the entire canvas.

### Combining v-click with v-motion

The established pattern for animated reveals:

```md
<div v-click v-motion
  :initial="{ opacity: 0, y: 24 }"
  :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
>

- Content appears with fade + slide on click

</div>
```

`v-click` handles the visibility toggle; `v-motion :enter` handles the animation.

---

## Design Constraints (This Presentation)

| Property | Value |
|----------|-------|
| Easing | `power2.inOut` or `power3.out` — no linear, no bouncy |
| Duration | 0.4–0.8s standard, 1–2s hero moments |
| Stagger | 0.1–0.2s between items |
| Canvas | 980x552, padding 40px 56px |
| Colors | `--color-bg: #0a0a0f`, `--color-accent: #f59e0b` |

---

## Summary

| Scenario | Approach |
|----------|----------|
| Simple click animations | `v-motion` with `:click-N` states |
| Staggered list reveals | `<v-clicks>` or `v-click` + `v-motion :enter` |
| Complex GSAP timeline, part of slide | **Pattern 1** — Component alongside Markdown |
| Complex GSAP timeline, full slide with Slidev styles | **Pattern 2** — Custom layout with `.slidev-layout` |
| Full canvas takeover (Three.js, etc.) | **Pattern 3** — `layout: none` with manual styles |
