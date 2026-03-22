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

## Section 2: The Evolution (slides 4-8)

### Slide 4 — Prompt Engineering
**Content:** Definition + example of basic vs. better prompt.
**Visual:** Side-by-side comparison. Code-block style for the prompts.
**Animation:** First prompt appears, then the improved version slides in beside it.

### Slide 5 — Context Engineering
**Content:** Definition + the limits of prompt engineering as motivation. Context engineering = giving the model the right knowledge, tools, and instructions. Flow diagram appears at click 2 alongside the explanation text.
**Visual:** Blockquote for the "what if the model doesn't know?" question, then build-up explanation with flow diagram appearing early.
**Animation:** GSAP timeline — elements reveal step by step.

### Slide 6 — Context Engineering in Practice
**Content:** Claude Code, Codex CLI, Gemini CLI, Copilot — what they do behind the scenes. They combine prompts, relevant context, and tools into a seamless experience.
**Visual:** Bullet list with staggered reveals.
**Animation:** Standard v-click staggers.

### Slide 7 — But There Are Limits
**Content:** Agents don't know how to run/test unless told. Running on your machine = babysitting. Approval fatigue. Risk to git history, packages, system.
**Visual:** Bullet list with staggered reveals.
**Animation:** Standard v-click staggers.

### Slide 8 — Environment Engineering (The Big Reveal)
**Content:** The thesis — the next evolution. Isolated environments, observability infrastructure, work retrieval.
**Visual:** This is a key moment. The evolution timeline: Prompt Eng → Context Eng → **Environment Eng**. The third item should feel elevated/highlighted.
**Animation:** GSAP timeline builds the progression left-to-right, with the final item having extra emphasis (scale, glow, color shift).

---

## Section 3: Three Pillars + Demo Setup (slides 9-11)

### Slide 9 — Three Pillars
**Content:** Isolated Environments, Observability Infrastructure, Work Retrieval — the three pillars of environment engineering.
**Visual:** Three cards in a row, each with an icon, title, and one-line description.
**Animation:** Cards stagger in one by one.

### Slide 10 — The Demo (section break)
**Content:** "Instead of explaining further, let me show you."
**Visual:** Section break slide with AnimatedText.
**Animation:** Word-by-word text reveal.

### Slide 11 — Meet the App
**Content:** "A simple fullstack application: users and products."
**Visual:** Screenshot or embedded view of the plain app.
**Animation:** Fade in.

---

## Section 4: Portal + Live Demos (slides 12-16)

### Slide 12 — The Challenge + Portal (Hero Moment)
**Content:** Angular Material needs to be set up. Three AI models — Claude, Gemini, GPT — each tackle it in their own pocket. "Three models. Same task. Let's see what happens."
**Visual:** Three model options appear, then the **Three.js Doctor Strange portal** opens — the glowing orange ring draws, camera pushes through it into the demo.
**Animation:** v-click options, then portal spins up (Three.js), GSAP drives the camera push, lands on the demo view.
**Notes:** Full beat-by-beat choreography with timed pauses and dialogue mapped to animation phases.

### Slide 13 — Live Demo: Multi-Model Race
**Content:** Three models setting up Angular Material simultaneously. Focus walkthrough on one container, then reveal all three. Audience votes on the winner.
**Visual:** This is a live demo — the slide is a frame/context around the actual browser demo.
**Animation:** Minimal — the demo itself is the visual.

### Slide 14 — How It Works (condensed architecture)
**Content:** All three pillars on one slide: isolated environments, observability, work retrieval. Pillar cards + architecture diagram (Your Machine → tsk run → containers → git branches back).
**Visual:** Three pillar cards stagger in, then the architecture diagram auto-animates below.
**Animation:** All auto-animated on entry, no v-clicks. Brisk 20-25 second slide.

### Slide 15 — Demo 2: Design Exploration
**Content:** Three pockets exploring different UI approaches: tabs, accordions, side navigation. Grid view showing all three working simultaneously.
**Visual:** Live demo — grid view in Pocket Manager.
**Animation:** Minimal — the demo itself is the visual.

### Slide 16 — Demo 3: Fire and Forget
**Content:** Kick off three agents building a checkout page. All run through Claude. They work autonomously during closing slides and Q&A.
**Visual:** Live demo — Pocket Manager showing agents starting up.
**Animation:** Minimal. Quick 15-20 second setup then move on.

---

## Section 5: What If? (slides 17-20)

### Slide 17 — "What If?" (section break)
**Content:** Transition into the speculative section. Notes reference all three demos the audience just watched.
**Visual:** AnimatedText section break.
**Animation:** Word-by-word reveal.

### Slide 18 — What If: Architect Agents
**Content:** What if an agent designed the pockets for other agents? Instead of you specifying paths, an architect agent generates design options and creates pocket prompts.
**Visual:** Diagram — architect agent at top, spawning worker agents below.
**Animation:** GSAP builds the hierarchy.

### Slide 19 — What If: Race & Compare
**Content:** Multiple agents same pocket — first one wins. Multiple LLMs same pocket — compare which is best. Multiple approaches same goal — best implementation wins.
**Visual:** Racing lanes or parallel arrows converging.
**Animation:** Staggered bullet reveals.

### Slide 20 — What If: Beyond Developers
**Content:** What if anyone in the organization could use these AI workflows, not just developers? Powerful AI skills exist (presentations, data analysis, document generation) but require a terminal and developer knowledge. The pattern: simple frontend → SDK agent → pocket. The developer builds the workflow once, the entire org benefits.
**Visual:** Two-column layout — bullet points on the left, vertical flow diagram on the right (Employee → Simple Frontend → SDK Agent (highlighted) → Pocket).
**Animation:** Bullets v-click on left, diagram slides in from right.

---

## Section 6: Close (slides 21-24)

### Slide 21 — Looking Ahead
**Content:** Agent teams (orchestrator/developer/integrator roles coordinating through git) and rewind timeline (instant Btrfs snapshots before every tool call, branching DAG). Two cards side by side. Footer mentions cloud scaling.
**Visual:** Minimal, forward-looking. Clean text with accent highlights.
**Animation:** Simple staggered reveals.

### Slide 22 — Developer as Architect
**Content:** The vision — what if developers designed *how* features get built instead of building every one by hand? Emotional peak of the close, lands while energy is high.
**Visual:** Key quote/statement. Larger typography.
**Animation:** Text reveal, word-by-word with GSAP.

### Slide 23 — Resources
**Content:** Open source (experimental), presentation + recording availability, QR code. Tech community shoutouts: tsk, Claude Code Viewer (Pocket Manager), Cole Medin.
**Visual:** Clean list with QR code on the right.
**Animation:** Staggered fade in.

### Slide 24 — Thank You
**Content:** Personal acknowledgments (Mike Cleary, Dana McMurray, Radha Manohar). Spoken story about Allianz Partners support. Transition to Q&A with checkout page agent check-in.
**Visual:** Names centered, QR code in corner.
**Animation:** Simple fade in.

---

## Animation Budget

Rough classification of how much animation effort each slide gets:

| Level | Slides | Description |
|-------|--------|-------------|
| **Hero** | 12 (portal) | Three.js 3D portal, major production |
| **Rich** | 1, 5, 8, 14, 18, 22 | Multi-step GSAP timelines, diagram builds |
| **Standard** | 3-4, 6-7, 9, 11, 19-20 | Simple GSAP fades, staggers, reveals |
| **Minimal** | 2, 10, 13, 15-17, 21, 23-24 | Basic transitions, static content |
