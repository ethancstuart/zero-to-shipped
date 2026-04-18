# ZTS 10-Day Launch Marketing Sprint

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Zero to Ship to its first paying customers by April 28, 2026 using a focused 4-channel non-engineer marketing push — lightweight NexusWatch-inspired structure, manual execution.

**Architecture:** Pillar-based content framework (Build-Story / Method / Outcome / Product) distributed across LinkedIn, Substack, and waitlist email. Creator seeding and optional newsletter sponsorship provide cold reach. Launch day is a coordinated 3-channel simultaneous push. No automation infra required — this is a 10-day sprint with ~8 content pieces and a clear per-day owner.

**Tech Stack:** Substack, LinkedIn, Resend (email already wired), zerotoship.app/admin/funnel, zerotoship.app/admin/sentry-test, Stripe dashboard.

---

## Specialist Input (adapted from NexusWatch council framework)

### Riley Matsuda — VP Growth & GTM
> "Every pre-launch post has one job: get a non-engineer to the free Module 1 preview. Not the pricing page. The preview."

- All external CTAs point to `/preview/module-1`, not `/pricing`. The preview converts; pricing repels.
- Track `login_click` by source to know which channel drives sign-ins.
- The only exception: launch day email goes to `/pricing` first, preview second.

### Jordan Reeves — VP Strategic Communications
> "You have a 10-day window and 8 content pieces. Every piece either moves someone toward the preview or it's noise. Cut it if it can't pass that test."

- Pillar mix for this sprint: Build-Story 40% / Method 25% / Outcome 20% / Product 15%.
- Build-Story posts have the highest shareability for this audience.
- Method posts drive the most email opt-ins (people want to learn the technique).
- Outcome posts convert best on launch day.

### Marcus Obi — Founder/CEO Advisor
> "Founding-100 scarcity is real. Use it exactly once in every channel before launch. Never fake it, never exaggerate it."

- One scarcity mention per channel pre-launch (Substack footer, LinkedIn post 2 P.S., launch email body).
- On launch day, founding counter is live on the site. Let the number do the work.

### Camille Rousseau — Product Marketing Manager
> "Tag every piece of content with its pillar. Review which pillar drove the most preview clicks 7 days post-launch. Double down on that pillar in month 2."

- Use UTM params on all external links: `?utm_source=linkedin&utm_medium=post&utm_campaign=launch-apr28`
- ZTS doesn't have a UTM dashboard yet (post-launch P2), but Vercel Analytics captures referrers by default.

---

## Pillar Framework

| Pillar | % of Sprint Content | Voice | Goal |
|--------|-------------------|-------|------|
| Build-Story | 40% | First-person maker | Trust + shareability |
| Method | 25% | Educational, first-person | Email opt-in + saves |
| Outcome | 20% | Product-first | Conversion |
| Product | 15% | Product-first | Awareness |

**Build-Story examples:** "I spent 6 months building a course while pretending to be my own student." "The habit tracker I built in 40 minutes changed how I think about backlog prioritization."

**Method examples:** "The AI build loop: 5 steps from blank file to working app." "Why prompt quality matters less than evaluation quality."

**Outcome examples:** "By module 16, you'll have a live URL you can send to your hiring manager." "What a PM portfolio looks like in 2026."

**Product examples:** "Zero to Ship has 4 role tracks — here's what the PM track covers." "How the skill tree works."

---

## 10-Day Calendar

| Date | Day | Task | Pillar | Channel | Owner |
|------|-----|------|--------|---------|-------|
| Apr 18 (Fri) | D-10 | Fill {{TODO}} in Substack Article 2 + LinkedIn Post 2 | Build-Story | — | Ethan (20 min) |
| Apr 18 (Fri) | D-10 | Draft creator outreach DMs | — | LinkedIn DM | Claude |
| Apr 18 (Fri) | D-10 | Newsletter research (top 3 targets) | — | Research | Claude |
| Apr 18 (Fri) | D-10 | Answer: newsletter budget + creator list | — | — | Ethan (5 min) |
| Apr 18 (Fri) | D-10 | **Sentry DSN setup** (P0) | — | sentry.io | Ethan (5 min) |
| Apr 19 (Sat) | D-9 | Send LinkedIn creator DMs | — | LinkedIn | Ethan |
| Apr 19 (Sat) | D-9 | Send newsletter sponsorship inquiry (if budget > $0) | — | Email | Ethan |
| Apr 20 (Sun) | D-8 | Buffer: final edit of Substack Article 2 | — | — | Ethan |
| Apr 21 (Mon) | D-7 | **Publish Substack Article 2** | Build-Story | Substack | Ethan |
| Apr 22 (Tue) | D-6 | **LinkedIn Post: link to Substack Article 2** | Build-Story | LinkedIn | Ethan |
| Apr 23 (Wed) | D-5 | **LinkedIn Post 2: product in action** | Method | LinkedIn | Ethan |
| Apr 24 (Thu) | D-4 | Newsletter slot live (if booked) | Product | Newsletter | partner |
| Apr 25 (Fri) | D-3 | Pre-launch verification (Sentry, Stripe, email flow) | — | zerotoship.app | Ethan + Claude |
| Apr 26 (Sat) | D-2 | **LinkedIn teaser: "2 days out"** | Outcome | LinkedIn | Ethan |
| Apr 27 (Sun) | D-1 | Stage launch email in Resend, final QA | — | — | Claude |
| Apr 28 (Tue) | **D-0** | **LAUNCH** | — | all | Ethan + Claude |
| Apr 30 (Thu) | D+2 | **Founding reminder email** | Outcome | Email | Ethan |

