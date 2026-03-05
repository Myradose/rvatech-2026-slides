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
download: true
presenter: true
---

<AnimatedText text="The Doctor Strange Approach to Parallel Agent Orchestration" tag="h1" :stagger="0.08" :duration="0.6" />

<p class="subtitle" v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 1200, duration: 500 } }">Environment Engineering for AI Agent Development</p>

<div class="author-info" v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 1600, duration: 500 } }">
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

<div class="about-content" v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 500 } }">

- **Full Stack Developer** at Allianz Partners (Angular, React Native, .NET)
- Member of our **AI Committee** - shaping AI adoption strategy
- Built an AI-powered compliance analysis tool with Claude and AWS Bedrock
- B.S. in Computer Science, James Madison University

</div>

<!--
Quick background on me. I'm a full stack developer at Allianz Partners working across Angular, React Native, and .NET. I'm on our AI Committee where I help shape how we adopt AI across the organization. I've built agentic applications for real business problems, including a compliance analysis tool powered by Claude and AWS Bedrock. And I use Claude Code extensively in my daily workflow, which is what led me to the patterns I'm going to show you today.
-->

---
layout: center
---

# What We'll Cover

<div v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 500 } }">

1. **The evolution** - from prompt engineering to environment engineering

</div>

<div v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 500, duration: 500 } }">

2. **The Doctor Strange demo** - parallel agents exploring infinite outcomes

</div>

<div v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 800, duration: 500 } }">

3. **Key concepts + next steps** - what makes this possible

</div>

<!--
Three things I want to cover today. First, the evolution of how we work with AI - from prompt engineering through context engineering to what I believe comes next. Second, a live demo of the Doctor Strange approach. And third, the key concepts that make this possible.
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

  <div class="prompt-card better" v-click v-motion :initial="{ opacity: 0, x: 40 }" :enter="{ opacity: 1, x: 0, transition: { duration: 500 } }">
    <p class="prompt-label">Engineered</p>

```
Write an extremely detailed scholar level
research paper about AI. Structure it with
clear sections, cite varying viewpoints,
and maintain an academic tone throughout.
```

  </div>
</div>

<p v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }" class="takeaway">Better prompts yield better results, but this has limits.</p>

<!--
One of the first concepts that was coined when AI started making waves was prompt engineering. The difference between a lazy prompt and a well-crafted one could be dramatic. But it had limitations.
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

<span v-click class="hidden" />
<div v-if="$clicks >= 4" class="context-flow">
  <div class="context-flow-step" v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0, transition: { delay: 0, duration: 400 } }">
    <carbon:text-long-paragraph />
    <span>Engineered Prompt</span>
  </div>
  <div class="env-arrows" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 300, duration: 300 } }"><span class="env-arrow-down">→</span></div>
  <div class="context-flow-step highlight" v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0, transition: { delay: 500, duration: 400 } }">
    <carbon:search />
    <span>Fetch Recent Papers</span>
  </div>
  <div class="env-arrows" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 800, duration: 300 } }"><span class="env-arrow-down">→</span></div>
  <div class="context-flow-step" v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0, transition: { delay: 1000, duration: 400 } }">
    <carbon:document />
    <span>Informed Output</span>
  </div>
</div>

<!--
Same research paper example. You engineered a great prompt, but what if you need it to cover recent AI breakthroughs from the last six months? No prompt can fix that. This is actually why ChatGPT added web search. Instead of relying on what the model already knows, it can go out and find current information. That's context engineering in a nutshell: giving the model the right knowledge or the means to get it, not just telling it how to behave.
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
This is exactly what today's coding agents are doing. Claude Code, Codex CLI, Copilot - they're sophisticated context engineering systems. The tools they use - file search, code editing, terminal access - those are all forms of context engineering. Each tool gives the model more context about your project. They read your codebase to build understanding, then use that context to make changes. Context engineering in action.
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
These agents are incredible but they have a fundamental limitation: they're running on your machine with no isolated environment of their own. That means you're babysitting every step. You get approval fatigue from constantly approving or denying actions, sometimes approving things by accident. And there's real risk to your git history, packages, and system.
-->

---
layout: center
transition: section
---

# Environment Engineering

<EvolutionTimeline />

