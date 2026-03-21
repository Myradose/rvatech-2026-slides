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
Welcome everyone. My name is Alden Geipel and today I'm going to talk about what I'm calling the Doctor Strange approach to parallel agent orchestration. My goal is to transform the way you think about AI agents. This is particularly relevant to development work, but the concepts apply to any agent that performs tangible work.
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

2. **The Doctor Strange demos** - parallel agents exploring infinite outcomes

</div>

<div v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 800, duration: 500 } }">

3. **Key concepts + next steps** - what makes this possible

</div>

<!--
Three things I want to cover today. First, the evolution of how we work with AI - from prompt engineering through context engineering to what I believe comes next. Second, live demos of the Doctor Strange approach. And third, the key concepts that make this possible.
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
"Same research paper example. You engineered a great prompt, but what if you need it to cover AI breakthroughs from the last six months?"
(CLICK 1 - blockquote appears)
"No amount of prompt engineering can fix that. The model simply doesn't have that knowledge."
(CLICK 2 - explanation text AND flow diagram appear)
"This is actually why ChatGPT added web search. Instead of relying on what the model already knows, it goes out and finds current information."
(CLICK 3 - definition text appears)
"That's context engineering: giving the model the right knowledge or the means to get it. Not just telling it how to behave."
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
    <h3>Work<br>Retrieval</h3>
    <p>Infrastructure to extract results from each environment</p>
  </div>
</div>

<!--
Environment engineering has three pillars. Isolated environments: Docker containers or virtual machines where agents can work safely without risking your system. Observability infrastructure: dashboards where you can watch what they're doing in real time. And work retrieval: the infrastructure that lets you extract results out of each environment so you can review and use the work.
-->

---
layout: center
transition: section
---

<AnimatedText text="The Demo" tag="h1" :stagger="0.1" :duration="0.6" />

<p v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 800, duration: 500 } }">Instead of explaining further, let me show you.</p>

<!--
(Let the AnimatedText animation finish before speaking)
"Enough theory. Let me show you what this actually looks like."
(Brief pause, then advance)
-->

---
layout: none
clicks: 1
---

<DemoSlide title="Meet the App" subtitle="A simple fullstack application: users and products." :clicks="$clicks">
  <DemoViewer src="app" />
</DemoSlide>

<!--
Here's a simple fullstack application. Users and products, basic CRUD. The UI is pretty bare right now. Let's fix that.
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
[SETUP - slide appears with title and subtitle visible]
"Angular Material needs to be set up on this app. So here's the question: which AI model handles it best?"

[CLICK 1 - Claude appears]
"Claude?"

[CLICK 2 - Gemini appears]
"Gemini?"

[CLICK 3 - GPT appears]
"GPT?"