---

## File Map

Content files (already exist, need editing):
- `docs/launch-content/substack-article-2-build-process.md` — needs Ethan's {{TODO}} fills
- `docs/launch-content/linkedin-post-2-product-in-action.md` — needs Ethan's {{TODO}} fills
- `docs/launch-content/linkedin-post-3-launch-announcement.md` — ready, no TODOs
- `docs/launch-content/launch-email-announcement.md` — ready, needs sender address
- `docs/launch-content/launch-email-founding-reminder.md` — ready, needs real numbers day-of

New files to create this session:
- `docs/launch-content/linkedin-creator-outreach/[name].md` — one per creator (Claude drafts, Ethan sends)
- `docs/launch-content/newsletter-sponsorship-targets.md` — 3 targets with audience + pricing + pitch
- `docs/launch-content/linkedin-post-substack-link.md` — short LinkedIn post linking to Substack Article 2
- `docs/launch-content/linkedin-post-d2-teaser.md` — "2 days out" LinkedIn teaser

Code / product:
- `src/middleware.ts` — ✅ FIXED this session (robots.txt + sitemap excluded)
- `src/app/(marketing)/pricing/page.tsx` — ✅ UPDATED this session (5 new FAQ entries + preview nudge)
- `src/app/(marketing)/page.tsx` — ✅ UPDATED this session (bottom CTA hierarchy fixed)
- `.env.local` — needs `NEXT_PUBLIC_SENTRY_DSN` (Ethan action)

---

## Task 1: Ethan — Fill {{TODO}} Spots (20 minutes, Apr 18)

**Files:**
- Modify: `docs/launch-content/substack-article-2-build-process.md`
- Modify: `docs/launch-content/linkedin-post-2-product-in-action.md`

These are the ONLY personal details Claude cannot fill. Everything else in these docs is done.

- [ ] **Step 1: Open Substack Article 2 and fill the 5 {{TODO}} spots:**

```
TODO 1 (lines ~20-22): The specific moment you decided to build ZTS.
   Example: "It started when I filed the third JIRA ticket for the same internal tool and got deprioritized again."
   Write 2–3 sentences. One concrete memory.

TODO 2 (lines ~55-57): Reaction from the person you sent the habit tracker to.
   Example: "My wife looked at me and said 'you built this?' in a tone that made it clear she didn't believe me."
   One line of dialogue or reaction.

TODO 3 (lines ~90-92): One or two honest admissions about the platform's flaws.
   Example: "The mobile experience on narrow phones is rougher than I'd like. The skill tree doesn't render well below 375px."
   Keep it specific and grounded — this builds credibility.

TODO 4 (lines ~110-112): One honest sentence about what you're nervous about for launch.
   Example: "I'm nervous the first cohort will hit bugs I haven't found yet — and that's exactly why founding members exist."

TODO 5 (lines ~118-120): Sign-off.
   Example: "— Ethan"
```

- [ ] **Step 2: Open LinkedIn Post 2 and fill the 1 {{TODO}} spot:**

```
TODO (line ~14): Who you sent the habit tracker URL to.
   Replace "{{wife/friend}}" with the actual person.
   Example: "my wife" / "my friend Matt" / "my co-founder"
```

- [ ] **Step 3: Confirm sender address in launch email:**

Open `docs/launch-content/launch-email-announcement.md`, find the From line:
```
Ethan Stuart <{{ethan@zerotoship.app or personal sending address}}>
```
Replace with your actual Resend sender. (Likely `ethan@zerotoship.app` — confirm in your Resend account.)

- [ ] **Step 4: Tell Claude "content TODOs done"**

Claude will then draft the remaining content pieces.