<!--
This brings me to what I believe is the next evolution: environment engineering. It's the process of creating isolated environments for agents to work in, the infrastructure to observe them in real time, and the means to retrieve and use their work. It's what lets agents tackle complex tasks with minimal but intelligent human intervention.
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
    <h3>Work Retrieval</h3>
    <p>Infrastructure to extract results from each environment</p>
  </div>
</div>

<!--
Environment engineering has three pillars. Isolated environments - Docker containers where agents can't damage your system. Observability infrastructure - dashboards where you can watch what they're doing. And work retrieval - the infrastructure that lets you pull git branches and artifacts out of each container so you can use the work.
-->

---
layout: center
transition: section
---

<AnimatedText text="The Demo" tag="h1" :stagger="0.1" :duration="0.6" />

<p v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 800, duration: 500 } }">Instead of explaining further, let me show you.</p>

<!--
Instead of doing a deep dive explanation, it would be easier to just show you with the Doctor Strange approach demo.
-->

---

# Meet the App

<div class="app-screenshot">

TODO: Screenshot of the plain fullstack app

</div>

A simple fullstack application - users and products. Functional, but not pretty.

<!--
Here's a very simple fullstack application. Basic functionality - adding users and products - but it doesn't look very appealing.
-->

---
layout: none
transition: none
---

<div class="decision-point-content">

# The Decision Point

You've got a design decision to make:

<div v-click v-motion :initial="{ opacity: 0, x: -30 }" :enter="{ opacity: 1, x: 0, transition: { duration: 500 } }">

- **Tabs** - switch between Users and Products

</div>

<div v-click v-motion :initial="{ opacity: 0, x: -30 }" :enter="{ opacity: 1, x: 0, transition: { duration: 500 } }">

- **Accordions** - expand/collapse each section

</div>

<div v-click v-motion :initial="{ opacity: 0, x: -30 }" :enter="{ opacity: 1, x: 0, transition: { duration: 500 } }">

- **Side Navigation** - dedicated pages with a nav panel

</div>

<p v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }" class="takeaway">Which one is best? What if we could see all of them?</p>

</div>

<DoctorStrangePortal :ring-size="360" />

<!--
I want to improve the layout. Maybe tabs, maybe accordions, maybe a side navigation panel. But I'm not sure which is best. What if I could see all of them? I can open up portals and peer into the realities where each one of these exists.
-->

---
layout: center
transition: none
---

<div class="demo-slide">
  <h1>Live Demo: Parallel Agents</h1>
  <div class="demo-frame">
    <p>Three agents. Three sandboxed environments. Three implementations. One choice.</p>
    <p class="demo-todo">TODO: Demo section - switch to TSK dashboard</p>
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
clicks: 3
---

<div :class="{ 'iso-centered': $clicks < 1 }" class="iso-title-wrap">

# Isolated Environments

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { type: 'tween', delay: 400, duration: 400 } }">

- Each agent runs in its own **Docker container** with the full application stack

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { type: 'tween', duration: 400 } }">

- Containers have **restricted network access** - isolated from your system and each other

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { type: 'tween', duration: 400 } }">

- Agents can run builds, serve the app, execute tests - all without touching your machine

</div>

<div class="env-visual">
  <div class="env-host-box" v-motion :initial="{ opacity: 0, y: -12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 400 } }"><carbon:laptop /><span>Your Machine</span></div>
  <div class="env-arrows" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 500, duration: 300 } }">
    <span class="env-arrow-down">↓</span>
    <span class="env-arrow-label">tsk start</span>
    <span class="env-arrow-up">↑</span>
    <span class="env-arrow-label">git branches</span>
  </div>
  <div class="env-containers-row" v-motion :initial="{ opacity: 0, y: -12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 800, duration: 400 } }">
    <div class="env-box"><carbon:container-software /><span>Tabs</span></div>
    <div class="env-box"><carbon:container-software /><span>Accordions</span></div>
    <div class="env-box"><carbon:container-software /><span>Side Nav</span></div>
  </div>
</div>

<style>
.iso-title-wrap {
  width: fit-content;
  position: relative;
  left: 0;
  transform: translateX(0) translateY(0);
  will-change: left, transform;
  transition: left 0.6s ease-in-out,
              transform 0.6s ease-in-out;
}
.iso-title-wrap.iso-centered {
  left: 50%;
  transform: translateX(-50%) translateY(103px);
}
</style>