(Pause between each reveal. Let each one land. Don't rush.)

[CLICK 4 - takeaway line appears]
"Three models. Same task. Instead of picking one and hoping for the best..."
(Pause 2 seconds)
"...let's do what Doctor Strange would do."
(Pause 1 second)

[CLICK 5 - portal creation begins, 2.5s animation]
(As the arc starts drawing and sparks emerge)
"Let's open a portal to all three."
(Watch the animation. Say nothing else. Let the visuals do the work.)
(Arc completes, portal fully formed, demo slide visible through the ring)
(FULL STOP. Let the audience absorb the spinning portal for 2-3 seconds.)

[CLICK 6 - zoom through portal, 2.8s expo.in]
(Say nothing during the zoom. Let the animation carry the moment.)
(Lands on Demo 1 slide.)
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
(CLICK - Pocket Manager appears with three pockets in grid view, Claude Code open in each, idle)

[ORIENT THE AUDIENCE]
"This is a grid layout where each panel represents a pocket, which is a sandboxed full development environment. This one is for Claude, this one is for Gemini, and this one is for GPT. All three are running Claude Code, but each one is powered by its respective model. Claude Code doesn't normally support other models, but there's an open source tool called Claude Code Router that makes this possible."
(Point to the panel headers showing each pocket's name.)
"At the top you'll see a toggle where I can switch these panels between different views. I can show the terminal, the live frontend, or even the agent's workspace so we can watch it use the browser."

[TYPE THE PROMPT]
"Let me type the prompt that each one is going to use."
(Type the prompt live in the Claude pocket. Read it out as you type so the audience knows the task.)
"Now I'm going to paste this into the other two pockets."
(Paste and send in the Gemini and GPT pockets.)

[NARRATE WHILE AGENTS WORK]
"You can see all three are getting to work. They're exploring the codebase so they can plan out their changes."
(Let them run for a moment. Then expand one pocket to detail view.)
"Let me open the detail view so we can get a closer look."
(Point to the bottom of the terminal.)
"You can see that bypass permissions is on. That means I don't have to manually approve anything the agent is doing, because it's running in a completely isolated environment."
(Narrate what the agent is doing as it works. Read edits, file changes, commands. If it's interesting, show the split panel view. Flip to another pocket if one is further along or doing something different.)

[SHOW RESULTS]
(When the expanded pocket finishes, go back to grid view.)
"Now that this one has finished, let's check on the other two."
(Toggle all panels to the frontend service view so the audience sees the three implementations side by side. If one is still running, narrate briefly or call it.)
"Same starting point. Same prompt. Three different results. Which one do you like best?"
(Take a quick vote by show of hands.)
(Stop the two losers. Keep the winner running.)
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
"Quick look under the hood. Each of those three models was working inside its own Docker container with the full application stack. Completely isolated from your machine and from each other. The Pocket Manager dashboard you just saw lets you watch what they're doing in real time. And when they finish, you pull git branches out and review the results. All three pillars in action."
(Keep this brisk, 15-20 seconds. The Three Pillars slide already introduced these concepts. The audience just saw them in practice. This is confirmation, not discovery. Move on quickly.)
-->

---
layout: none
clicks: 1
---

<DemoSlide title="Live Demo: Design Exploration" subtitle="Three pockets. Three UI approaches. Tabs, accordions, or side navigation." :clicks="$clicks">
  <DemoViewer src="pocketManager" />
</DemoSlide>

<!--
"Now let's go deeper. We're going to take the winner and fork it."
(CLICK - reveal Pocket Manager. Fork the winning pocket twice. Rename the three pockets to Tabs, Accordions, and Side Nav.)
"Each one starts from the same winning implementation. Same codebase, same state. But each gets a different prompt: one builds tabs, one builds accordions, one builds side navigation. And I've added something new: each agent can spin up a browser to visually validate its work and test existing functionality."
(Paste prompts and send all three.)

[NARRATE WHILE AGENTS WORK]
(The audience already knows Pocket Manager from Demo 1. No need to re-explain the grid. Focus on what's different.)
"You can already see they're taking different approaches to the layout."
(Point out differences as they emerge. Spend a minute watching progress.)

[PLAYWRIGHT MOMENT]
"Now here's something I want you to watch for. Each agent can open a browser to check its own work. Let me switch to the workspace view."
(When an agent kicks off the browser, expand that pocket and switch to split view: terminal on the left, VNC on the right.)
"That's a real browser running inside the container. The agent is visually validating that everything looks right and testing existing functionality. All sandboxed."
(Let the audience watch the browser automation for a moment. This is the escalation from Demo 1.)

[WRAP UP]
(Go back to grid view. Toggle to frontend view to show the three different UIs.)
"Three design directions, all built and validated. You could review each one, pick the best, and merge it. That's design exploration."
(Keep it brief. Move on to Demo 3.)
-->

---
layout: none
clicks: 1
---

<DemoSlide title="Fire and Forget" subtitle="Three agents building a checkout page. They'll work while we talk." :clicks="$clicks">
  <DemoViewer src="pocketManager" />
</DemoSlide>

<!--
"One more quick thing before we move on."
(CLICK - reveal Pocket Manager)
"I'm kicking off three more agents, all building a checkout page for this app. All three running through Claude. They'll work in the background while we talk through some bigger-picture ideas."
(Let Pocket Manager show agents starting up. Spend only 15-20 seconds here.)
"By Q&A time, let's see if they've finished. That's fire and forget. You launch them and move on with your day."
-->

---
layout: center
transition: section
---

<AnimatedText text='"What If?"' tag="h1" :stagger="0.15" :duration="0.6" />

<!--
(Let the AnimatedText animation play out)
"You've seen a model race, design exploration, and fire-and-forget. All powered by the same infrastructure. But we're just scratching the surface. What else becomes possible?"
-->

---

# What If: Architect Agents

<div v-click v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">

> What if instead of writing prompts ourselves, we asked an agent to **design and spawn the pockets** for us?

</div>

<span v-click class="hidden" />
<div v-if="$clicks >= 2" class="architect-diagram">
  <div class="architect-input" v-motion :initial="{ opacity: 0, y: -12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 0, duration: 400 } }"><carbon:user /><span>Your goal</span></div>
  <div class="env-arrows" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 300, duration: 300 } }">
    <span class="env-arrow-down">↓</span>
  </div>
  <GlowReveal><div class="architect-box" v-motion :initial="{ opacity: 0, y: -12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 500, duration: 400 } }"><carbon:machine-learning-model /><span>Architect Agent</span></div></GlowReveal>
  <div class="env-arrows" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 800, duration: 300 } }">
    <span class="env-arrow-down">↓</span>
    <span class="env-arrow-label">designs &amp; spawns</span>
  </div>
  <div class="architect-workers-row" v-motion :initial="{ opacity: 0, y: -12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 1000, duration: 400 } }">
    <div class="architect-worker"><carbon:container-software /><span>Pocket A</span></div>
    <div class="architect-worker"><carbon:container-software /><span>Pocket B</span></div>
    <div class="architect-worker"><carbon:container-software /><span>Pocket C</span></div>
    <div class="architect-worker architect-worker-extra"><span>...</span></div>
  </div>