---

## Task 2: Sentry P0 (5 minutes, Apr 18 — Ethan only)

**Files:**
- Modify: `.env.local` (Claude does this once you paste the DSN)

- [ ] **Step 1: Go to https://sentry.io/signup/ and sign in with Google (`ethan@zerotoship.app`)**

- [ ] **Step 2: Create a new project:**
  - Platform: **Next.js**
  - Project name: `zero-to-ship`
  - Everything else: default

- [ ] **Step 3: On the "Configure SDK" screen, find the DSN:**

The SDK is already installed. Do NOT copy the code blocks. Scroll until you see:
```
dsn: "https://xxxxxxxx@oXXXXXX.ingest.us.sentry.io/XXXXXXX"
```
Copy the URL between the quotes.

- [ ] **Step 4: Paste the DSN into Claude chat. Just the URL. Stop and wait.**

Claude will:
- Edit `.env.local` to set `NEXT_PUBLIC_SENTRY_DSN=<your-dsn>`
- Give you the Vercel CLI command to add it to production

- [ ] **Step 5: Run the Vercel command Claude gives you:**
```bash
cd /Users/ethanstuart/Projects/zero-to-shipped
vercel env add NEXT_PUBLIC_SENTRY_DSN production
# paste DSN when prompted
vercel --prod
```

- [ ] **Step 6: Verify at https://zerotoship.app/admin/sentry-test:**
  - Click "Trigger server error" → green banner + Event ID
  - Click "Trigger client error" → another Event ID
  - Open Sentry dashboard → Issues → resolve both events
  - Tell Claude: **"Sentry verified."**

---

## Task 3: Creator Outreach DMs (Claude drafts, Ethan sends)

**Files:**
- Create: `docs/launch-content/linkedin-creator-outreach/[name].md` (one per creator)

**Prerequisite:** Ethan must answer: give Claude 3–5 LinkedIn handles of PM/BA/PjM voices you've personally engaged with.

Format:
```
1. Name — LinkedIn URL — why this person (1 line)
2. ...
```

If no warm connections exist, tell Claude. Claude will pivot to:
- A cold micro-influencer approach (lower conversion, but documented)
- Or double down on organic LinkedIn + newsletter

- [ ] **Step 1: Provide creator list to Claude**

- [ ] **Step 2 (Claude):** Draft one personalized DM per creator. Each DM:
  - References specific content they've posted (not a template)
  - Is under 150 words
  - Has one ask: "Would you be open to trying Module 1 and sharing your honest reaction?"
  - Includes the preview link: `https://zerotoship.app/preview/module-1`

- [ ] **Step 3 (Ethan):** Review, personalize further if needed, send by Apr 19**

- [ ] **Step 4:** Log each send in `docs/launch-content/linkedin-creator-outreach/tracker.md` with date sent + response status

---

## Task 4: Newsletter Sponsorship Research (Claude does, Ethan decides)

**Files:**
- Create: `docs/launch-content/newsletter-sponsorship-targets.md`

**Prerequisite:** Ethan must answer newsletter budget: A ($500) / B ($2000) / C (organic only)

**If C (organic only):** Skip this task entirely. Double down on LinkedIn organic.

**If A or B:** Claude researches and documents top 3 newsletter targets.

Criteria:
- Primary audience: PMs, BAs, Project Managers, BI Engineers, or no-code practitioners
- Audience size: 5K–50K (sweet spot for ZTS launch budget)
- Accepts sponsorships / is findable via advertise page or Paved/Swapstack
- Not an engineer-first newsletter

- [ ] **Step 1 (Claude):** Research 3 newsletters meeting criteria. For each, document:
  ```markdown
  ## [Newsletter Name]
  - **URL:** 
  - **Audience:** [description]
  - **Est. size:** 
  - **Sponsorship page:** [URL or "DM only"]
  - **Est. cost per send:** 
  - **Why ZTS fits:**
  - **Pitch angle:** [1 sentence specific to their audience]
  - **Contact:** [email or form URL]
  ```

- [ ] **Step 2 (Ethan):** Pick 1 target, approve pitch angle

- [ ] **Step 3 (Ethan):** Send sponsorship inquiry by Apr 19 (tight — newsletters need 5–7 days lead time for Apr 24 slot)

---

## Task 5: Draft Missing Content Pieces (Claude, after Task 1 complete)

**Files:**
- Create: `docs/launch-content/linkedin-post-substack-link.md`
- Create: `docs/launch-content/linkedin-post-d2-teaser.md`

### 5a: LinkedIn Post — Substack Link (publish Apr 22)

