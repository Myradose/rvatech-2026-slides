# Animation Patterns in Slidev

A guide to choosing the right animation approach in Slidev — from built-in directives to GSAP timelines.

---

## Decision: Choose the Right Tool

| Need | Approach |
|------|----------|
| Click-based show/hide | `v-click`, `<v-clicks>` |
| Click-based transform animation | `v-motion` with `:click-N` states |
| Enter animation | `v-motion` with `:initial` / `:enter` |
| Staggered list reveals | `<v-clicks>` or `v-click` + `v-motion :enter` |
| Slide transitions | Frontmatter `transition:` property |
| Layout-level repositioning on click | `$clicks` reactive variable + CSS classes |
| Multi-step timelines, SVG drawing, coordinated sequences | GSAP |

**Use GSAP when you need:** multi-step timelines, staggered animations with custom easing, SVG path drawing, coordinated sequences across multiple elements, or anything `v-motion` can't express.

---

## Slidev-Native: `$clicks` with CSS Classes

Slidev exposes `$clicks` as a reactive variable in slide templates. Use it with `:class` bindings to toggle CSS classes on click — letting CSS transitions handle the animation without GSAP or v-motion.

**Best for:** layout-level animations (centering, repositioning, resizing) where CSS should compute positions dynamically rather than hardcoding pixel values.

### Example: Title moves from center to top-left on click

```md
---
clicks: 3
---

<div :class="{ 'title-centered': $clicks < 1 }" class="title-wrap">

# My Title

</div>

<div v-click v-motion
  :initial="{ opacity: 0, y: 24 }"
  :enter="{ opacity: 1, y: 0, transition: { type: 'tween', delay: 400, duration: 400 } }"
>

- First bullet appears after title moves

</div>

<style>
.title-wrap {
  width: fit-content;
  position: relative;
  left: 0;
  transform: translateX(0) translateY(0);
  will-change: left, transform;
  transition: left 0.6s ease-in-out,
              transform 0.6s ease-in-out;
}
.title-wrap.title-centered {
  left: 50%;
  transform: translateX(-50%) translateY(60px);
}
</style>
```

### How it works

The classic CSS centering trick: `left: 50%` moves the element's left edge to the parent's center, then `translateX(-50%)` shifts it back by half its own width. This centers any element regardless of its width — no measurement or hardcoding needed.

When `$clicks >= 1`, the `.title-centered` class is removed. CSS transitions animate both `left` (50% -> 0) and `transform` (translateX(-50%) -> translateX(0)) simultaneously. Because both properties scale by the same factor during the transition, the element follows a smooth path from center to its normal position.

### Why not v-motion for this?

`v-motion` only supports numeric transform properties (`x`, `y`, `scale`, `opacity`). It can't express "center of parent" — you'd need to hardcode the pixel offset (e.g., `x: 250`), which breaks if the title text changes.

### Smoothness tradeoff

Animating `left` triggers layout reflow rather than GPU-composited transforms. For a single element on Slidev's fixed canvas (980x552), this is imperceptible. For many simultaneous animations, prefer pure `transform`-based approaches (v-motion or GSAP).

### Combining with v-click + v-motion

`$clicks` class toggles work alongside `v-click` and `v-motion` on other elements in the same slide. Use the first bullet's `delay` to stagger it after the title animation completes, preventing overlap.

---

## Slidev-Native: v-motion

Slidev's `v-motion` uses `@vueuse/motion` (popmotion under the hood). It animates transform properties and supports click-based state transitions.

### Default is spring, not tween

```md
<!-- Rubber-bands! Spring is the default -->
<div v-motion :initial="{ x: 200 }" :click-1="{ x: 0 }">

<!-- Smooth tween -- specify type explicitly -->
<div v-motion
  :initial="{ x: 200, transition: { type: 'tween', duration: 600, ease: 'easeInOut' } }"
  :click-1="{ x: 0, transition: { type: 'tween', duration: 600, ease: 'easeInOut' } }"
>
```

### Reverse uses the target state's transition

When going backward (click-1 -> initial), v-motion uses the `transition` defined on `:initial`. Define transitions on both states for smooth bidirectional animation.

### Canvas dimensions are fixed

Slidev renders at a fixed canvas size (default 980x552). Hardcoded pixel offsets in `v-motion` are safe — they won't break at different viewport sizes because Slidev scales the entire canvas. But they will break if element dimensions change (e.g., title text gets longer/shorter).

### Combining v-click with v-motion

The established pattern for animated reveals:

```md
<div v-click v-motion
  :initial="{ opacity: 0, y: 24 }"
  :enter="{ opacity: 1, y: 0, transition: { type: 'tween', duration: 400 } }"
>

- Content appears with fade + slide on click

</div>
```

`v-click` handles the visibility toggle; `v-motion :enter` handles the animation.

### Limitations

- Only numeric transform/opacity values — no CSS layout properties (`margin`, `left`, `text-align`)
- Pixel offsets are hardcoded — no `calc()`, no relative centering
- For layout-level animations, use `$clicks` + CSS classes instead

---

## GSAP Pattern 1: Component Alongside Markdown (Recommended)

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
  tl?.kill()
  tl = null
})

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

## GSAP Pattern 2: Custom Layout (Full Slide Control + Slidev Styles)

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

## GSAP Pattern 3: Full Custom Component (Escape Hatch)

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

## Lifecycle Rules (GSAP Components)

```
onSlideEnter  ->  Build/start timelines, check current click state
onSlideLeave  ->  Kill all timelines, reset state
watch(clicks) ->  React to click changes (forward and backward)
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

## Design Constraints (This Presentation)

| Property | Value |
|----------|-------|
| Easing | `power2.inOut` or `power3.out` — no linear, no bouncy |
| CSS easing equivalent | `ease-in-out` |
| Duration | 0.4-0.8s standard, 1-2s hero moments |
| Stagger | 0.1-0.2s between items |
| Canvas | 980x552, padding 40px 56px |
| Colors | `--color-bg: #0a0a0f`, `--color-accent: #f59e0b` |

---

## Summary

| Scenario | Approach |
|----------|----------|
| Simple click show/hide | `v-click`, `<v-clicks>` |
| Click-based transform animation | `v-motion` with `:click-N` states |
| Layout-level repositioning (centering, etc.) | `$clicks` + CSS class toggle |
| Animated reveals | `v-click` + `v-motion :enter` |
| Complex GSAP timeline, part of slide | **GSAP Pattern 1** — Component alongside Markdown |
| Complex GSAP timeline, full slide with Slidev styles | **GSAP Pattern 2** — Custom layout with `.slidev-layout` |
| Full canvas takeover (Three.js, etc.) | **GSAP Pattern 3** — `layout: none` with manual styles |
