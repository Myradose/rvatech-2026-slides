---
theme: default
title: The Doctor Strange Approach to Parallel Agent Orchestration
author: Alden Geipel
colorSchema: dark
aspectRatio: 16/9
canvasWidth: 980
transition: slide-fade
fonts:
  sans: Inter
  mono: JetBrains Mono
  provider: google
defaults:
  transition: slide-fade
drawings:
  enabled: false
download: false
presenter: true
---

<AnimatedText text="The Doctor Strange Approach to Parallel Agent Orchestration" tag="h1" :stagger="0.08" :duration="0.6" />

<p class="subtitle" v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 1200, duration: 500 } }">Environment Engineering for AI Agent Development</p>

<div class="author-info" v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 1600, duration: 500 } }">
  <p>Alden Geipel</p>
  <p class="event">RVATech Data & AI Summit 2026</p>
</div>

<!--
- Goal: transform how you think about AI agents
- Relevant to dev work, but applies to any agent doing tangible work
-->

---
layout: center
---

# About Me

<div class="about-content" v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 500 } }">

- **Full Stack Developer** at Allianz Partners (Angular, React Native, .NET)
- Member of our **AI Committee** - shaping AI adoption strategy
- Built an AI-powered compliance analysis tool with Claude and AWS Bedrock
- B.S. in Computer Science, James Madison University

</div>

<!--
- Full stack at Allianz: Angular, React Native, .NET
- AI Committee: shaping AI adoption
- Built compliance analysis tool (Claude + Bedrock)
- Heavy Claude Code user -> led to these patterns
-->

---
layout: center
---

# What We'll Cover

<div v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 500 } }">

1. **The evolution** - from prompt engineering to environment engineering

</div>

<div v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 500, duration: 500 } }">

2. **The Doctor Strange demos** - parallel agents exploring infinite outcomes

</div>

<div v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 800, duration: 500 } }">

3. **Key concepts + next steps** - what makes this possible

</div>

<!--
1. Evolution: prompt eng -> context eng -> environment eng
2. Live demos
3. Key concepts + next steps
-->

---

# Prompt Engineering

The first mainstream AI skill

<div class="comparison-grid">
  <div class="prompt-card" v-click v-motion :initial="{ opacity: 0, x: -40 }" :enter="{ opacity: 1, x: 0, transition: { duration: 500 } }">
    <p class="prompt-label">Basic</p>

```
Write a research paper about AI
```

  </div>

  <GlowReveal><div class="prompt-card better" v-click v-motion :initial="{ opacity: 0, x: 40 }" :enter="{ opacity: 1, x: 0, transition: { duration: 500 } }">
    <p class="prompt-label">Engineered</p>

```
Write an extremely detailed scholar level
research paper about AI. Structure it with
clear sections, cite varying viewpoints,
and maintain an academic tone throughout.
```

  </div></GlowReveal>
</div>

<p v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }" class="takeaway">Better prompts yield better results, but this has limits.</p>

<!--
- First mainstream AI skill
- Dramatic difference between lazy and crafted prompts
- But it has limits
-->

---

# Context Engineering

The next evolution

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

> What if you ask that same model to cover AI breakthroughs from the last six months?

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

No amount of prompt engineering can manufacture knowledge past its training cutoff.

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

**Context engineering** = curating the right knowledge, tools, and instructions to get the job done.

</div>

<div v-if="$clicks >= 2" class="context-flow">
  <div class="context-flow-step" v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0, transition: { delay: 0, duration: 400 } }">
    <carbon:text-long-paragraph />
    <span>Engineered Prompt</span>
  </div>
  <div class="env-arrows" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 300, duration: 300 } }"><span class="env-arrow-down">→</span></div>
  <GlowReveal><div class="context-flow-step highlight" v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0, transition: { delay: 500, duration: 400 } }">
    <carbon:search />
    <span>Fetch Recent Papers</span>
  </div></GlowReveal>
  <div class="env-arrows" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 800, duration: 300 } }"><span class="env-arrow-down">→</span></div>
  <div class="context-flow-step" v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0, transition: { delay: 1000, duration: 400 } }">
    <carbon:document />
    <span>Informed Output</span>
  </div>