<!--
The first pillar: isolated environments. Each agent works in its own Docker container with the full application stack — frontend, backend, database, everything. The containers have restricted network access so they're isolated from your system and from each other. Agents can run builds, serve the app, execute tests — all without touching your machine. When they're done, you pull git branches out. This is what makes it safe to let agents work autonomously.
-->

---

# Observability

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- **Claude Code Viewer** dashboard lets you watch agents work in real time

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- See agent logs, live frontends, and browser automation from your host machine

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- Without observability, parallel agents are a black box - this makes the workflow practical

</div>

<!--
The second pillar: observability. The Claude Code Viewer dashboard lets you watch what every agent is doing in real time. You can see their logs, view the live frontend they're building, and even watch browser automation happening. Without this, you'd be launching agents into the void and hoping for the best. Observability is what makes this workflow practical rather than a gamble.
-->

---

# Safety & Work Retrieval

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- No risk to your real codebase - sandboxed from start to finish

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- When agents finish, pull **git branches** and artifacts out of each container

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- Review all implementations, then merge the "reality" you want to keep

</div>

<!--
The third pillar: safety and work retrieval. Since everything is sandboxed, there's no risk to your real codebase. Agents can't mess up your git history or install unwanted packages. When they finish, you pull git branches and artifacts out of each container. You review all the implementations side by side, then merge the reality you want to keep. The rest just gets discarded.
-->

---
layout: center
transition: section
---

<AnimatedText text='"What If?"' tag="h1" :stagger="0.15" :duration="0.6" />

<!--
So you've seen what this looks like in practice. Now I want to take it further. What else becomes possible when agents have their own isolated environments?
-->

---

# What If: Architect Agents

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

> What if an agent **designed the tasks** for other agents?

</div>

<span v-click class="hidden" />
<div v-if="$clicks >= 2" class="architect-diagram">
  <div class="architect-input" v-motion :initial="{ opacity: 0, y: -12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 0, duration: 400 } }"><carbon:user /><span>Your goal</span></div>
  <div class="env-arrows" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 300, duration: 300 } }">
    <span class="env-arrow-down">↓</span>
  </div>
  <div class="architect-box" v-motion :initial="{ opacity: 0, y: -12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 500, duration: 400 } }"><carbon:machine-learning-model /><span>Architect Agent</span></div>
  <div class="env-arrows" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 800, duration: 300 } }">
    <span class="env-arrow-down">↓</span>
    <span class="env-arrow-label">designs &amp; spawns</span>
  </div>
  <div class="architect-workers-row" v-motion :initial="{ opacity: 0, y: -12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 1000, duration: 400 } }">
    <div class="architect-worker"><carbon:container-software /><span>Task A</span></div>
    <div class="architect-worker"><carbon:container-software /><span>Task B</span></div>
    <div class="architect-worker"><carbon:container-software /><span>Task C</span></div>
    <div class="architect-worker architect-worker-extra"><span>...</span></div>
  </div>
</div>

<!--
In that demo, I created the task instructions. But what if we designed an agent to architect them? An agent that comes up with different design options and prompts for the worker agents?
-->

---
clicks: 3
---

# What If: Race & Compare

- **Multiple agents, same task** — race them and take the first result

<div v-click="2" v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- **First to finish wins**, or compare all results and pick the best

</div>

<div v-click="3" v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- Works across **different agents**, **different LLMs**, or **different approaches**

</div>

<RaceDiagram :click="1" />

<!--
What if instead of one agent per task, we had two or three and took the first to finish? What if we had different LLM models tackling the same task to compare which was best?
-->

---

# Demo 2: UI Design Agent

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

An agent that specializes in **UI design** will generate 5 different design themes, then spawn 5 parallel agents to implement them.

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

TODO: Kick off demo, switch to dashboard

</div>

<!--
I've designed an agent that's particularly good at coming up with UI design themes and prompts. I'm going to ask it to spawn 5 parallel agents that will each implement a different design.
-->

---
layout: statement
---

<AnimatedText text="Developer as Architect" tag="h1" :stagger="0.1" :duration="0.6" />

<p v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 1000, duration: 600 } }">What if developers designed <em>how</em> features get built instead of building every one by hand?</p>

<!--
The biggest what-if: what if the developer's role shifts from writing every line of code to designing how features get built and reviewing the results? You become the architect, not the bricklayer.
-->

---

# Looking Ahead

