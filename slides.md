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

1. **The evolution** - from prompt engineering to something new

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
research paper about AI. Ensure proper MLA
citations and cite varying viewpoints.
```

  </div>
</div>

<p v-click class="takeaway">Better prompts yield better results, but this has limits.</p>

<!--
One of the first concepts that was coined when AI started making waves was prompt engineering. The difference between a lazy prompt and a well-crafted one could be dramatic. But it had limitations.
-->

---

# Context Engineering

The next evolution

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

> What if the model doesn't *know* the answer, no matter how well you prompt it?

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

**Example:** Asking about a library feature released *after* the model's training cutoff.

No amount of prompt engineering can manufacture missing knowledge.

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

**Context engineering** = giving the model the right knowledge, tools, and instructions to get the job done.

</div>

<!--
Context engineering builds on prompt engineering. Instead of just crafting better prompts, you provide the right context - knowledge the model is missing, tools it can use, and instructions for how to use them. If the model's knowledge is outdated, you give it the docs. If it needs to interact with the world, you give it tools. The art is in curating exactly the right context for the task.
-->

---

# Context Engineering in Practice

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- This is exactly what today's coding agents do behind the scenes

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- Claude Code, Codex CLI, Gemini CLI, GitHub Copilot - they combine prompts, relevant context, and tools into a seamless experience

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- They explore codebases, make edits, run commands, provide review workflows

</div>

<!--
This is exactly what today's coding agents are doing. Claude Code, Codex CLI, Copilot - they're sophisticated context engineering systems. The tools they use - file search, code editing, terminal access - those are all forms of context engineering. Each tool gives the model more context about your project. They read your codebase to build understanding, then use that context to make changes. Context engineering in action.
-->

---

# But There Are Limits

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- Agents don't know how to **run or test** the code unless you tell them

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- Running on **your machine** means you're babysitting every step

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- Constant approval/denial of actions, **approval fatigue**

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- Risk to your git history, packages, system

</div>

<!--
These agents are incredible but they have limitations out of the box. They don't know how to run or test unless you configure it. They run on your machine, so you're babysitting every step. You get approval fatigue from constantly approving or denying actions, sometimes approving things by accident. And there's real risk to your git history and system.
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

<p v-click class="takeaway">Which one is best? What if we could see all of them?</p>

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

# How It Works

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- Each agent runs in its own **Docker container** with the full stack

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- Containers have **restricted network access** - isolated from everything

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- **Claude Code Viewer** dashboard lets you watch logs, frontends, and browser actions

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- No risk to your real codebase - sandboxed from start to finish

</div>

<!--
Each agent works in its own Docker container with the full application stack running. The containers have restricted network access. The Claude Code Viewer dashboard shows you logs, live frontends, and even browser automation. Since everything is sandboxed, there's no risk to your real codebase.
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

What if an agent **designed the tasks** for other agents?

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

Instead of you specifying "try tabs, try accordions" - an architect agent generates the design options and creates the task prompts itself.

</div>

<!--
In that demo, I created the task instructions. But what if we designed an agent to architect them? An agent that comes up with different design options and prompts for the worker agents?
-->

---

# What If: Race & Compare

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- **Multiple agents, same task** - take the one that finishes first, scrap the rest

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- **Multiple LLMs, same task** - compare which model is best suited for the job

</div>

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

- **Multiple approaches, same goal** - the best implementation wins

</div>

<!--
What if instead of one agent per task, we had two or three and took the first to finish? What if we had different LLM models tackling the same task to compare which was best?
-->

---
layout: statement
---

<AnimatedText text="Developer as Architect" tag="h1" :stagger="0.1" :duration="0.6" />

<p v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 1000, duration: 600 } }">What if developers designed *how* features get built instead of building every one by hand?</p>

<!--
The biggest what-if: what if the developer's role shifts from writing every line of code to designing how features get built and reviewing the results? You become the architect, not the bricklayer.
-->

---

# Demo 2: UI Design Agent

<div v-click>

An agent that specializes in **UI design** will generate 5 different design themes, then spawn 5 parallel agents to implement them.

</div>

<div v-click>

TODO: Kick off demo, switch to dashboard

</div>

<!--
I've designed an agent that's particularly good at coming up with UI design themes and prompts. I'm going to ask it to spawn 5 parallel agents that will each implement a different design.
-->

---

# Resources

<div v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 500 } }">

- Source code - **open source** (link TODO)

</div>

<div v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 500, duration: 500 } }">

- This presentation + recording - publicly available

</div>

<div v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 800, duration: 500 } }">

- Shoutout to the original TSK repo creator
- Shoutout to Cole Medin for his YouTube resources

</div>

<p class="takeaway" v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 1100, duration: 500 } }">None of this information should be gatekept.</p>

<!--
All source code, the presentation, the recording - everything will be publicly available. Huge shoutout to the original TSK repo creator and Cole Medin.
-->

---
layout: center
---

# Q&A

Thank you for your time.

<p class="subtitle">Agents are running in the background. Let's check on them at the end.</p>

<!--
Now I'll open the floor for Q&A while the UI design agents are running. If we have time at the end, I'll show their work.
-->
