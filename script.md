# Presentation Script

Full rough script for "The Doctor Strange Approach to Parallel Agent Orchestration" -- RVATech Data & AI Summit 2026.

---

## Slide 1 -- Title

Welcome everyone. My name is Alden Geipel and today I'm going to talk about what I'm calling the Doctor Strange approach to parallel agent orchestration. My goal is to transform the way you think about AI agents. This is particularly relevant to development work, but the concepts apply to any agent that performs tangible work.

---

## Slide 2 -- About Me

Quick background on me. I'm a full stack developer at Allianz Partners working across Angular, React Native, and .NET. I'm on our AI Committee where I help shape how we adopt AI across the organization. I've built agentic applications for real business problems, including a compliance analysis tool powered by Claude and AWS Bedrock. And I use Claude Code extensively in my daily workflow, which is what led me to the patterns I'm going to show you today.

---

## Slide 3 -- What We'll Cover

Three things I want to cover today. First, the evolution of how we work with AI - from prompt engineering through context engineering to what I believe comes next. Second, live demos of the Doctor Strange approach. And third, the key concepts that make this possible.

---

## Slide 4 -- Prompt Engineering

One of the first concepts that was coined when AI started making waves was prompt engineering. The difference between a lazy prompt and a well-crafted one could be dramatic. But it had limitations.

---

## Slide 5 -- Context Engineering

"Same research paper example. You engineered a great prompt, but what if you need it to cover AI breakthroughs from the last six months?"

(CLICK 1 - blockquote appears)

"No amount of prompt engineering can fix that. The model simply doesn't have that knowledge."

(CLICK 2 - explanation text AND flow diagram appear)

"This is actually why ChatGPT added web search. Instead of relying on what the model already knows, it goes out and finds current information."

(CLICK 3 - definition text appears)

"That's context engineering: giving the model the right knowledge or the means to get it. Not just telling it how to behave."

---

## Slide 6 -- Context Engineering in Practice

This is exactly what today's coding agents are doing. Claude Code, Codex CLI, Copilot - they're sophisticated context engineering systems. The tools they use - file search, code editing, terminal access - those are all forms of context engineering. Each tool gives the model more context about your project. They read your codebase to build understanding, then use that context to make changes. Context engineering in action.

---

## Slide 7 -- But There Are Limits

These agents are incredible but they have a fundamental limitation: they're running on your machine with no isolated environment of their own. That means you're babysitting every step. You get approval fatigue from constantly approving or denying actions, sometimes approving things by accident. And there's real risk to your git history, packages, and system.

---

## Slide 8 -- Environment Engineering

This brings me to what I believe is the next evolution: environment engineering. It's the process of creating isolated environments for agents to work in, the infrastructure to observe them in real time, and the means to retrieve and use their work. It's what lets agents tackle complex tasks with minimal but intelligent human intervention.

---

## Slide 9 -- Three Pillars

Environment engineering has three pillars. Isolated environments: Docker containers or virtual machines where agents can work safely without risking your system. Observability infrastructure: dashboards where you can watch what they're doing in real time. And work retrieval: the infrastructure that lets you extract results out of each environment so you can review and use the work.

---

## Slide 10 -- The Demo (Section Break)

(Let the AnimatedText animation finish before speaking)

"Enough theory. Let me show you what this actually looks like."

(Brief pause, then advance)

---

## Slide 11 -- Meet the App

Here's a simple fullstack application. Users and products, basic CRUD. The UI is pretty bare right now. Let's fix that.

---

## Slide 12 -- The Challenge + Portal (HERO MOMENT)

[SETUP - slide appears with title and subtitle visible]
"Angular Material needs to be set up on this app. So here's the question: which AI model handles it best?"

[CLICK 1 - Haiku appears]
"Haiku?"

[CLICK 2 - Sonnet appears]
"Sonnet?"

[CLICK 3 - Opus appears]
"Opus?"

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

---

## Slide 13 -- Live Demo: Multi-Model Redesign

(CLICK - Pocket Manager appears with three pockets in grid view, Claude Code open in each, idle)