<div class="comparison-grid">
  <div class="prompt-card" v-click v-motion :initial="{ opacity: 0, x: -40 }" :enter="{ opacity: 1, x: 0, transition: { duration: 500 } }">
    <p class="prompt-label">Agent Harnesses</p>
    <p style="font-size: 0.9rem; line-height: 1.6; color: var(--color-text);">The missing piece: workflow instructions, guardrails, and feedback loops that let agents tackle <strong>complex, long-running tasks</strong> with minimal but intelligent human intervention.</p>
    <p style="font-size: 0.85rem; margin-top: 0.75rem; color: var(--color-text-muted);">Think of it as the playbook you give agents so they know not just <em>what</em> to build, but <em>how</em> to build it well.</p>
  </div>

  <div class="prompt-card" v-click v-motion :initial="{ opacity: 0, x: 40 }" :enter="{ opacity: 1, x: 0, transition: { duration: 500 } }">
    <p class="prompt-label">Cloud Scaling</p>
    <p style="font-size: 0.9rem; line-height: 1.6; color: var(--color-text);">This demo runs on one machine, but these are just Docker containers. There's nothing stopping you from orchestrating them across a <strong>Kubernetes cluster</strong>.</p>
    <p style="font-size: 0.85rem; margin-top: 0.75rem; color: var(--color-text-muted);">Imagine spinning up dozens of agents in parallel, scaling horizontally as the work demands.</p>
  </div>
</div>

<p v-click v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }" style="text-align: center; margin-top: 1.5rem; color: var(--color-text-muted); font-size: 0.9rem;">Both are active areas of exploration - resources on the next slide</p>

<!--
Two things I didn't demo but are critical for the future. First, agent harnesses: the system of workflow instructions and guardrails that tell agents not just what to build, but how to build it well. Think of it as the playbook. Not demoed today, but there are existing resources online that explore this in depth. Second, cloud scaling. This demo runs on one machine, but these are just Docker containers. There's nothing stopping you from orchestrating them across a Kubernetes cluster, spinning up dozens of agents in parallel.
-->

---

# Resources

<div class="resources-layout">
<div class="resources-list">

<div v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 500 } }">

- Source code - **open source** (link TODO)

</div>

<div v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 500, duration: 500 } }">

- This presentation + recording - publicly available

</div>

<div v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 800, duration: 500 } }">

- Shoutout to the original TSK repo creator
- Shoutout to the Claude Code Viewer project
- Shoutout to Cole Medin for his YouTube resources

</div>

<p class="subtitle" v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 1100, duration: 500 } }">This is experimental - not production-ready.</p>

<p class="takeaway" v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 1400, duration: 500 } }">None of this information should be gatekept.</p>

</div>
<div class="resources-qr" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 400, duration: 600 } }">
  <img src="/qr-code.png" class="qr-image" alt="QR code" />
  <span class="qr-label">Scan for all links</span>
  <span class="qr-label" style="color: var(--color-accent); font-style: italic;">TODO: replace with real URL</span>
</div>
</div>

<!--
All source code, the presentation, the recording - everything will be publicly available. Huge shoutout to the original TSK repo creator and Cole Medin.

Important context if asked: this is all very experimental. It was built quickly with heavy use of Claude Code, and the git history reflects that. The network restrictions use a squid proxy, which is a basic measure - in a real setup you'd want proper Docker network policies or a real firewall, since the proxy can be bypassed. TSK is a fork where I made significant changes to support long-running containers, serve infrastructure, Traefik routing, configurable observability, and more. The Claude Code Viewer is also a fork - I primarily use it for the log viewing UI and the existing stack it was built on, not the other features from the original project. None of this should be considered production-ready.
-->

---
layout: center
---

# Q&A

Thank you for your time.

<p class="subtitle">Agents are running in the background. Let's check on them at the end.</p>

<div style="position: absolute; bottom: 2.5rem; right: 3rem; display: flex; flex-direction: column; align-items: center; gap: 0.35rem;">
  <img src="/qr-code.png" style="width: 120px; height: 120px; border-radius: 6px;" alt="QR code" />
  <span class="qr-label">Resources</span>
  <span class="qr-label" style="color: var(--color-accent); font-style: italic;">TODO: replace</span>
</div>

<!--
Now I'll open the floor for Q&A while the UI design agents are running. If we have time at the end, I'll show their work.
-->