</div>

<!--
- CLICK 1: What about AI breakthroughs from last 6 months?
- CLICK 2: Can't prompt your way past training cutoff -> why ChatGPT added web search
- CLICK 3: Context eng = right knowledge + right tools, not just instructions
-->

---
clicks: 3
---

# Context Engineering in Practice

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { type: 'tween', delay: 400, duration: 400 } }">

- This is exactly what today's coding agents do behind the scenes

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- They combine prompts, relevant context, and tools into a seamless experience

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- They explore codebases, make edits, run commands, provide review workflows

</div>

<div :class="{ 'tool-logos-hero': $clicks < 1 }" class="tool-logos">
  <div class="tool-logo"><simple-icons:claude /><span>Claude Code</span></div>
  <div class="tool-logo"><simple-icons:openai /><span>Codex CLI</span></div>
  <div class="tool-logo"><simple-icons:googlegemini /><span>Gemini CLI</span></div>
  <div class="tool-logo"><simple-icons:githubcopilot /><span>GitHub Copilot</span></div>
</div>

<!--
- Today's coding agents = context engineering systems
- File search, code editing, terminal = forms of context engineering
- Read codebase -> build understanding -> make changes
-->

---

# But There Are Limits

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- They're running on **your machine** with no isolated environment of their own

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- That means you're **babysitting every step** they take

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- Constant approval/denial of actions, **approval fatigue**

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- Risk to your git history, packages, system

</div>

<!--
- No isolation = babysitting every step
- Approval fatigue, accidental approvals
- Risk to git history, packages, system
-->

---
layout: center
transition: section
---

# Environment Engineering

<EvolutionTimeline />

<!--
- Next evolution: environment engineering
- Isolated environments + observability + work retrieval
- Minimal but intelligent human intervention
-->

---

# Three Pillars

<div class="pillar-cards">
  <div class="pillar-card" v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 500 } }">
    <div class="pillar-icon"><carbon:container-software /></div>
    <h3>Isolated Environments</h3>
    <p>Sandboxed containers where agents work safely</p>
  </div>
  <div class="pillar-card" v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 500, duration: 500 } }">
    <div class="pillar-icon"><carbon:dashboard /></div>
    <h3>Observability Infrastructure</h3>
    <p>Dashboards to watch agents work in real time</p>
  </div>
  <div class="pillar-card" v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 800, duration: 500 } }">
    <div class="pillar-icon"><carbon:download /></div>
    <h3>Work<br>Retrieval</h3>
    <p>Infrastructure to extract results from each environment</p>
  </div>
</div>

<!--
- Isolated environments: Docker/VMs, safe from your system
- Observability: dashboards, real-time monitoring
- Work retrieval: extract results for review and use
-->

---
layout: center
transition: section
---

<AnimatedText text="The Demo" tag="h1" :stagger="0.1" :duration="0.6" />

<p v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 800, duration: 500 } }">Instead of explaining further, let me show you.</p>

<!--
- Wait for animation to finish
- "Enough theory. Let me show you."
- Brief pause, then advance
-->

---
layout: none
clicks: 1
---

<DemoSlide title="Meet the App" subtitle="A simple fullstack application: users and products." :clicks="$clicks">
  <DemoViewer src="app" />
</DemoSlide>

<!--
- Simple fullstack app: users and products, basic CRUD
- UI is bare -> let's fix that
-->

---
layout: none
transition: none
---

<div class="decision-point-content">

# The Challenge

Angular Material needs to be set up. Which AI model handles it best?

<div v-click v-motion :initial="{ opacity: 0, x: -30 }" :enter="{ opacity: 1, x: 0, transition: { duration: 500 } }">

- **Claude** - Anthropic

</div>

<div v-click v-motion :initial="{ opacity: 0, x: -30 }" :enter="{ opacity: 1, x: 0, transition: { duration: 500 } }">

- **Gemini** - Google

</div>

<div v-click v-motion :initial="{ opacity: 0, x: -30 }" :enter="{ opacity: 1, x: 0, transition: { duration: 500 } }">

