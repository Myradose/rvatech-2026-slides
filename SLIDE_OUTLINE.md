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
**Content:** Definition + the limits of prompt engineering as motivation. Context engineering = giving the model the right knowledge, tools, and instructions. Capability engineering is folded in here — tools are a form of context.
**Visual:** Blockquote for the "what if the model doesn't know?" question, then build-up explanation.
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

## Section 3: Three Pillars + Demo Setup (slides 9-12)

### Slide 9 — Three Pillars
**Content:** Isolated Environments, Observability Infrastructure, Work Retrieval — the three pillars of environment engineering.
**Visual:** Three cards in a row, each with an icon, title, and one-line description.
**Animation:** Cards stagger in one by one.

### Slide 10 — The Demo (section break)
**Content:** "Instead of explaining further, let me show you."
**Visual:** Section break slide with AnimatedText.
**Animation:** Word-by-word text reveal.

### Slide 11 — Meet the App
**Content:** "Here's a simple fullstack application..."
**Visual:** Screenshot or embedded view of the plain app.
**Animation:** Fade in.

### Slide 12 — The Decision Point + Portal (Hero Moment)
**Content:** Tabs? Accordions? Side navigation? — the three paths. "What if we could see all of them?"
**Visual:** Three options appear, then the **Three.js Doctor Strange portal** opens — the glowing orange ring draws, camera pushes through it into the demo.
**Animation:** v-click options, then portal spins up (Three.js), GSAP drives the camera push, lands on the demo view.

---

## Section 4: Live Demo 1 (slide 13)

### Slide 13 — Live Demo: Parallel Agents
**Content:** Switch to the TSK dashboard, show agents running, show results.
**Visual:** This is a live demo — the slide is a frame/context around the actual browser demo.
**Animation:** Minimal — the demo itself is the visual.

---

## Section 5: Concepts + Architecture (slides 14-16)

### Slide 14 — Isolated Environments
**Content:** Each agent runs in its own Docker container with the full stack. Containers have restricted network access — isolated from everything.
**Visual:** Architecture diagram or visual showing containers, agent, host machine.
**Animation:** GSAP builds the diagram step by step, or staggered bullet reveals.

### Slide 15 — Observability
**Content:** Claude Code Viewer dashboard — watch logs, live frontends, and browser actions in real time. This is what makes the workflow practical rather than a black box.
**Visual:** Screenshot or diagram of the viewer.
**Animation:** Simple reveal.

### Slide 16 — Safety & Work Retrieval
**Content:** No risk to your real codebase — sandboxed from start to finish. Pull git branches and artifacts out of each container when done. Review and merge the "reality" you want.
**Visual:** Minimal, clean bullet reveals.
**Animation:** Subtle staggered reveals.

---

## Section 6: What If? (slides 17-20)

### Slide 17 — "What If?" (section break)
**Content:** Transition into the speculative section.
**Visual:** AnimatedText section break.
**Animation:** Word-by-word reveal.

### Slide 18 — What If: Architect Agents
**Content:** What if an agent designed the tasks for other agents? Instead of you specifying paths, an architect agent generates design options and creates task prompts.
**Visual:** Diagram — architect agent at top, spawning worker agents below.
**Animation:** GSAP builds the hierarchy.

### Slide 19 — What If: Race & Compare
**Content:** Multiple agents same task — first one wins. Multiple LLMs same task — compare which is best. Multiple approaches same goal — best implementation wins.
**Visual:** Racing lanes or parallel arrows converging.
**Animation:** Staggered bullet reveals.

### Slide 20 — What If: Beyond Developers
**Content:** What if anyone in the organization could use these AI workflows, not just developers? Powerful AI skills exist (presentations, data analysis, document generation) but require a terminal and developer knowledge. The pattern: simple frontend → SDK agent → tsk sandbox. The developer builds the workflow once, the entire org benefits.
**Visual:** Two-column layout — bullet points on the left, vertical flow diagram on the right (Employee → Simple Frontend → SDK Agent (highlighted) → tsk Sandbox).
**Animation:** Bullets v-click on left, diagram slides in from right.

---

## Section 7: Demo 2 + Close (slides 21-25)

### Slide 21 — Demo 2: UI Design Agent
**Content:** An agent that specializes in UI design generates 5 different themes, then spawns 5 parallel agents to implement them. Brief mention of agent harness concept — the agent harness is what makes this possible, and it's an important area for the future.
**Visual:** Brief setup slide before switching to live demo.
**Animation:** Simple v-click reveals.

### Slide 22 — Developer as Architect
**Content:** The vision — what if developers designed *how* features get built instead of building every one by hand?
**Visual:** Key quote/statement. Larger typography.
**Animation:** Text reveal, word-by-word with GSAP.

### Slide 23 — Agent Harness: Looking Ahead
**Content:** The agent harness is the missing piece — workflow instructions, guardrails, and the system that lets agents tackle complex tasks with minimal but intelligent human intervention. Not demoed today, but a critical concept for the future of this approach. Point to resources.
**Visual:** Minimal, forward-looking. Clean text with accent highlights.
**Animation:** Simple staggered reveals.

### Slide 24 — Resources + Open Source
**Content:** Links to source code, recording, resources, shoutouts.
**Visual:** Clean list of links/QR codes.
**Animation:** Fade in.

### Slide 25 — Q&A / Thank You
**Content:** "Thank you" + open floor for questions. Mention agents running in background — check on them at end if time allows.
**Visual:** Clean closing slide. Maybe the portal as a subtle background element again.
**Animation:** Gentle ambient motion while Q&A happens.

---

## Animation Budget

Rough classification of how much animation effort each slide gets:

| Level | Slides | Description |
|-------|--------|-------------|
| **Hero** | 12 (portal) | Three.js 3D portal, major production |
| **Rich** | 1, 5, 8, 14, 18, 22 | Multi-step GSAP timelines, diagram builds |
| **Standard** | 3-4, 6-7, 9, 11, 15-16, 19-20 | Simple GSAP fades, staggers, reveals |
| **Minimal** | 2, 10, 13, 17, 21, 23-25 | Basic transitions, static content |