[ORIENT THE AUDIENCE]
"This is a grid layout where each panel represents a pocket, which is a sandboxed full development environment. This one is Haiku, this one is Sonnet, and this one is Opus. All three are running Claude Code, each configured with a different model tier."
(Point to the panel headers showing each pocket's name.)
"At the top you'll see a toggle where I can switch these panels between different views. I can show the terminal, the live frontend, or even the agent's workspace so we can watch it use the browser."

[TYPE THE PROMPT]
"Let me type the prompt that each one is going to use."
(Type the prompt live in the Haiku pocket. Read it out as you type so the audience knows the task.)
"Now I'm going to paste this into the other two pockets."
(Paste and send in the Sonnet and Opus pockets.)

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

---

## Slide 14 -- How It Works

"Quick look under the hood. Each of those three models was working inside its own Docker container with the full application stack. Completely isolated from your machine and from each other. The Pocket Manager dashboard you just saw lets you watch what they're doing in real time. And when they finish, you pull git branches out and review the results. All three pillars in action."

(Keep this brisk, 15-20 seconds. The Three Pillars slide already introduced these concepts. The audience just saw them in practice. This is confirmation, not discovery. Move on quickly.)

---

## Slide 15 -- Live Demo: Design Exploration

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

---

## Slide 16 -- Fire and Forget

"One more quick thing before we move on."

(CLICK - reveal Pocket Manager)

"I'm kicking off three more agents, all building a checkout page for this app. All three running through Claude. They'll work in the background while we talk through some bigger-picture ideas."

(Let Pocket Manager show agents starting up. Spend only 15-20 seconds here.)

"By Q&A time, let's see if they've finished. That's fire and forget. You launch them and move on with your day."

---

## Slide 17 -- Race & Compare

What if you gave the same task to three pockets and took the first one to finish, discarding the rest? That's the race approach. Or you let them all finish and compare the results, which is what you saw in the first demo. Maybe one took longer but produced cleaner, more maintainable code. And this works across different agents, different LLMs, or different approaches. You're exploring multiple paths at once instead of betting on one.

---

## Slide 18 -- Beyond Developers

Here's something I think about a lot. These powerful AI skills already exist: things like generating presentations, analyzing data, creating documents. Anthropic has an official PowerPoint skill for Claude Code, for example, and it's genuinely good. But right now, to use it, you need to install a CLI, navigate a terminal, manually approve every script execution. That's a non-starter for most people in an organization. But what if you put a simple frontend in front of it? An employee fills out a form with their topic, brand guidelines, source material. Behind the scenes, an agent orchestrates the work. And it all executes inside a pocket where scripts can run freely without any risk. The employee never sees a terminal, never has to approve random Python scripts that a skill wants to run, never worries about what's happening under the hood. The developer builds the workflow once. Everyone benefits.

---

## Slide 19 -- "What If?" (Section Break)

(Let the AnimatedText animation play out)

"What else becomes possible?"

---

## Slide 20 -- Looking Ahead

"I want to share two things on the roadmap."

(CLICK 1 - Rewind Timeline card)

"Remember the Time Stone? The ability to go back in time when things went wrong? That's the idea here. If you've used Claude Code, you might know the /rewind command. It can undo file changes. But that's it. If the agent ran a bash command that broke something, deleted files, messed up a database, changed system configuration, /rewind can't help you. This goes further. A snapshot of the entire environment before every single tool call. Something goes wrong forty steps in? Roll back to that exact point. The whole environment. Not just source code. Every package install, every config change, every database write. And you can branch those snapshots, meaning save your current spot, try a completely different approach from an earlier point, and keep both timelines around. And it's not just for humans watching over the agent. The agent could rewind itself. It detects that something broke, rolls back, and picks up right where it left off knowing what went wrong and why."

(CLICK 2 - Environment Self-Improvement card)

"Second one: agents that improve their own environment. Today agents work inside the container as-is. But what if they could install global packages, change environment configuration, add or modify their own skills and MCP servers? The agent requests a rebuild from the host, and reboots with those changes baked in. Over time, the environment converges on the ideal setup for the task. This works because everything in the system is designed with reproducibility in mind."

(CLICK 3 - footer note)

"Both are on the roadmap, alongside cloud scaling. Everything you've seen today runs on one machine, but scaling horizontally is a big part of the vision for this project."

---

## Slide 21 -- Agent Teams

"I need to give you some context for this one. Claude Code recently shipped an experimental feature called agent teams. I want to explain what it does and where it falls short, because that's exactly the gap this kind of infrastructure is designed to fill."

(CLICK 1 - Foundation diagram appears: Human -> Orchestrator -> A/B/C/D)

"A lead agent coordinates multiple teammates that can work in parallel. But there's a catch. All teammates share the same filesystem. The docs themselves warn you to split up work so each teammate owns different files, or you get overwrites. No git isolation, no individual dev environments. Unlike real development teams, they can't take advantage of the isolation that makes real teams productive. The vision here is to provide that isolation."

(CLICK 2 - Labels swap from A/B/C/D to Frontend/Backend/Database/Integrator)

"Now imagine each teammate gets its own pocket. The team lead creates the architectural plan that all the agents follow. Frontend, backend, and database specialists each focus on their domain. And the integrator merges their work and verifies it against the team lead's plan. But what happens when something comes up during development and the original plan just isn't going to work? Maybe the database schema can't support what was planned."

(CLICK 3 - Escalation pulse travels upward: Integrator -> Team Lead -> Human)

"The integrator catches the conflict and escalates it to the team lead. If the team lead can't resolve it, it goes to the human. This is the perfect moment for human-in-the-loop."

(CLICK 4 - Delegation flow: Human sends decisions down through Team Lead to Frontend/Backend/Database)

"The human reviews the options, makes a decision, and that decision flows back down to the agents. Notice what's different here. You're not approving individual commands or tool calls. You're making the architectural decisions that shape the entire feature. The agents handle the implementation. That's a fundamentally different kind of human-in-the-loop, and it's the kind that actually scales. Now here's where things get interesting. Why stop at one team?"

(CLICK 5 - Team of teams transformation: 3 Team Leads under a new Orchestrator)

"Imagine orchestrators managing multiple team leads, each running their own specialized team. Each team lead owns a distinct feature and plans the work for their team. The orchestrator above them is responsible for dividing work across teams in a way that minimizes overlap and avoids merge conflicts. Same escalation pattern applies here too. This might be a bold prediction, but I believe something like this is what AGI is going to look like. Not one impossibly capable model that can somehow do everything, but orchestrated teams of agents with the right isolation, the right observability, and humans making the decisions that actually matter. The models we have right now are already incredibly capable. Most of us, myself included, are using them at a fraction of their potential."

(Brief pause, then advance to Developer as Architect)

---

## Slide 22 -- Developer as Architect

I hope that by this point I've accomplished my goal of transforming how you all think about AI agents. I believe we are rapidly moving towards a world in which developers play the role of architects, designing how features are built, rather than playing the role of a bricklayer manually writing every line of code by hand.

---

## Slide 23 -- Resources

Everything is open source and linked from the QR code at the end. Fair warning - this is very much experimental, a proof of concept, not production-ready. The presentation slides are available now, and the recording will go up after the summit.

A few callouts. tsk provided the baseline that made this proof of concept a reality. And Cole Medin - if you don't follow him, you should. He's one of the primary reasons I invested so heavily in Claude Code well before the recent hype. His content on Claude Code and agentic engineering has been invaluable.

None of this information should be gatekept.

---

## Slide 24 -- Acknowledgments

I want to thank three people. Mike Cleary, Dana McMurray, and Radha Manohar at Allianz Partners. This project wouldn't exist and I wouldn't be here presenting today without their trust, support, and autonomy. I started almost three years ago as an intern who was supposed to be doing documentation work, and almost immediately they gave me the opportunity to transition into the development work I wanted to do. Every step of the way, they've given me the time, support, and resources to explore not just agentic development, but truly everything I've been interested in. Dana is actually the one who recommended I become a speaker here today. So thank you - genuinely.

---

## Slide 25 -- Thank You

Thank you all. Remember those checkout page agents we kicked off? Let's check in on them before we wrap up.

(Check on background agents. Take questions.)

(CLICK - QR code reveals)

Everything I showed today, all the source code and resources, is behind this QR code.