- **GPT** - OpenAI

</div>

<p v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }" class="takeaway">Three models. Same task. Let's see what happens.</p>

</div>

<DoctorStrangePortal :ring-size="360" />

<!--
- CLICK 1/2/3: Reveal Claude, Gemini, GPT. Pause between each.
- CLICK 4: "Instead of picking one... let's do what Doctor Strange would do."
- CLICK 5: "Let's open a portal to all three." Then SILENCE -- let animation land.
- Absorb portal 2-3 sec.
- CLICK 6: Zoom through. Say nothing during zoom.
-->

---
layout: none
transition: none
clicks: 1
---

<DemoSlide title="Live Demo: Multi-Model Race" subtitle="Three models. Three pockets. Same task. You vote on the winner." :clicks="$clicks">
  <DemoViewer src="pocketManager" />
</DemoSlide>

<!--
ORIENT:
- Grid = 3 pockets (Claude, Gemini, GPT), each sandboxed dev env
- All running Claude Code, each powered by its model (via Claude Code Router)
- Toggle between terminal, live frontend, workspace views

TYPE PROMPT:
- Type in Claude pocket, read aloud. Paste into other two.

NARRATE:
- Agents exploring codebase, planning changes
- Expand one to detail view; point out bypass permissions = fully isolated
- Narrate edits/commands as they happen

RESULTS:
- Grid view -> toggle to frontend view for side-by-side
- "Which one do you like best?" -> audience vote
- Stop losers, keep winner
-->

---
---

# How It Works

<div class="env-visual">
  <GlowReveal><div class="env-host-box" v-motion :initial="{ opacity: 0, y: -12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 400 } }"><carbon:laptop /><span>Your Machine</span></div></GlowReveal>
  <div class="env-arrows" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 500, duration: 300 } }">
    <span class="env-arrow-down">↓</span>
    <span class="env-arrow-label">tsk run</span>
    <span class="env-arrow-up">↑</span>
    <span class="env-arrow-label">git branches</span>
  </div>
  <div class="env-containers-row" v-motion :initial="{ opacity: 0, y: -12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 800, duration: 400 } }">
    <div class="env-box"><carbon:container-software /><span>Claude</span></div>
    <div class="env-box"><carbon:container-software /><span>Gemini</span></div>
    <div class="env-box"><carbon:container-software /><span>GPT</span></div>
  </div>
</div>

<!--
- Each model in its own Docker container, fully isolated
- Pocket Manager = real-time observability
- Pull git branches out to review results
- Keep brisk (15-20 sec) -- confirmation, not discovery
-->

---
layout: none
clicks: 1
---

<DemoSlide title="Live Demo: Design Exploration" subtitle="Three pockets. Three UI approaches. Tabs, accordions, or side navigation." :clicks="$clicks">
  <DemoViewer src="pocketManager" />
</DemoSlide>

<!--
- Fork winner twice -> Tabs, Accordions, Side Nav
- Same codebase, different prompts. NEW: agents can use browser.
- No need to re-explain grid; focus on what's different

PLAYWRIGHT MOMENT:
- Switch to workspace view when agent opens browser
- Split view: terminal left, VNC right
- "Real browser inside the container, visually validating its work"

WRAP UP:
- Grid view -> frontend view, three UIs side by side
- "That's design exploration." Move on.
-->

---
layout: none
clicks: 1
---

<DemoSlide title="Fire and Forget" subtitle="Three agents building a checkout page. They'll work while we talk." :clicks="$clicks">
  <DemoViewer src="pocketManager" />
</DemoSlide>

<!--
- CLICK: Kick off 3 agents building checkout page (all Claude)
- They work in background while we talk
- 15-20 sec max. "By Q&A, let's see if they've finished."
-->

---
layout: center
transition: section
---

<AnimatedText text='"What If?"' tag="h1" :stagger="0.15" :duration="0.6" />

<!--
- Wait for animation
- Recap: 3 models head-to-head, 3 design directions, fire-and-forget
- "We're just scratching the surface. What else becomes possible?"
-->

