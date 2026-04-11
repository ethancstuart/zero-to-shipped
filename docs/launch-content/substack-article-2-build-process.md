# Substack Article 2 — I built a coding course for non-engineers. Here's what actually happened.

**Status:** DRAFT — first-person maker voice per April 11 narrative decision. Ethan fills `{{TODO}}` spots, edits personal details, publishes ~7–10 days before launch (April 21).

**Target publish date:** April 21, 2026 (Monday, 7 days pre-launch)

**Suggested headline options (pick one):**
1. I built a coding course for non-engineers. Here's what actually happened.
2. What I learned building a course for PMs who can't code
3. The build log: 90 days of shipping a course with AI
4. I'm a PM, not an engineer. Here's how I built a 16-module course anyway.
5. Notes from building Zero to Ship

**Target length:** 1,200–1,800 words. Long enough to be substantive, short enough to finish on a commute.

---

## Body

I'm a Product Manager. I've written thousands of user stories. I've drawn hundreds of wireframes. Until about six months ago, I'd never shipped a line of production code.

Then I started building a course to teach PMs, BAs, and project managers how to build real software with AI tools. The obvious question: could I actually build it myself, using the same tools I was going to teach? Or was I going to be one of those course creators who talks about the thing without having actually done the thing?

I decided I wouldn't ship the course until I could prove the course worked on me first.

Zero to Ship launches on {{April 28, 2026}}. This is the honest build log.

---

### The first version was a markdown file

{{TODO: Ethan — open this with the specific moment you decided to build ZTS. Was it a conversation with a PM friend? A backlogged prototype? A specific bad experience waiting on engineering? Pick one concrete memory. 2–3 sentences.}}

I started with a markdown file. Sixteen headings. Under each heading, the thing a non-engineer would need to learn in that module. No code. No platform. Just a table of contents for a course that didn't exist yet.

That file turned out to be the most important artifact in the whole project. Every module I later wrote had to pass a simple test: would the version of me who was stuck in a sprint planning meeting at {{previous company or role}} — the version of me who had an idea and no way to prototype it — would that person be able to read the module and actually build the thing by the end?

If the answer was no, the module got rewritten.

### What "vibe coding" really looks like

The term "vibe coding" gets thrown around a lot. Usually it means "describe what you want in plain English and the AI writes it for you." That's technically true and deeply misleading.

Here's what it actually looks like when a non-engineer tries to build something real with AI coding tools:

1. You describe what you want. The AI writes something. It's roughly the shape of what you asked for.
2. You open it. It doesn't work.
3. You look at the error. You have no idea what the error means.
4. You paste the error back into the AI. It rewrites the code.
5. Now it works — but not the way you wanted.
6. You describe the gap. It fixes the gap.
7. You discover an edge case. You describe it. It handles it.
8. You keep iterating.

This is the build loop. I call it prompt → review → run → evaluate → iterate in the course. In practice it feels more like having a really fast, really patient junior engineer who never gets tired and who will happily try the same thing fourteen different ways until it works.

The skill that matters is not writing prompts. It's evaluating output. The skill PMs already have — the ability to look at a thing and know what's wrong with it — turns out to be the exact skill that makes AI coding work.

### The moment it clicked

The first thing I built with the AI was a habit tracker. Nothing revolutionary. But it was mine. It ran in my browser. It persisted to local storage. It had a streak counter that actually worked. Total time from prompt to working app: about 40 minutes.

Forty minutes.

Before that, the last time I had "built" something was writing a user story for an engineer who was going to build it next quarter.

I sent the URL to my {{wife / partner / friend — pick}}. They clicked it. They added a habit. They saw the streak counter work. That was the moment.

{{TODO: Ethan — add the specific reaction from the person you sent it to. One line of dialogue or reaction if you can remember it.}}

### Building the course was the same loop

Here's the part that surprised me: building a course about AI coding is itself just another thing you can build with AI coding. The Zero to Ship platform — the site you're reading about, with the modules and the XP and the skill tree — was built the same way I'm teaching students to build their own projects.

- Next.js + TypeScript + Tailwind + Supabase + Stripe.
- Every commit written with Cursor or Claude Code.
- Every bug fix was me pasting an error into the AI and asking it to fix.
- Every new feature started with me describing what I wanted in plain English.

I'm not going to tell you the platform is flawless. {{TODO: Ethan — one or two honest admissions. What's a feature you're embarrassed by? What's something you'd build differently? Keep it grounded; this is what makes the article trustworthy.}}

But it works. Real users are on it. The gamification engine runs. The payment flow works. The certificate generator works. People who have never written code are signing in and completing modules.

And I built all of it using the same techniques I'm teaching.

### What I learned about teaching non-engineers

Three things stood out:

**1. The blocker isn't the tools. It's the permission.**

Most PMs and BAs I've talked to about this don't need another tutorial. They need someone to tell them it's allowed — that they're actually supposed to be the one building this, and that they don't need to apologize for it.

**2. Non-engineers don't want to become engineers.**

Nobody signs up for ZTS because they want a career change. They sign up because they want to ship the thing their sprint backlog won't. The course isn't trying to turn PMs into developers. It's trying to turn PMs into people who can prototype without permission.

**3. The curriculum has to respect your existing skills.**

PMs know how to write specs. BAs know how to model processes. Project managers know how to build reports. The course has to treat those skills as assets — the thing that makes you *faster* at AI coding — not as irrelevant background. Module 2 is literally called "Prompt Engineering & Critical Thinking" because writing a good prompt is just writing a good spec.

### What's next

The course launches on {{April 28, 2026}}. {{TODO: Ethan — one honest sentence about what you're nervous about. Not false modesty. A real concern.}} But I'm shipping it on time, because that's the entire point.

The first 100 students get founding member pricing — $99 one-time instead of the standard $199. That's partly because I need early students to stress-test the platform, and partly because the people who are willing to try a brand-new course from an unknown PM in exchange for a discount are exactly the people I want to teach first.

If you're a PM, a BA, a project manager, or a BI engineer, and you've been sitting on an idea that your engineering team can't get to — consider this your permission slip.

**[Try Module 1 free](https://zerotoship.app/preview/module-1) — no sign-up required.**

If you like how it feels, [the full course is here](https://zerotoship.app/pricing).

Either way: build the thing.

{{TODO: Ethan — sign off. "— Ethan" or however you want to close. Keep it brief.}}

---

## Editing notes for Ethan

- **Personal details marked `{{TODO}}`** — fill these in before publishing. They're the difference between "generic maker story" and "trustworthy first-person account."
- **Word count right now**: ~1,150 without TODOs, will land around 1,400–1,600 once personal details are in.
- **Tone check**: product-first on the landing page, maker-first here. This article leans into "I" deliberately.
- **Link placement**: two links — preview (primary) and pricing (secondary). Don't add more.
- **Publish timing**: suggested Monday April 21. Gives the piece a full week to circulate before launch day.
- **Cross-post**: after publishing on Substack, adapt the "moment it clicked" section into LinkedIn Post 2 (already drafted in linkedin-post-2-product-in-action.md).