</div>

<!--
In those demos, I wrote the prompts and set up each pocket myself. But what if an agent did that for you? You give it a goal, and it figures out which pockets to spin up, what prompts to use, and kicks them all off.
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
What if you gave the same task to three pockets and took the first one to finish, discarding the rest? That's the race approach. Or you let them all finish and compare the results, which is what you saw in the first demo. Maybe one took longer but produced cleaner, more maintainable code. And this works across different agents, different LLMs, or different approaches. You're exploring multiple paths at once instead of betting on one.
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
Here's something I think about a lot. These powerful AI skills already exist: things like generating presentations, analyzing data, creating documents. Anthropic has an official PowerPoint skill for Claude Code, for example, and it's genuinely good. But right now, to use it, you need to install a CLI, navigate a terminal, manually approve every script execution. That's a non-starter for most people in an organization. But what if you put a simple frontend in front of it? An employee fills out a form with their topic, brand guidelines, source material. Behind the scenes, an agent orchestrates the work. And it all executes inside a pocket where scripts can run freely without any risk. The employee never sees a terminal, never has to approve random Python scripts that a skill wants to run, never worries about what's happening under the hood. The developer builds the workflow once. Everyone benefits.
-->

---

# Looking Ahead

<div class="comparison-grid">
  <div class="prompt-card" v-click v-motion :initial="{ opacity: 0, x: -40 }" :enter="{ opacity: 1, x: 0, transition: { duration: 500 } }">
    <p class="prompt-label">Agent Harnesses</p>
    <p class="prompt-card-body">The missing piece: workflow instructions, guardrails, and feedback loops that let agents tackle <strong>complex, long-running tasks</strong> with minimal but intelligent human intervention.</p>
    <p class="prompt-card-note">Think of it as the playbook you give agents so they know not just <em>what</em> to build, but <em>how</em> to build it well.</p>
  </div>

  <div class="prompt-card" v-click v-motion :initial="{ opacity: 0, x: 40 }" :enter="{ opacity: 1, x: 0, transition: { duration: 500 } }">
    <p class="prompt-label">Cloud Scaling</p>
    <p class="prompt-card-body">This demo runs on one machine, but these are just Docker containers. There's nothing stopping you from orchestrating them across a <strong>Kubernetes cluster</strong>.</p>
    <p class="prompt-card-note">Imagine spinning up dozens of agents in parallel, scaling horizontally as the work demands.</p>
  </div>
