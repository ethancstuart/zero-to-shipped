# Zero to Ship — UAT Pool Definition

**Prepared by:** The Council (Full 10-Member Review)
**Date:** 2026-03-29
**Target:** Soft launch April 8, 2026
**Pool Size:** 100 simulated testers

---

## Council Deliberation Summary

**Dr. Maren Cole (Career Coach):** The pool must over-index on career transitioners — people who feel the AI wave coming and want to stay relevant. These are the people who will actually finish the course. At least 30% should be people actively worried about their career trajectory.

**Kai Nakamura (VP SWE):** We need enough technical users to stress-test the content calibration. If a data engineer finds Module 3 insultingly basic and drops off, that's a signal. But they're not the core — cap technical users at 10-12%. The real question is whether a PM who's never opened a terminal can follow Module 1 without Googling anything.

**Priya Raghavan (VP Data):** Include BI Engineers and data analysts specifically — they're the bridge personas. Technical enough to "get it" but not engineers. They'll tell us if the pacing works. Also: we need at least 5 people who care about data governance and will notice if we're sloppy with user data during onboarding.

**Jordan Reeves (VP Comms):** The landing page has to pass the 5-second test for every single persona. If a VP of L&D lands on the page and can't immediately tell "this is for my team," we lose the enterprise upsell forever. I want 8-10 decision-makers in this pool specifically to test messaging comprehension.

**Ava Chen (Design Lead):** Mobile testing is non-negotiable. At least 30% of the pool should do their entire UAT flow on mobile. I also want age diversity — a 24-year-old PM and a 52-year-old director will have very different patience thresholds for onboarding friction.

**Riley Matsuda (VP Growth & GTM):** The free-to-paid conversion funnel is the whole game. I need enough people hitting the Module 6 gate to get statistically meaningful signal on conversion intent. That means at least 60 people should complete the free path scenario end-to-end. Also: price sensitivity matters — include people at different income levels and company sizes.

**Marcus Obi (Founder/CEO Advisor):** Two things. First: include 5-6 people who would be the actual check-writer for team licenses. Their feedback on positioning is worth 10x anyone else's. Second: include 3-4 skeptics — people who think AI courses are hype. If we can convert them, we can convert anyone.

**Dr. Sanjay Mehta (AI/ML Engineer):** The agent-building content (Season 2 preview, MCP Toolkit) needs to land for non-engineers without feeling dumbed-down. Include a few people who've tried ChatGPT but never built anything with an API. That's the gap we're bridging.

**Dr. Elena Vasquez (Data Scientist):** For the UAT results to be actionable, we need clear segmentation in the pool. Every persona should map to a measurable cohort. I'm structuring this so we can run completion-rate and drop-off analysis by segment after testing. Minimum 8 people per primary segment to detect meaningful patterns.

**Chairman (Ethan Stuart):** The soul of ZTS is non-engineers who want to build real things. The pool should reflect that — heavily weighted toward people who've never shipped anything but want to. Keep the technical users as a calibration check, not the focus. And make sure the complete beginners aren't an afterthought — they're the ones who need us most.

---

## UAT Persona Allocation (100 People)

### Tier 1: Primary Audience (62 people)

#### 1. Product Managers (Mid-Level)
| Attribute | Value |
|-----------|-------|
| **Count** | 15 |
| **Technical Comfort** | 2 (has used SQL, maybe Jupyter, never shipped code) |
| **Primary Motivation** | Want to prototype AI features without waiting for engineering; tired of being the "idea person" who can't build |
| **Likely Friction Points** | Terminal setup in Module 1; may overthink architecture instead of following the guided path; impatient with "beginner" content if they consider themselves technical-adjacent |
| **Success Looks Like** | Completes Module 5 (free tier) without external help; says "I could actually use this at work"; expresses intent to purchase at the premium gate |

#### 2. Business Analysts
| Attribute | Value |
|-----------|-------|
| **Count** | 12 |
| **Technical Comfort** | 2 (Excel power user, maybe SQL, no programming) |
| **Primary Motivation** | Their company is adopting AI tools and they want to stay relevant; see AI skills as career insurance |
| **Likely Friction Points** | Vocabulary gaps (API, deployment, environment variables); may feel imposter syndrome at "shipping" language; could stall at first code-writing exercise |
| **Success Looks Like** | Builds confidence through early modules; landing page messaging resonates as "this is for me"; shares course with a colleague |

