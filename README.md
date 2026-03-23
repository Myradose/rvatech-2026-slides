# RVATech 2026 Slides

> **Experimental.** Not production-ready.

Slidev presentation for **"The Doctor Strange Approach to Parallel Agent Orchestration"** at the RVATech Data & AI Summit 2026. Features a Three.js portal effect and GSAP-driven animations.

## Commands

```bash
bun run dev      # Preview at localhost:3017
bun run build    # Build static site
bun run export   # Export to PDF
```

## Key Locations

| Path | Purpose |
|------|---------|
| `slides.md` | All slide content |
| `components/DoctorStrangePortal.vue` | Three.js portal component |
| `composables/usePortalScene.ts` | Three.js scene (sparks, core, haze) |
| `composables/usePortalNavigation.ts` | Keyboard/click navigation |

## Links

- [Landing page](https://myradose.github.io/portal/)
- [Deployed slides](https://myradose.github.io/rvatech-2026-slides/)
