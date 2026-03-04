# Design Direction

## Theme

Dark, cinematic, minimal. The Doctor Strange connection is a flavor — not a costume.

The visual identity should feel like a polished tech keynote that happens to have a few moments of magic. Think: dark backgrounds, crisp white/light text, one accent color, and purposeful motion.

## Color Palette

| Role | Color | Notes |
|------|-------|-------|
| Background | `#0a0a0f` — near-black with a slight blue tint | Avoids pure black, feels more cinematic |
| Primary text | `#e8e8ed` — soft white | Easier on the eyes than pure white |
| Secondary text | `#6b7280` — muted gray | For subtitles, captions |
| Accent | `#f59e0b` → `#f97316` — warm amber/orange | Doctor Strange portal color. Used sparingly for emphasis. |
| Accent glow | `#f59e0b` with blur/opacity | For the portal, highlighted elements |
| Code background | `#12121a` | Slightly lighter than slide background |
| Success/positive | `#10b981` — green | For "environment engineering" highlight |

## Typography

- **Headings:** A clean geometric sans-serif. Candidates: Inter, Satoshi, or General Sans.
- **Body:** Same family at lighter weight, or a complementary sans.
- **Code:** JetBrains Mono or Fira Code (with ligatures).
- **Scale:** Large headings (48-72px equivalent), comfortable body (24-28px). Generous line height.

## Layout Principles

- **Generous whitespace** — slides should breathe. If it feels empty, it's probably right.
- **Left-aligned by default** — centered text only for title/closing slides.
- **One idea per slide** — if you're cramming, split it.
- **Max ~5 bullet points** — prefer diagrams or progressive reveals over long lists.
- **Code blocks are first-class** — large, readable, syntax-highlighted.

## Animation Principles

- **Easing:** Use `power2.inOut` or `power3.out` as defaults. No linear motion. No bouncy spring effects.
- **Duration:** 0.4-0.8s for standard transitions. 1-2s for hero moments. Nothing should feel sluggish.
- **Stagger:** 0.08-0.12s between items in a list. Enough to feel sequential, not enough to feel slow.
- **Direction:** Elements generally enter from the bottom or left. Exits go up or fade.
- **Restraint:** If an animation doesn't guide the eye to important content, remove it.

## Slide Transitions

- **Default:** Fade with a slight vertical shift (GSAP-driven, overriding Slidev default).
- **Section changes:** Slightly longer fade, maybe a subtle scale.
- **Portal transition:** The one big custom transition (Three.js portal opening → camera pushes through → next slide revealed).

## Diagrams & Architecture

- **Style:** Clean boxes and arrows on the dark background. Rounded corners, thin borders, subtle shadows.
- **Build-up:** Diagrams animate in piece by piece rather than appearing all at once.
- **Highlight:** Active/current elements in accent color, others in muted gray.

## Portal Visual Reference

The Doctor Strange portal is a glowing ring of orange energy with sparks:
- Torus shape, slightly wobbly/organic rotation
- Inner glow (bloom post-processing)
- Small particle sparks orbiting and flying off
- The center is either transparent (showing what's "through" it) or has a slight distortion
- Color: warm amber/orange gradient matching the accent palette
- Should feel magical but not cartoonish — grounded in the cinematic MCU look

## What to Avoid

- Gratuitous 3D or particle effects on every slide
- Neon/cyberpunk aesthetics (too busy, wrong tone)
- Excessive color — the palette is intentionally narrow
- Slide transitions that take longer than 1 second (except the portal)
- Background music or sound effects
- Clip art, stock photos, or generic AI-generated images
- Rounded-rectangle cards everywhere (a common Slidev trap)
