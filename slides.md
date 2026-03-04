---
theme: default
title: The Doctor Strange Approach to Parallel Agent Orchestration
author: Alden Geipel
colorSchema: dark
aspectRatio: 16/9
canvasWidth: 980
transition: fade
fonts:
  sans: Inter
  mono: JetBrains Mono
  provider: google
defaults:
  transition: fade
drawings:
  enabled: false
download: true
presenter: true
---

# The Doctor Strange Approach to Parallel Agent Orchestration

<p class="subtitle">Environment Engineering for AI Agent Development</p>

<div class="author-info">
  <p>Alden Geipel</p>
  <p class="event">RVATech Data & AI Summit 2026</p>
</div>

<!--
Welcome everyone. My name is Alden Geipel and today I'm going to talk about what I'm calling the Doctor Strange approach to parallel agent orchestration.
-->

---
layout: center
---

# About Me

<div class="about-content" v-click>

TODO: Add bio details here

</div>

<!--
Brief intro about yourself.
-->

---

# What We'll Cover

<v-clicks>

1. **The evolution** — from prompt engineering to something new
2. **The Doctor Strange demo** — parallel agents exploring infinite outcomes
3. **Key concepts + next steps** — what makes this possible

</v-clicks>

<!--
Three things I want to cover today. First, the evolution of how we work with AI — from prompt engineering through context engineering to what I believe comes next. Second, a live demo of the Doctor Strange approach. And third, the key concepts that make this possible.
-->

---

# Prompt Engineering

The first mainstream AI skill

<div class="comparison-grid">
  <div class="prompt-card" v-click>
    <p class="prompt-label">Basic</p>

```
Write a research paper about AI
```

  </div>

  <div class="prompt-card better" v-click>
    <p class="prompt-label">Engineered</p>

```
Write an extremely detailed scholar level
research paper about AI. Ensure proper MLA
citations and cite varying viewpoints.
```

  </div>
</div>

<p v-click class="takeaway">Better prompts yield better results — but this has limits.</p>

<!--
One of the first concepts that was coined when AI started making waves was prompt engineering. The difference between a lazy prompt and a well-crafted one could be dramatic. But it had limitations.
-->

---

# Context Engineering

The next evolution

<div v-click>

> What if the model doesn't *know* the answer — no matter how well you prompt it?

</div>

<div v-click>

**Example:** Asking about an Angular Material feature introduced *after* the knowledge cutoff.

No amount of prompt engineering can manufacture missing knowledge.

</div>

<div v-click>

**Context engineering** = cultivating the minimum applicable context needed to answer the query.

</div>

<!--
Context engineering builds on prompt engineering. Instead of just crafting better prompts, you provide or cultivate the relevant context. If the model's knowledge is outdated, you give it the docs. The art is in providing just enough context — not everything, just what's relevant.
-->

---

# Capability Engineering

Tools + context for how to use them

<v-clicks>

- Context engineering and capability engineering are deeply intertwined
- You craft the selection of **tools** and the context for how to effectively use them
- Claude Code, Codex CLI, Gemini CLI, GitHub Copilot — all combine prompt, context, and capability engineering behind the scenes
- They explore codebases, make edits, provide review workflows

</v-clicks>

<!--
Capability engineering is where you craft the selection of tools and the context for using them. The coding agents we have today — Claude Code, Codex CLI, Copilot — they all combine sophisticated prompt, context, and capability engineering behind the scenes.
-->

---

# But There Are Limits

<v-clicks>

- Agents don't know how to **run or test** the code unless you tell them
- Running on **your machine** = heavy human-in-the-loop
- Constant approval/denial of actions
- **Approval fatigue** — accidentally approving dangerous commands
- Risk to your git history, packages, system

</v-clicks>

<!--
These systems are incredible but they have limitations out of the box. They don't know how to run or test unless you specify it. They run on your machine with heavy human oversight. You get approval fatigue — constantly approving or denying requests, sometimes approving things by accident.
-->

---
layout: center
---

# Environment Engineering

<div class="evolution-timeline">
  <div class="evo-item" v-click>
    <span class="evo-label">Prompt Eng.</span>
    <span class="evo-desc">Craft better prompts</span>
  </div>
  <div class="evo-arrow" v-click>→</div>
  <div class="evo-item" v-click>
    <span class="evo-label">Context Eng.</span>
    <span class="evo-desc">Cultivate relevant context</span>
  </div>
  <div class="evo-arrow" v-click>→</div>
  <div class="evo-item highlight" v-click>
    <span class="evo-label">Environment Eng.</span>
    <span class="evo-desc">Design the world agents live in</span>
  </div>
</div>

<!--
This brings me to what I believe is the next evolution: environment engineering. It's the process of creating the environment agents exist in, the infrastructure to observe and consume their work, and the agent harness that lets them tackle complex tasks with minimal but intelligent human intervention.
-->

---

# Three Pillars

<v-clicks>

- **Isolated Environments** — sandboxed containers where agents work safely
- **Observability Infrastructure** — dashboards to watch agents work in real time
- **Agent Harness** — workflow instructions and guardrails for autonomous work

</v-clicks>