Pillar: Build-Story. Goal: drive Substack reads + email opt-ins.
Format: ~150 words. Leads with the most shareable line from Article 2. Single link at end.

```markdown
# LinkedIn Post — Link to Substack Article 2

**Pillar:** Build-Story
**Target publish:** April 22, 2026 (Tuesday, day after Substack publishes)
**Best time:** 8–9am ET

---

[excerpt from most shareable line in Article 2 — the "moment it clicked" section]

I wrote the longer version on Substack this week.

If you're a PM, BA, or project manager who has ever gotten a backlog item deprioritized — the article is for you.

→ [Full post] https://[your-substack-url]/p/[article-slug]

#BuildInPublic #ProductManagement
```

*Claude fills the actual excerpt once Substack Article 2 is finalized.*

### 5b: LinkedIn Post — D-2 Teaser (publish Apr 26)

Pillar: Outcome. Goal: generate anticipation, get pre-commitments in comments.
Format: ~200 words. No link — LinkedIn hates external links in feed posts. Comment drops the link.

```markdown
# LinkedIn Post — "2 Days Out"

**Pillar:** Outcome
**Target publish:** April 26, 2026 (Saturday)
**Best time:** 9–11am ET

---

Two days until I ship the thing I've been building for six months.

Zero to Ship launches Monday.

Here's what I keep thinking about:

The first person who completes all 16 modules is going to have something most PMs don't: a deployed project with a real URL, and proof that they built it.

Not a side project that's 80% done.
Not a Figma prototype.
A working web app. Live. Shareable.

If that's something you want — the course opens in two days.

First 100 students get founding member pricing ($99 instead of $199). It's not marketing copy — the counter is live on the site and it's going down.

See you Monday.

— Ethan

(Link in comments)
```

**Pinned comment to post immediately after:**
```
→ Try Module 1 free (no sign-up): https://zerotoship.app/preview/module-1
Full course opens Monday: https://zerotoship.app
```

- [ ] **Step 1 (Claude):** Write both posts, save to files above
- [ ] **Step 2 (Ethan):** Review + approve
- [ ] **Step 3 (Ethan):** Schedule via LinkedIn or post manually on target dates

---

## Task 6: Pre-Launch Technical Verification (Apr 25 — D-3)

**Files:** None — all checks run against production site.

Run every check below. Fix anything that fails before continuing.

- [ ] **Step 1: robots.txt and sitemap**
```bash
curl -sL https://zerotoship.app/robots.txt
# Expected: plain text with "User-agent: *" and "Allow: /"

curl -sL https://zerotoship.app/sitemap.xml | head -20
# Expected: XML starting with <?xml...> and <urlset...>
```

- [ ] **Step 2: Sentry capture**
  - Open https://zerotoship.app/admin/sentry-test
  - Trigger server error → confirm green banner
  - Trigger client error → confirm Event ID
  - Check Sentry dashboard → both events present

- [ ] **Step 3: Stripe payment flow**
  - Sign in at https://zerotoship.app
  - Navigate to any locked module (Module 6+)
  - Click "Unlock Full Access"
  - Verify Stripe checkout page loads and shows $99 founding price
  - Do NOT complete payment — just verify the page loads correctly