---
clicks: 4
---

# What If: Race & Compare

- **Multiple pockets, same task** - race them and take the first result

<div v-click="2" v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- Or let them **all finish** and compare the results side by side

</div>

<span v-click="3" class="hidden" />

<div v-click="4" v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- Works across **different agents**, **different LLMs**, or **different approaches**

</div>

<RaceDiagram :click="1" :compare-click="3" />

<!--
- Race: take first to finish, discard the rest
- Compare: let all finish, review side by side (Demo 1)
- Works across agents, LLMs, or approaches
- Multiple paths instead of betting on one
-->

---

# What If: Beyond Developers

<div class="beyond-dev-layout">
<div class="beyond-dev-bullets">

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- Powerful AI skills already exist: **presentations, data analysis, document generation**

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- But they require a **terminal**, manual approvals, and developer knowledge

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- A simple frontend + agent + pocket makes them **accessible to everyone**

</div>

<p v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }" class="takeaway">Build the workflow once. The entire organization benefits.</p>

</div>
<div class="beyond-dev-flow" v-motion :initial="{ opacity: 0, x: 40 }" :enter="{ opacity: 1, x: 0, transition: { delay: 400, duration: 600 } }">
  <div class="beyond-dev-step"><carbon:user /><span>Employee</span></div>
  <div class="env-arrows">
    <span class="env-arrow-down">↓</span>
  </div>
  <div class="beyond-dev-step"><carbon:application-web /><span>Simple Frontend</span></div>
  <div class="env-arrows">
    <span class="env-arrow-down">↓</span>
  </div>
  <GlowReveal><div class="beyond-dev-step highlight"><carbon:machine-learning-model /><span>Agent</span></div></GlowReveal>
  <div class="env-arrows">
    <span class="env-arrow-down">↓</span>
  </div>
  <div class="beyond-dev-step"><carbon:container-software /><span>Pocket</span></div>
</div>
</div>

<!--
- Powerful AI skills exist (presentations, data analysis, docs)
- But require CLI, terminal, manual approvals -- non-starter for most people
- Simple frontend + agent + pocket = accessible to everyone
- Employee fills a form, agent does the work in a sandbox
- "Build the workflow once. Everyone benefits."
-->

---

# Looking Ahead

<div class="comparison-grid">
  <div class="prompt-card" v-click v-motion :initial="{ opacity: 0, x: -40 }" :enter="{ opacity: 1, x: 0, transition: { duration: 500 } }">
    <p class="prompt-label">Rewind Timeline</p>
    <p class="prompt-card-body">A snapshot before every tool call, building a <strong>branching timeline</strong> of the entire session. Agent goes sideways forty steps in? Roll back to that exact point, or branch off and try something different.</p>
    <p class="prompt-card-note">The Time Stone for your development environment.</p>
  </div>

  <div class="prompt-card" v-click v-motion :initial="{ opacity: 0, x: 40 }" :enter="{ opacity: 1, x: 0, transition: { duration: 500 } }">
    <p class="prompt-label">Environment Self-Improvement</p>
    <p class="prompt-card-body">Agents that <strong>shape their own workspace</strong>, installing tools, updating environment configuration, even improving their own Claude Code setup with new skills and MCP servers. Request a rebuild, reboot with the changes baked in.</p>
    <p class="prompt-card-note">The environment converges on the ideal setup over time.</p>
  </div>
</div>

<p v-click v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }" class="exploration-note">Both on the roadmap, alongside cloud scaling for horizontal growth</p>

<!--
CLICK 1 - Rewind Timeline:
- /rewind only undoes file changes; this snapshots the ENTIRE environment
- Roll back to any tool call, branch timelines, agent can self-rewind

CLICK 2 - Environment Self-Improvement:
- Agents install packages, modify config, add skills/MCP servers
- Request rebuild, reboot with changes baked in
- Environment converges on ideal setup over time

CLICK 3: Both on roadmap + cloud scaling for horizontal growth
-->

---
clicks: 10
---

# Agent Teams

