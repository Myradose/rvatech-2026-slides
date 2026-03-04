# Presentation Tech Stack

## Overview

The presentation is built with **Slidev** as the core framework, enhanced with **GSAP** for animations/transitions and **Three.js** for 1-2 hero visual moments tied to the Doctor Strange theme.

**Theatre.js is not used.** GSAP covers all animation needs more simply, and Theatre.js's timeline editor workflow adds complexity without meaningful benefit for a presentation context.

---

## Core: Slidev

**Role:** Presentation framework — all slides, layout, navigation, and content.

Slidev is a Markdown-based slide framework for developers. It supports Vue components, code highlighting, presenter notes, and has a built-in presenter mode with timer/notes. This is the backbone of everything.

**Why Slidev:**
- Markdown-first means content is easy to write and version control
- Vue component support lets us embed custom animations (GSAP, Three.js) directly into slides
- Built-in transitions, slide layouts, and theming
- Code blocks with syntax highlighting and step-through (great for the demo/architecture slides)
- Presenter mode with notes and timer (critical for a 30-min talk)
- Exports to PDF as a fallback

**What it handles:**
- All slide content and structure
- Basic slide transitions (can be overridden with custom GSAP transitions)
- Code snippets and syntax highlighting
- Presenter notes for each slide
- Dark theme base styling

---

## Animations: GSAP

**Role:** The workhorse for all motion — slide transitions, element animations, scroll/reveal effects.

GSAP (GreenSock Animation Platform) is the industry standard for web animation. It handles everything from subtle text fades to complex choreographed sequences.

**Why GSAP over Theatre.js or CSS animations:**
- Simpler API, no editor workflow needed
- Better performance than CSS for complex sequences
- Timeline feature lets us choreograph multi-step animations within a slide
- ScrollTrigger/observer plugins work well with Slidev's slide progression
- Huge ecosystem and documentation
- SplitText plugin for character/word-level text animations

**What it handles:**
- Custom slide transitions (replacing Slidev defaults where needed)
- Element entrance/exit animations (fade, slide, scale)
- Text reveal animations (words appearing one at a time, typewriter effects)
- Diagram/architecture build-up animations (boxes and arrows appearing in sequence)
- Subtle ambient motion (floating particles, gentle pulses)
- The "evolution timeline" animation (prompt eng → context eng → environment eng)
- Demo section transitions

**Key plugins likely used:**
- `gsap.core` — tweens and timelines
- `ScrollTrigger` or custom triggers tied to Slidev navigation
- `SplitText` — text animation (if we want word-by-word reveals)
- `Flip` — layout transitions between states (if needed)

---

## Hero Visuals: Three.js

**Role:** 1-2 standout 3D visual moments tied to the Doctor Strange theme.

Three.js is only used for specific high-impact moments, not throughout the entire presentation. The rest stays clean and minimal. These are the "wow factor" slides that tie into the Doctor Strange metaphor.

**Why Three.js (and why sparingly):**
- 3D portal effect is the kind of thing that genuinely needs WebGL
- Keeps the presentation grounded — most slides are clean and typographic
- The contrast between minimal slides and a 3D moment makes the 3D moment hit harder
- Avoids the "tech demo masquerading as a presentation" trap

**Planned uses:**

### 1. Doctor Strange Portal (Primary)

A glowing, rotating portal rendered in 3D — the iconic orange sparking ring. This serves as a visual anchor for the "parallel realities" metaphor.

**Possible applications:**
- **Transition into the demo section** — portal opens, camera flies through it, lands on the demo slide
- **Background element** on the "Doctor Strange Approach" title slide
- **Idle animation** during the live demo while agents are running

**Implementation approach:**
- Torus geometry with custom shader for the sparking/energy effect
- Particle system for the sparks
- Post-processing bloom for the glow
- Runs in a Vue component embedded in the Slidev slide

### 2. Astral Projection Effect (Stretch Goal)

The moment where Doctor Strange gets hit and his astral form separates from his body. This could work as a metaphor for agents being "projected" into isolated environments.

**Possible applications:**
- Transition between "current limitations" and "environment engineering" sections
- Visual metaphor: the "physical" (current approach) separates from the "astral" (new approach)

**Implementation approach:**
- Two overlapping layers — one solid, one semi-transparent with a glow
- GSAP-driven separation animation (the astral form drifts away)
- Could be 2D with GSAP rather than full 3D (simpler, might look just as good)
- Chromatic aberration or displacement shader for the "ethereal" feel

**Note:** This is a stretch goal. If it proves too complex for the payoff, skip it. The portal alone carries the theme.

---

## Not Used: Theatre.js

Theatre.js is a powerful animation studio with a visual timeline editor. It excels at precise, choreographed animations — particularly for film-quality sequences or interactive experiences where you want to scrub through a timeline.

**Why it's excluded:**
- The visual editor workflow (design in browser → export state) adds friction to the dev process
- GSAP's code-first timeline API achieves the same choreography with less setup
- Theatre.js shines when you need a non-developer to tweak animation timing — that's not our case
- Adding another animation runtime alongside GSAP increases bundle size and complexity
- For a presentation, code-defined animations are easier to version control and iterate on

**When to reconsider:** If we end up with a complex 3D scene (e.g., a full Doctor Strange environment with multiple animated elements), Theatre.js's visual editor for Three.js scenes (`@theatre/r3f`) could be valuable. But for 1-2 Three.js moments, code-driven animation is simpler.

---

## Stack Summary

| Layer | Tool | Scope |
|-------|------|-------|
| Presentation framework | Slidev | All slides, content, navigation, presenter mode |
| Animation (primary) | GSAP | All transitions, text animations, element motion |
| 3D visuals (accent) | Three.js | 1-2 hero moments (portal, possibly astral projection) |
| Animation editor | ~~Theatre.js~~ | Not used — GSAP covers our needs |

## Design Philosophy

- **Minimalist by default** — clean typography, generous whitespace, dark theme
- **Motion with purpose** — animations guide attention, not distract from content
- **Hero moments earn their weight** — the 3D effects work *because* the rest is restrained
- **Content first** — if an animation doesn't serve the narrative, cut it