- [ ] **Step 4: Email flow**
  - Verify Resend sender domain is verified (https://app.resend.com → Domains)
  - Test send a welcome email to your personal email to confirm delivery + formatting

- [ ] **Step 5: Free preview**
  - Open https://zerotoship.app/preview/module-1 in an incognito window
  - Verify: no login wall, content loads, module renders correctly

- [ ] **Step 6: Founding counter**
  - Open https://zerotoship.app
  - Verify FoundingCounter component displays (should show 100 spots remaining or count from DB)

- [ ] **Step 7: OG images**
  - Paste https://zerotoship.app into https://opengraph.xyz
  - Verify OG title, description, and image are correct
  - Paste https://zerotoship.app/pricing — same check
  - Paste https://zerotoship.app/for/product-managers — same check

---

## Task 7: Launch Day Runbook (April 28, 2026)

**Owner split:** Claude pre-stages everything Apr 27. Ethan executes Apr 28.

### Pre-Stage (Apr 27 — Claude)

- [ ] **Step 1:** Final copy check on launch email in `docs/launch-content/launch-email-announcement.md`
  - Verify all 3 links work: homepage, preview, pricing
  - Verify sender address is filled in (not a placeholder)
  - Verify no "{{TODO}}" strings remain

- [ ] **Step 2:** Final copy check on LinkedIn Post 3 in `docs/launch-content/linkedin-post-3-launch-announcement.md`
  - Confirm word count ~290
  - Confirm two links: preview + pricing
  - Confirm pinned-comment text is written out

- [ ] **Step 3:** Verify production build is clean
```bash
cd /Users/ethanstuart/Projects/zero-to-shipped
npm run build 2>&1 | grep -E "(error|✓|✗)"
npm test -- --passWithNoTests 2>&1 | tail -5
```

### Launch Morning (Apr 28, 8:00am ET — Ethan)

- [ ] **7:50am:** Open Resend, open the staged launch email. Final read. Send to full waitlist list at **8:00am ET**.

- [ ] **8:05am:** Watch the first email open notifications. Reply immediately to any reply-to responses (even if just "thanks for the kind words").

- [ ] **9:00am:** Post LinkedIn Post 3 (launch announcement). Immediately post the pinned comment with links.

- [ ] **9:05am:** If you have a Substack launch post (Article 3) — publish it now. If not, cross-post the LinkedIn text to Substack as a Note.

- [ ] **9:15am:** Text or DM the creators who responded to your outreach: "It's live — would love a share if you can."

- [ ] **9:30am:** Open https://zerotoship.app/admin/funnel and take a screenshot of baseline state (0 conversions). This is your before snapshot.

- [ ] **Every 2 hours for the first 8 hours:** Check Stripe dashboard for new purchases + `/admin/funnel` for signup counts.

- [ ] **End of launch day:** Count: signups, free users, paid conversions. Post a brief Substack Note or LinkedIn comment update: "Day 1: X signups, Y founding members." Real numbers, no spin.

---

## Task 8: 48-Hour Post-Launch (Apr 30)

**Files:**
- Modify: `docs/launch-content/launch-email-founding-reminder.md` (fill in real stats before sending)

- [ ] **Step 1 (Ethan — Apr 30, 9am):** Pull real numbers from Stripe + `/admin/funnel`:
  - Total signups
  - Founding member spots remaining (100 - paid conversions)
  - Number of Module 1 completions

- [ ] **Step 2:** Fill in the founding-reminder email placeholders:
  ```
  {{X}} students → actual number who started Module 1
  {{Y}} founding member spots left → 100 - paid conversions
  {{Z}} people shipped → Module 1 completions (or omit if 0)
  ```

- [ ] **Step 3:** Choose subject line:
  - If <30 spots left → Subject #1: "{{Y}} founding spots left"
  - Otherwise → Subject #2: "Launched 48 hours ago — here's what's happening"

- [ ] **Step 4:** Send to non-converted waitlist segment. If you can't filter in Resend, send to everyone (acceptable at this volume).

- [ ] **Step 5:** Log launch results in Notion Launch Tracker:
  ```
  Days since launch: 2 | Signups: X | Free→Premium conversions: Y | Top source: [channel] | Founding spots remaining: Z
  ```

---

## Success Metrics

| Metric | Target | Where to check |
|--------|--------|----------------|
| Waitlist email open rate | >40% | Resend dashboard |
| Module 1 preview → sign-in conversion | >15% | /admin/funnel |
| Sign-in → paid conversion | >5% | /admin/funnel |
| Founding spots sold by launch day | >10 | Stripe |
| Founding spots sold by D+7 | >50 | Stripe |
| LinkedIn Post 3 impressions | >1K | LinkedIn Analytics |
| Substack Article 2 opens | >50% of subscribers | Substack |

---

## Open Questions (Ethan must answer before Task 3 and Task 4)

**Q1: Creator list**
> 3–5 LinkedIn handles of PMs, BAs, or PjMs you've personally engaged with.
> Format: `Name — LinkedIn URL — why you'd pick them (1 line)`
> If no warm connections: say so, Claude pivots strategy.

**Q2: Newsletter budget**
> A. Yes, up to $500
> B. Yes, up to $2000
> C. No, organic only

Both answers unlock the next phase of work. Without them, Tasks 3 and 4 are blocked.

---

## Notes on NexusWatch Differences

NexusWatch built a full automated content pipeline (7 platforms, AI-generated posts, Discord approval bot, A/B variant cron, voice tuning). ZTS does not need this because:

1. **Volume mismatch:** NexusWatch targets 200 posts/month. ZTS needs ~8 pieces total for launch.
2. **Timeline:** 10 days. Automation setup takes 3–5 days of build time — not worth it for a single sprint.
3. **Audience:** Non-engineers respond better to personal, first-person content than polished automated posts. The "authenticity premium" is higher for a course product than for a geopolitical intelligence platform.

**Post-launch:** If ZTS hits 50+ paying customers and a recurring content engine makes sense for sustaining growth, this is where to revisit. The NexusWatch architecture is available as a template. The plan for that phase would be a new plan doc.