<AgentTeamsDiagram :click="1" :roles-reveal-click="2" :roles-click="3" :escalation-click="4" :escalation2-click="5" :escalation3-click="6" :delegation-click="7" :delegation2-click="8" :delegation3-click="9" :teams-click="10" />

<!--
Context: Claude Code agent teams -- what it does, where it falls short

CLICK 1 - Foundation: Lead agent + parallel teammates
- Catch: shared filesystem, no git isolation, overwrite risk
- Vision: provide that isolation with pockets

CLICK 2 - Roles Reveal: Labels crossfade, all workers emphasized
- Each gets own pocket; team lead sets the plan

CLICK 3 - Integrator Focus: Integrator gets full amber glow
- "What if the plan can't work? DB schema won't support it."

CLICK 4 - Escalation Step 1: Integrator amber -> red
- Something's wrong. The integrator hit a blocking issue it can't resolve.

CLICK 5 - Escalation Step 2: Red flows up to Team Lead
- Can the team lead resolve this within the human's vision?

CLICK 6 - Escalation Step 3: Red reaches Human
- Perfect moment for human-in-the-loop

CLICK 7 - Delegation Step 1: Human glows green
- Human has made a decision, ready to send it back down

CLICK 8 - Delegation Step 2: Green flows down to Team Lead
- Team lead receives the updated plan

CLICK 9 - Delegation Step 3: Green flows down to Workers
- Not approving commands -- making architectural decisions
- "That's the kind of HITL that scales."

CLICK 10 - Team of teams: Orchestrator -> multiple Team Leads
- Each team lead owns a feature, orchestrator divides work
- AGI prediction: orchestrated teams, not one super-model
- "We're using these models at a fraction of their potential."
-->

---
layout: statement
---

<AnimatedText text="Developer as Architect" tag="h1" :stagger="0.1" :duration="0.6" />

<p v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 1000, duration: 600 } }">What if developers designed <em>how</em> features get built instead of building every one by hand?</p>

<!--
- Developers as architects, not bricklayers
- Design HOW features get built, not write every line
-->

---

# Resources

<p class="section-lead" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 100, duration: 400 } }">QR code at the end</p>

<div v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 500 } }">

- Source code -- **open source**, experimental
- Presentation slides -- available now
- Recording -- available after the summit

</div>

<div v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 600, duration: 500 } }">

- **[dtormoen/tsk](https://github.com/dtormoen/tsk-tsk)** -- foundation for pocket orchestration
- **[Claude Code Router](https://github.com/musistudio/claude-code-router)** -- multi-model routing used in the demo
- **[Cole Medin](https://www.youtube.com/@ColeMedin)** -- Claude Code & agentic engineering

</div>

<p class="takeaway" v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 1000, duration: 500 } }">None of this information should be gatekept.</p>

<!--
- Everything is open source, experimental/POC, not production-ready
- Slides available now, recording after summit
- dtormoen/tsk is the original repo I forked
- Claude Code Router enabled the multi-model race demo
- Cole Medin's channel was a key inspiration
-->

---
layout: center
---

<div style="text-align: center">

# Acknowledgments

<div v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 500 } }">

<p class="acknowledgment-label">Special thanks to</p>
<p class="acknowledgment-names">Mike Cleary · Dana McMurray · Radha Manohar</p>

</div>

</div>

<!--
- Thank Mike, Dana, Radha at Allianz -- trust, support, autonomy
- Dana recommended I speak here
-->

---
clicks: 1
---

<div class="thankyou-slide">
  <div :class="['thankyou-text', { 'thankyou-text-up': $clicks >= 1 }]">
    <h1>Thank You</h1>
    <p class="subtitle" v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 400, duration: 500 } }">Three agents are building a checkout page in the background. Let's check in before we wrap.</p>
  </div>
  <div :class="['qr-reveal', { 'qr-reveal-shown': $clicks >= 1 }]">
    <img src="/qr-code.png" alt="QR code" />
    <span class="qr-label">Scan for all links</span>
  </div>
</div>

<!--
- Thank the audience
- Check on checkout page agents before wrapping
- Click to reveal QR code when ready
-->
