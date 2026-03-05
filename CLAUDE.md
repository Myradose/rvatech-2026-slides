# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Slidev presentation for the RVATech Data & AI Summit 2026 talk: "The Doctor Strange Approach to Parallel Agent Orchestration." The presentation uses Three.js for a 3D portal effect and GSAP for all animations.

## Commands

```bash
npm run dev      # Start Slidev dev server (hot-reload at http://localhost:3017)
npm run build    # Build static SPA to dist/
npm run export   # Export slides to PDF
```

No test suite or linter is configured.

## Architecture

**Slidev** is the presentation framework — slides are authored in Markdown (`slides.md`) with Vue components embedded inline. The frontmatter at the top of `slides.md` configures theme, fonts, transitions, and aspect ratio.

### Key files

| File | Purpose |
|------|---------|
| `slides.md` | All slide content — Markdown with embedded Vue components |
| `global-bottom.vue` | Persistent footer (page number, title) on all slides |
| `components/DoctorStrangePortal.vue` | Hero portal — phase state machine, Slidev integration, GSAP timelines |
| `components/PortalDebugPanel.vue` | Runtime debug panel with feature toggles and parameter sliders |
| `components/AnimatedText.vue` | GSAP word-by-word text reveal |
| `components/EvolutionTimeline.vue` | Animated Prompt Eng → Context Eng → Environment Eng timeline |
| `composables/usePortalScene.ts` | Three.js scene with spark, core glow, and haze subsystems |
| `composables/usePortalNavigation.ts` | Keyboard/click interception for portal phase transitions |

### Portal component architecture

The portal is split across four files, each owning one concern:

- **`DoctorStrangePortal.vue`** — Slidev integration, 4-phase state machine, GSAP timeline orchestration
- **`usePortalScene.ts`** — All Three.js rendering, organized into three subsystems (`createSparkSystem`, `createCoreSystem`, `createHazeSystem`) that the main composable instantiates and calls each frame
- **`usePortalNavigation.ts`** — Captures keyboard/click events, classifies forward/backward intent, and delegates to callbacks provided by the component
- **`PortalDebugPanel.vue`** — Standalone panel (shown with `dev` prop) for toggling features and tuning parameters at runtime

The component has a 4-phase state machine:

- **Phase 0** (idle): Portal not visible, Slidev navigation works normally
- **Phase 1** (creating): Arc draws with sparks, core glow, and haze following
- **Phase 2** (ready): Full ring spinning, next slide visible through portal circle
- **Phase 3** (reversing): Undoing creation animation

On forward from phase 2, GSAP zooms through the portal ring into the next slide, then releases navigation to Slidev.

The Three.js scene (`usePortalScene.ts`) receives a plain `PortalState` object (not reactive) that the component mutates. Each subsystem reads `PortalState` and `PortalSceneOpts` every frame in the `requestAnimationFrame` loop. Feature flags in `PortalSceneOpts` control sparks, core glow, haze, bloom, and ground plane — all toggleable at runtime via the debug panel.

The portal renders the actual next slide inside it using Slidev's internal `SlideContainer`/`SlideWrapper`, clipped to a circular `clip-path`.

Usage in `slides.md`:

```md
<DoctorStrangePortal />
<DoctorStrangePortal :dev="true" />          <!-- show debug panel -->
<DoctorStrangePortal :ring-size="400" :next-slide="15" />
<DoctorStrangePortal :sparks="false" :haze="false" />
```

The `:dev="true"` prop renders the `PortalDebugPanel` overlay with checkboxes to toggle features (sparks, core, haze, bloom, ground) and sliders to tune parameters (ring speed, trail length, bloom strength, etc.) in real time.

### Animation patterns

- Components use `onSlideEnter`/`onSlideLeave` from `@slidev/client` to trigger and clean up GSAP timelines
- Simpler animations use `v-motion` directive (Slidev built-in) directly in `slides.md`
- GSAP timelines are always killed on slide leave to prevent leaks

## Design Constraints

- **Color palette**: Near-black background (`#0a0a0f`), soft white text (`#e8e8ed`), amber/orange accent (`#f59e0b` → `#f97316`)
- **Animation easing**: `power2.inOut` or `power3.out` defaults — no linear, no bouncy springs
- **Duration**: 0.4–0.8s standard, 1–2s hero moments
- **Philosophy**: Minimalist by default; animations guide attention, not distract. The 3D portal works because the rest is restrained.

See `DESIGN.md` for full visual specs and `SLIDE_OUTLINE.md` for per-slide animation budget.

## Agent Skills

The repo includes reference skills at `../.agents/skills/` for Slidev, GSAP, Three.js, and Theatre.js (Theatre.js is intentionally not used — see `STACK.md`). These contain API references and best practices for each library.