#### 3. Project Managers
| Attribute | Value |
|-----------|-------|
| **Count** | 10 |
| **Technical Comfort** | 1-2 (manages Jira, never written code) |
| **Primary Motivation** | Need to understand what their engineering teams are building with AI; want to have credible technical conversations |
| **Likely Friction Points** | Highest risk of "this isn't for me" bounce on landing page; may not see the connection between shipping a project and their PM role; time pressure — will test in 15-minute windows |
| **Success Looks Like** | Landing page immediately clicks; completes at least 3 modules; says "now I understand what my devs are talking about" |

#### 4. BI Engineers / Data Analysts
| Attribute | Value |
|-----------|-------|
| **Count** | 10 |
| **Technical Comfort** | 3 (SQL daily, maybe Python scripts, comfortable with data tools) |
| **Primary Motivation** | Want to go from "I query data" to "I build data products"; see AI-powered dashboards and tools as their next career step |
| **Likely Friction Points** | May find early modules too basic; could skip ahead and miss foundational concepts; might compare unfavorably to data-specific courses |
| **Success Looks Like** | Engages deeply with Modules 4-5; sees the agent-building preview and gets excited about Season 2; converts to paid at the gate |

#### 5. Career Transitioners (Non-Tech to Tech-Adjacent)
| Attribute | Value |
|-----------|-------|
| **Count** | 8 |
| **Technical Comfort** | 1 (literally never opened a terminal) |
| **Primary Motivation** | Career pivot — coming from marketing, operations, finance, or education; heard "learn AI" and want a structured path |
| **Likely Friction Points** | Everything in Module 1 is new; high risk of cognitive overload; may need more hand-holding than the course provides; will Google terms we assume are known |
| **Success Looks Like** | Completes Module 1 without giving up; feels a sense of accomplishment; tells someone "I'm learning to build with AI" |

#### 6. Consultants / Freelancers
| Attribute | Value |
|-----------|-------|
| **Count** | 7 |
| **Technical Comfort** | 2-3 (varied; some technical, mostly strategic) |
| **Primary Motivation** | Want to add AI implementation to their service offerings; "build it for clients" motivation rather than "build it for my company" |
| **Likely Friction Points** | Will evaluate ROI aggressively — "is this worth $49-79 of my time?"; may want more business-context framing; could find the pace too slow |
| **Success Looks Like** | Sees clear path from course content to client deliverables; purchases at the gate; asks about team/bulk pricing |

---

### Tier 2: Secondary Audience — Decision Makers & Buyers (18 people)

#### 7. L&D / Training Managers
| Attribute | Value |
|-----------|-------|
| **Count** | 6 |
| **Technical Comfort** | 1-2 (evaluating, not doing) |
| **Primary Motivation** | Evaluating AI upskilling options for their org; need to recommend a solution to leadership; comparing ZTS against Coursera, LinkedIn Learning, internal training |
| **Likely Friction Points** | Will judge on polish, completeness, and whether they can justify the purchase; need to see learning outcomes clearly articulated; may want LMS integration or completion certificates |
| **Success Looks Like** | Says "I would recommend this for my team"; asks about team pricing or enterprise licensing; completes enough of the free path to feel confident in the content quality |

#### 8. Team Leads / Engineering Managers
| Attribute | Value |
|-----------|-------|
| **Count** | 5 |
| **Technical Comfort** | 4 (technical background, now managing) |
| **Primary Motivation** | Want to upskill their non-technical team members; looking for a resource to point PMs and BAs toward |
| **Likely Friction Points** | Content may feel too basic for them personally; will evaluate whether it's right for their team, not themselves; need to see the "aha moment" happen for a non-engineer |
| **Success Looks Like** | Says "my PM should take this"; willing to expense team licenses; provides specific feedback on where their team would struggle |

