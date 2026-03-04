# Slide Outline

Maps the talk script to a rough slide structure. Each entry notes the visual approach.

---

## Section 1: Opening (slides 1-3)

### Slide 1 — Title
**Content:** "The Doctor Strange Approach to Parallel Agent Orchestration" / Name / Event
**Visual:** Dark background, clean typography. Subtle ambient particle drift. Maybe a faint portal glow in the background.
**Animation:** Title text fades/slides in with GSAP stagger.

### Slide 2 — About Me
**Content:** Brief intro — who I am, what I do.
**Visual:** Minimal. Photo + text layout.
**Animation:** Simple fade-in.

### Slide 3 — Agenda
**Content:** Three topics — evolution of engineering paradigms, Doctor Strange demo, high-level concepts + next steps.
**Visual:** Three items, clean list or horizontal layout.
**Animation:** Items stagger in one by one.

---

## Section 2: The Evolution (slides 4-9)

### Slide 4 — Prompt Engineering
**Content:** Definition + example of basic vs. better prompt.
**Visual:** Side-by-side comparison. Code-block style for the prompts.
**Animation:** First prompt appears, then the improved version slides in beside it.

### Slide 5 — Prompt Engineering Limitations
**Content:** "It had limitations" — transition beat.
**Visual:** Minimal text, maybe the previous comparison fades/dims.
**Animation:** Quick, clean transition.

### Slide 6 — Context Engineering
**Content:** Definition + Angular Material docs example.
**Visual:** Diagram showing context flowing into the LLM. Could build up in steps.
**Animation:** GSAP timeline — prompt appears, then context blocks animate in around it.

### Slide 7 — Capability Engineering
**Content:** Brief mention that context + capability are intertwined.
**Visual:** Extend the previous diagram to include tools/capabilities.
**Animation:** New elements animate into the existing diagram.

### Slide 8 — Coding Agents Today
**Content:** Claude Code, Codex CLI, etc. — what they do well, their limitations.
**Visual:** Logos or icons for the tools. Then a "limitations" overlay or second state.
**Animation:** Tools appear, then limitations text reveals.

### Slide 9 — Environment Engineering (The Big Reveal)
**Content:** The thesis — isolated environments, observability, agent harnesses.
**Visual:** This is a key moment. The evolution timeline: Prompt Eng → Context Eng → **Environment Eng**. The third item should feel elevated/highlighted.
**Animation:** GSAP timeline builds the progression left-to-right, with the final item having extra emphasis (scale, glow, color shift).

---

## Section 3: Demo — Parallel Exploration (slides 10-13)

### Slide 10 — Meet the App
**Content:** "Here's a simple fullstack application..."
**Visual:** Screenshot or embedded view of the plain app.
**Animation:** Fade in.

### Slide 11 — The Decision Point
**Content:** Tabs? Accordions? Side navigation? — the three paths.
**Visual:** Three options laid out. This is where the Doctor Strange metaphor kicks in.
**Animation:** Options appear one by one.

### Slide 12 — Portal Transition (Hero Moment)
**Content:** "I can open up portals and peer into the realities where each one exists."
**Visual:** **Three.js Doctor Strange portal** — the glowing orange ring opens, camera pushes through it.
**Animation:** Portal spins up (Three.js), GSAP drives the camera push, lands on the demo view.

### Slide 13 — Live Demo: Parallel Agents
**Content:** Switch to the TSK dashboard, show agents running, show results.
**Visual:** This is a live demo — the slide might just be a frame/context around the actual browser demo.
**Animation:** Minimal — the demo itself is the visual.

---

## Section 4: Concepts + Architecture (slides 14-17)

### Slide 14 — How It Works
**Content:** Isolated Docker containers, each with full stack.
**Visual:** Architecture diagram — containers, agent, host machine.
**Animation:** GSAP builds the diagram step by step.

### Slide 15 — Observability
**Content:** Claude Code Viewer dashboard, logs, frontend, VNC.
**Visual:** Screenshot or diagram of the viewer.
**Animation:** Simple reveal.

### Slide 16 — Safety
**Content:** Sandboxed, no risk to real codebase, network restrictions.
**Visual:** Container with a "shield" or boundary visual.
**Animation:** Subtle.

### Slide 17 — Agent Harness (Brief)
**Content:** Mention the concept, point to resources.
**Visual:** Minimal text.
**Animation:** Simple.

---

## Section 5: What If? (slides 18-21)

### Slide 18 — What If: Architect Agents
**Content:** What if an agent designed the tasks for other agents?
**Visual:** Diagram — architect agent at top, spawning worker agents below.
**Animation:** GSAP builds the hierarchy.

### Slide 19 — What If: Race Conditions
**Content:** Multiple agents on same task, first one wins.
**Visual:** Racing lanes or parallel arrows converging.
**Animation:** Arrows animate forward, one reaches the finish first.

### Slide 20 — What If: Model Comparison
**Content:** Different LLMs tackling the same task.
**Visual:** Model logos/names in parallel lanes.
**Animation:** Similar to previous but with model identifiers.

### Slide 21 — What If: Developer as Architect
**Content:** The vision — devs design, agents build.
**Visual:** Key quote/statement. Larger typography.
**Animation:** Text reveal, maybe word-by-word with GSAP SplitText.

---

## Section 6: Demo 2 + Close (slides 22-25)

### Slide 22 — Demo 2 Setup
**Content:** UI design agent spawning 5 parallel agents.
**Visual:** Brief setup slide before switching to live demo.
**Animation:** Simple.

### Slide 23 — Live Demo 2
**Content:** Kick off the agents, switch to dashboard.
**Visual:** Live demo.
**Animation:** N/A.

### Slide 24 — Resources + Open Source
**Content:** Links to source code, recording, resources, shoutouts.
**Visual:** Clean list of links/QR codes.
**Animation:** Fade in.

### Slide 25 — Q&A / Thank You
**Content:** "Thank you" + open floor for questions.
**Visual:** Clean closing slide. Maybe the portal as a subtle background element again.
**Animation:** Gentle ambient motion while Q&A happens.

---

## Animation Budget

Rough classification of how much animation effort each slide gets:

| Level | Slides | Description |
|-------|--------|-------------|
| **Hero** | 12 (portal) | Three.js 3D portal, major production |
| **Rich** | 1, 6-7, 9, 14, 18-19, 21 | Multi-step GSAP timelines, diagram builds |
| **Standard** | 3-5, 8, 10-11, 15-16, 20 | Simple GSAP fades, staggers, reveals |
| **Minimal** | 2, 13, 17, 22-25 | Basic transitions, static content |