<!--
Environment engineering has three pillars. Isolated environments — Docker containers where agents can't damage your system. Observability infrastructure — dashboards where you can watch what they're doing. And agent harnesses — the workflow instructions and guardrails.
-->

---
layout: center
---

# The Demo

Instead of explaining further — let me show you.

<!--
Instead of doing a deep dive explanation, it would be easier to just show you with the Doctor Strange approach demo.
-->

---

# Meet the App

<div class="app-screenshot">

TODO: Screenshot of the plain fullstack app

</div>

A simple fullstack application — users and products. Functional, but not pretty.

<!--
Here's a very simple fullstack application. Basic functionality — adding users and products — but it doesn't look very appealing.
-->

---

# The Decision Point

Three possible paths for the UI:

<v-clicks>

- **Tabs** — switch between Users and Products
- **Accordions** — expand/collapse each section
- **Side Navigation** — dedicated pages with a nav panel

</v-clicks>

<p v-click class="takeaway">Which one is best? What if we could see all of them?</p>

<!--
I want to improve the layout. Maybe tabs, maybe accordions, maybe a side navigation panel. But I'm not sure which is best. What if I could see all of them?
-->

---
layout: none
transition: none
---

<DoctorStrangePortal :ring-size="360" />

<!--
I can open up portals and peer into the realities where each one of these exists.
-->

---
layout: center
transition: none
---

<div class="demo-slide">
  <h1>Live Demo: Parallel Agents</h1>
  <div class="demo-frame">
    <p>Three agents. Three sandboxed environments. Three implementations. One choice.</p>
    <p class="demo-todo">TODO: Demo section — switch to TSK dashboard</p>
  </div>
</div>

<style>
.demo-slide {
  text-align: center;
}
.demo-slide h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #e8e8ed;
  margin: 0 0 1.5rem 0;
}
.demo-slide .demo-frame {
  background: #12121a;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 1.25rem 2rem;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.demo-slide .demo-frame p {
  margin: 0;
  color: #e8e8ed;
  line-height: 1.7;
}
.demo-slide .demo-todo {
  margin-top: 1rem;
  color: #6b7280;
}
</style>

<!--
Three developer agents, each in their own fully isolated Docker container with the full application stack. They implement tabs, accordions, and side navigation simultaneously. When they're done, I review all three and pick which reality to merge.
-->

---

# How It Works

<v-clicks>

- Each agent runs in its own **Docker container** with the full stack
- Containers have **restricted network access** — isolated from everything
- **Claude Code Viewer** dashboard lets you watch logs, frontends, and browser actions
- No risk to your real codebase — sandboxed from start to finish

</v-clicks>

<!--
Each agent works in its own Docker container with the full application stack running. The containers have restricted network access. The Claude Code Viewer dashboard shows you logs, live frontends, and even browser automation. Since everything is sandboxed, there's no risk to your real codebase.
-->

---
layout: center
---

# "What If?"

<!--
Now to get you thinking — here are some what-ifs.
-->

---

# What If: Architect Agents

<div v-click>

What if an agent **designed the tasks** for other agents?

</div>

<div v-click>

Instead of you specifying "try tabs, try accordions" — an architect agent generates the design options and creates the task prompts itself.

</div>

<!--
In that demo, I created the task instructions. But what if we designed an agent to architect them? An agent that comes up with different design options and prompts for the worker agents?
-->

---

# What If: Race & Compare

<v-clicks>

- **Multiple agents, same task** — take the one that finishes first, scrap the rest
- **Multiple LLMs, same task** — compare which model is best suited for the job
- **Multiple approaches, same goal** — the best implementation wins

</v-clicks>

<!--
What if instead of one agent per task, we had two or three and took the first to finish? What if we had different LLM models tackling the same task to compare which was best?
-->

---
layout: statement
---

# Developer as Architect

What if developers designed and provided feedback on how features should be built — rather than manually placing every brick by hand?

<!--
The biggest what-if: what if we developed a robust agent harness where each developer is the architect that designs and reviews, rather than the bricklayer that writes every line of code?
-->

---

# Demo 2: UI Design Agent

<div v-click>

An agent that specializes in **UI design** will generate 5 different design themes — then spawn 5 parallel agents to implement them.

</div>

<div v-click>

TODO: Kick off demo, switch to dashboard

</div>

<!--
I've designed an agent that's particularly good at coming up with UI design themes and prompts. I'm going to ask it to spawn 5 parallel agents that will each implement a different design.
-->

---

# Resources

<v-clicks>

- Source code — **open source** (link TODO)
- This presentation + recording — publicly available
- Shoutout to the original TSK repo creator
- Shoutout to Cole Medin for his YouTube resources

</v-clicks>

<p v-click class="takeaway">None of this information should be gatekept.</p>

<!--
All source code, the presentation, the recording — everything will be publicly available. Huge shoutout to the original TSK repo creator and Cole Medin.
-->

---
layout: center
---

# Q&A

Thank you for your time.

<p class="subtitle">Agents are running in the background — let's check on them at the end.</p>

<!--
Now I'll open the floor for Q&A while the UI design agents are running. If we have time at the end, I'll show their work.
-->