#### 9. VPs / Directors (Potential Enterprise Buyers)
| Attribute | Value |
|-----------|-------|
| **Count** | 4 |
| **Technical Comfort** | 2-3 (were technical once, now strategic) |
| **Primary Motivation** | Evaluating AI readiness across their org; want their teams to be AI-literate without a 6-month bootcamp |
| **Likely Friction Points** | Will spend <5 minutes on landing page; need to understand value prop instantly; won't complete the course themselves — evaluating for others; will judge on brand credibility |
| **Success Looks Like** | Understands ZTS positioning within 30 seconds; asks "how do I buy this for 20 people?"; bookmarks for later evaluation |

#### 10. HR / People Ops
| Attribute | Value |
|-----------|-------|
| **Count** | 3 |
| **Technical Comfort** | 1 (non-technical, evaluator role) |
| **Primary Motivation** | Tasked with finding AI training resources for the company; need something that's accessible and doesn't intimidate non-technical staff |
| **Likely Friction Points** | Concerned about accessibility and inclusivity of content; will look for completion tracking and reporting; may need clearer "outcomes" language |
| **Success Looks Like** | Feels confident the course won't alienate non-technical employees; sees it as lower-risk than a bootcamp; forwards to L&D team |

---

### Tier 3: Edge Cases & Calibration (12 people)

#### 11. Data Engineers
| Attribute | Value |
|-----------|-------|
| **Count** | 4 |
| **Technical Comfort** | 5 (writes code daily, builds pipelines) |
| **Primary Motivation** | Curious about the AI tools layer above their infrastructure work; may want to build agents that leverage their data pipelines |
| **Likely Friction Points** | Will find Modules 1-5 too basic; risk of "this isn't for me" early bounce; may be dismissive of content targeted at non-engineers |
| **Success Looks Like** | Skims early modules, engages with agent-building preview; says "this would be great for the PMs on my team"; doesn't leave a negative review because they understood the target audience |

#### 12. Data Scientists
| Attribute | Value |
|-----------|-------|
| **Count** | 3 |
| **Technical Comfort** | 4-5 (Python daily, ML experience) |
| **Primary Motivation** | Want to see how AI tools are being taught to non-engineers; may be evaluating for their own teams; intellectual curiosity |
| **Likely Friction Points** | Highest risk of "this is too basic" feedback; may conflate "basic" with "bad"; could provide feedback that pushes content in a more technical direction (wrong signal) |
| **Success Looks Like** | Acknowledges the course serves its audience well; provides calibration feedback on where technical accuracy matters; recommends to non-technical colleagues |

#### 13. Skeptics / AI-Fatigued Professionals
| Attribute | Value |
|-----------|-------|
| **Count** | 5 |
| **Technical Comfort** | 1-3 (mixed) |
| **Primary Motivation** | Heard about ZTS through a friend/post; skeptical that another AI course is worth their time; may have been burned by overpromising courses before |
| **Likely Friction Points** | Will scrutinize every claim on the landing page; low tolerance for hype language; need to see tangible outcomes fast; will compare against free YouTube content |
| **Success Looks Like** | Moves from skepticism to "okay, this is actually different"; the hands-on, ship-something approach wins them over; converts or at minimum doesn't trash-talk the product |

---

### Tier 4: Demographic & Context Diversity (8 people)

#### 14. International / Non-Native English Speakers
| Attribute | Value |
|-----------|-------|
| **Count** | 4 |
| **Technical Comfort** | 2-3 (mixed) |
| **Primary Motivation** | Same as primary personas but with an additional language/cultural barrier to test against |
| **Likely Friction Points** | Jargon-heavy content without explanation; idioms in copy; assumptions about tools/platforms available in all regions; payment method availability |
| **Success Looks Like** | Content is followable without native-level English; no critical comprehension gaps; Stripe checkout works for international cards |

#### 15. Older Professionals (50+)
| Attribute | Value |
|-----------|-------|
| **Count** | 4 |
| **Technical Comfort** | 1-2 (experienced professional, less tech-comfortable) |
| **Primary Motivation** | Don't want to be left behind in the AI shift; decades of domain expertise but feel outpaced by younger colleagues using AI tools |
| **Likely Friction Points** | Smaller text on mobile; faster-paced content may need re-reading; may feel the branding/tone is "not for them" if it skews too young; patience with setup steps |
| **Success Looks Like** | Feels welcomed by the tone and design; completes Module 1 at their own pace; doesn't feel patronized or excluded |