</div>

<p v-click v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }" class="exploration-note">Both are active areas of exploration</p>

<!--
"Two things I didn't demo but are critical for the future."
(CLICK 1 - Agent Harnesses card)
"First, agent harnesses. The system of workflow instructions and guardrails that tell agents not just what to build, but how to build it well. Think of it as the playbook."
(CLICK 2 - Cloud Scaling card)
"Second, cloud scaling. This demo runs on one machine, but these are just Docker containers. There's nothing stopping you from orchestrating them across a Kubernetes cluster. Spinning up dozens of agents in parallel."
(CLICK 3 - exploration note)
"Both are active areas of exploration."
-->

---
layout: statement
---

<AnimatedText text="Developer as Architect" tag="h1" :stagger="0.1" :duration="0.6" />

<p v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 1000, duration: 600 } }">What if developers designed <em>how</em> features get built instead of building every one by hand?</p>

<!--
The biggest what-if: what if the developer's role shifts from writing every line of code to designing how features get built and reviewing the results? Imagine managing multiple large, complex tasks at the same time, designing and providing feedback on how features should be built, rather than being the bricklayer that manually writes code and places every brick by hand. You become the architect, not the bricklayer.
-->

---

# Resources

<div class="resources-layout">
<div class="resources-list">

<div v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 500 } }">

- Source code -- **open source**, experimental
- Presentation slides -- available now
- Recording -- available after the summit

</div>

<div v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 600, duration: 500 } }">

- **tsk** -- foundation for pocket orchestration
- **Claude Code Viewer** -- tech stack behind Pocket Manager
- **Cole Medin** -- Claude Code & agentic engineering

</div>

<p class="takeaway" v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 1000, duration: 500 } }">None of this information should be gatekept.</p>

</div>
<div class="resources-qr" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 400, duration: 600 } }">
  <img src="/qr-code.png" class="qr-image" alt="QR code" />
  <span class="qr-label">Scan for all links</span>
</div>
</div>

<!--
Everything is open source and linked through that QR code. Fair warning - this is very much experimental, a proof of concept, not production-ready. The presentation slides are available now, and the recording will go up after the summit.

A few shoutouts. tsk provided the baseline that made this proof of concept a reality. The Pocket Manager web app you saw during the demos is built on the Claude Code Viewer project's tech stack. And Cole Medin - if you don't follow him, you should. He's one of the primary reasons I invested so heavily in Claude Code well before the recent hype. His content on Claude Code and agentic engineering has been invaluable.

None of this information should be gatekept.
-->

---
layout: center
---

# Thank You

<div v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 200, duration: 500 } }">

<p class="acknowledgment-names">Mike Cleary · Dana McMurray · Radha Manohar</p>

</div>

<p class="subtitle" v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, transition: { delay: 700, duration: 500 } }">Three agents are building a checkout page in the background. Let's check in before we wrap.</p>

<div class="qa-qr-overlay">
  <img src="/qr-code.png" alt="QR code" />
  <span class="qr-label">Resources</span>
</div>

<!--
Before we open for questions, I want to thank three people. Mike Cleary, Dana McMurray, and Radha Manohar at Allianz Partners. This project wouldn't exist and I wouldn't be here presenting today without their trust, support, and autonomy. I started almost three years ago as an intern who was supposed to be doing documentation work, and almost immediately they gave me the opportunity to transition into the development work I wanted to do. Every step of the way, they've given me the time, support, and resources to explore not just agentic development, but truly everything I've been interested in. Dana is actually the one who recommended I become a speaker here today. So thank you - genuinely.

Alright, let's open the floor for questions. Remember those checkout page agents we kicked off? Let's check in on them before we wrap up.
-->