---

## Allocation Summary

| Segment | Count | % of Pool | Tech Comfort Range |
|---------|-------|-----------|--------------------|
| Product Managers | 15 | 15% | 2 |
| Business Analysts | 12 | 12% | 2 |
| Project Managers | 10 | 10% | 1-2 |
| BI Engineers / Data Analysts | 10 | 10% | 3 |
| Career Transitioners | 8 | 8% | 1 |
| Consultants / Freelancers | 7 | 7% | 2-3 |
| L&D / Training Managers | 6 | 6% | 1-2 |
| Team Leads / Eng Managers | 5 | 5% | 4 |
| VPs / Directors | 4 | 4% | 2-3 |
| HR / People Ops | 3 | 3% | 1 |
| Data Engineers | 4 | 4% | 5 |
| Data Scientists | 3 | 3% | 4-5 |
| Skeptics / AI-Fatigued | 5 | 5% | 1-3 |
| International Users | 4 | 4% | 2-3 |
| Older Professionals (50+) | 4 | 4% | 1-2 |
| **Total** | **100** | **100%** | **1-5** |

### Distribution Check
- **Non-engineers (Tech Comfort 1-3):** 84 people (84%) — this is the soul of ZTS
- **Technical calibration (Tech Comfort 4-5):** 12 people (12%)
- **Decision makers / buyers:** 18 people (18%)
- **Complete beginners (Tech Comfort 1):** ~25 people (25%)
- **Mobile-primary testers:** 30 people (flagged across segments per Ava's requirement)

---

## UAT Test Scenarios

All 100 personas should go through each scenario. Evaluators record friction, comprehension, and behavioral signals at each stage.

---

### Scenario 1: Discovery and First Impression

**Flow:** Arrive at landing page (zerotoship.app) via link, search, or social post --> Read above the fold --> Scroll through page --> Form an opinion on "is this for me?"

**What to Evaluate:**

| Evaluation Criteria | Measurement |
|---------------------|-------------|
| **5-Second Comprehension** | After 5 seconds, can the tester articulate what ZTS is and who it's for? Record verbatim answer. |
| **Audience Fit Signal** | Does the tester self-identify as the target audience? (Y/N + why) |
| **Value Prop Clarity** | Can they explain what they'd get for free vs. paid? (Unprompted) |
| **Social Proof Impact** | Do they notice/trust the founding member pricing and any testimonials? |
| **CTA Comprehension** | Do they understand what happens when they click the primary CTA? |
| **Mobile Experience** | (For 30 mobile testers) Is the CTA thumb-reachable? Is above-the-fold content readable without zooming? |
| **Drop-Off Risk** | At what point (if any) did they consider leaving? Why? |
| **Bounce Indicators** | Hype-detector flags (skeptics especially): any language that feels like overselling? |

**Segment-Specific Evaluation:**
- **Decision makers (VPs, L&D, HR):** Can they tell within 30 seconds this is something to buy for their team?
- **Technical users (Data Eng, Data Sci):** Do they understand this isn't for them but could recommend it?
- **Career transitioners:** Does the page make them feel this is achievable, not intimidating?
- **International users:** Any jargon or idioms that don't translate?

**Success Threshold:** 80%+ of primary audience (Tier 1) should correctly identify the target audience and value prop within 30 seconds.

---

### Scenario 2: Free Path — Sign Up Through Premium Gate

**Flow:** Create account --> Land on dashboard --> Start Module 1 --> Progress through Modules 1-5 --> Hit the premium gate at Module 6

**What to Evaluate:**

| Evaluation Criteria | Measurement |
|---------------------|-------------|
| **Signup Friction** | Time from CTA click to account created. Any confusion points? |
| **Onboarding Clarity** | After signup, does the user know exactly what to do next? |
| **Module 1 Completion Rate** | Did they finish Module 1? If not, where did they stop and why? |
| **Pacing Feedback** | Too fast, too slow, or just right? (Per segment — BAs vs. BI Engineers will differ) |
| **Vocabulary Gaps** | Any terms used without explanation that caused confusion? Record every instance. |
| **"Aha Moment" Timing** | At what point did the tester feel "I'm actually learning something useful"? Module number + specific moment. |
| **Engagement Depth** | Did they complete exercises or just read? Did they try the code examples? |
| **Module 5 Completion Rate** | How many of the 100 reach Module 5? Segment breakdown. |
| **Premium Gate Reaction** | Emotional reaction at the Module 6 gate: frustration, acceptance, excitement, abandonment? |
| **Conversion Intent at Gate** | "Would you pay to continue?" (Y/N/Maybe + price they'd pay) |
| **Gate Messaging** | Is it clear what they get by upgrading? Do they feel the free content was a fair preview? |

**Segment-Specific Evaluation:**
- **Complete beginners (Tech Comfort 1):** Can they complete Module 1 without any external help? Zero-Google target.
- **BI Engineers (Tech Comfort 3):** Do they feel Modules 1-3 are worth their time, or do they want to skip ahead?
- **Skeptics:** At what point (if ever) does skepticism convert to engagement?
- **Older professionals:** Is the pacing comfortable? Any accessibility issues?

**Success Thresholds:**
- 90%+ complete Module 1
- 70%+ reach Module 3
- 50%+ reach Module 5
- 60%+ of those who hit the gate express conversion intent (Y or Maybe)

**Critical Drop-Off Points to Monitor:**
1. Signup form (any field causing confusion)
2. First terminal/code interaction
3. Transition between "reading" and "doing"
4. Any module that takes >20 minutes without a checkpoint
5. The premium gate itself

---

### Scenario 3: Purchase Path — Gate to Checkout to Learning

**Flow:** Hit premium gate at Module 6 --> View pricing/upgrade options --> Click purchase --> Stripe checkout --> Payment confirmation --> Welcome/thank-you page --> Access Module 6+ --> Continue learning

**What to Evaluate:**

| Evaluation Criteria | Measurement |
|---------------------|-------------|
| **Gate-to-Pricing Navigation** | Is the path from the gate to the pricing page obvious? Any dead ends? |
| **Pricing Comprehension** | Do they understand what $79 gets them? What about the $49 founding member price? |
| **Founding Member Urgency** | Does the "first 100" framing create urgency or skepticism? |
| **Pricing Comparison** | What do they mentally compare this price to? (Ask: "Does this feel expensive, fair, or cheap compared to ___?") |
| **Checkout Friction** | Time from "I want to buy" to payment complete. Any points of hesitation? |
| **Coupon Auto-Apply** | Does the FOUNDING coupon apply correctly? Is the discount visible and understood? |
| **Payment Confirmation Clarity** | After paying, do they know exactly what they now have access to? |
| **Post-Purchase Onboarding** | Do they immediately know how to continue learning? Is Module 6 clearly unlocked? |
| **Buyer's Remorse Window** | Within 5 minutes of purchase, do they feel good about the decision? |
| **International Payment** | (For international testers) Does Stripe work with their card/currency? Any localization issues? |

**Segment-Specific Evaluation:**
- **Consultants/Freelancers:** Do they see ROI clearly enough to justify the expense?
- **L&D Managers:** Do they see a path to buying for their team? Is team pricing visible or mentioned?
- **Decision makers:** Is there enough information to justify an expense report?
- **Career transitioners:** Is $49-79 an emotional barrier given their career uncertainty?

**Success Thresholds:**
- 90%+ of those who click "upgrade" can find the pricing page within 1 click
- 95%+ checkout completion rate (once they enter Stripe)
- 100% post-purchase clarity on what they now have access to
- 80%+ positive sentiment within 5 minutes of purchase

**Conversion Funnel to Track:**
```
Gate impression (100%)
  --> Click upgrade CTA (?%)
    --> View pricing page (?%)
      --> Click purchase (?%)
        --> Enter Stripe checkout (?%)
          --> Complete payment (?%)
            --> Start Module 6 within 24h (?%)
```

---

### Scenario 4: Resource Discovery — Ecosystem Exploration

**Flow:** From any page --> Discover free guides --> Find the MCP Toolkit --> Explore agent templates --> Understand the full ZTS ecosystem --> Navigate back to course content

**What to Evaluate:**

| Evaluation Criteria | Measurement |
|---------------------|-------------|
| **Discoverability** | Can they find the guides/resources without being told they exist? How? (Nav, footer, in-content links, search?) |
| **Guide Quality Perception** | After reading a free guide (e.g., "Claude Code for Non-Engineers"), do they rate the content quality as high? |
| **MCP Toolkit Comprehension** | Do non-engineers understand what the MCP Toolkit is and why they'd want it? |
| **Agent Templates Understanding** | Can they explain what an agent template is after viewing the page? |
| **Ecosystem Mental Model** | After exploring, can they draw the relationship: Free content --> Course --> Agents --> Community? |
| **Cross-Navigation** | Can they get from guides back to the course? From agents to pricing? No dead ends? |
| **Content-to-Course Funnel** | Does exploring free resources increase or decrease purchase intent? (Measure before/after) |
| **Season 2 Anticipation** | After seeing agent-building content, are they excited about what's coming? |
| **Information Architecture** | Is the site navigation intuitive? Do they get lost? Can they always find their way back? |

**Segment-Specific Evaluation:**
- **BI Engineers / Data Analysts:** Do the agent templates spark ideas for their own data workflows?
- **Technical users:** Is the MCP Toolkit content accurate enough that they'd trust it?
- **Complete beginners:** Is the resources section overwhelming or empowering?
- **L&D Managers:** Do they see the ecosystem as a comprehensive training platform, not just a single course?

**Success Thresholds:**
- 70%+ can find at least one free resource without prompting
- 80%+ rate free guide quality as "good" or "excellent"
- 60%+ of non-engineers can explain MCP Toolkit in their own words
- 50%+ say exploring resources increased their purchase intent

---

## UAT Logistics & Methodology

### Testing Format
- **Unmoderated remote testing** for Scenarios 1-2 (scale)
- **Moderated sessions** for Scenarios 3-4 (depth of insight, smaller sample)
- Each tester completes a post-scenario survey with Likert scales + open text
- Record screen sessions for at least 20 testers across segments (consent required)

### Cohort Scheduling
| Wave | Dates | Testers | Scenarios | Purpose |
|------|-------|---------|-----------|---------|
| Wave 1 | Mar 31 - Apr 2 | 25 (primary personas) | 1-2 | Catch critical issues early |
| Wave 2 | Apr 2 - Apr 4 | 50 (full mix) | 1-4 | Full scenario coverage |
| Wave 3 | Apr 4 - Apr 6 | 25 (edge cases + buyers) | 1-4 | Stress test edge cases |
| Fix Window | Apr 6 - Apr 7 | — | — | Address critical findings |
| Soft Launch | Apr 8 | — | — | Go live |

### Data Collection
- **Quantitative:** Completion rates, time-on-task, conversion funnels, NPS per segment
- **Qualitative:** Verbatim quotes at friction points, emotional reactions at gate, "would you recommend" reasoning
- **Segmented Analysis:** All metrics broken down by persona segment (Dr. Vasquez's requirement: minimum 8 per primary segment for statistical relevance)

### Exit Criteria for Launch
The following must be true to proceed with April 8 soft launch:

1. **No Scenario 1 failures:** 80%+ of Tier 1 testers pass the 5-second comprehension test
2. **No Module 1 blockers:** 90%+ of complete beginners finish Module 1 without external help
3. **Conversion signal present:** 50%+ of gate-reaching testers express willingness to pay
4. **No checkout blockers:** 95%+ Stripe checkout completion rate
5. **No navigation dead ends:** Zero testers get permanently lost in any scenario
6. **Mobile parity:** No critical UX issues on mobile for any scenario

If any exit criterion fails, the Council recommends a targeted fix window and re-test of the affected scenario before launch.

---

*Document authored by the full ZTS Council. For questions on methodology, contact Dr. Elena Vasquez. For persona refinement, contact Dr. Maren Cole. For funnel metrics, contact Riley Matsuda.*
