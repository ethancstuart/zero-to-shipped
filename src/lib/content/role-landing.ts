/**
 * Role-targeted SEO landing pages.
 *
 * Four indexable pages, one per role Zero to Ship serves. URL slugs are
 * long-form for search quality. Each entry maps to a ROLE_LABELS key from
 * @/lib/constants so the rest of the app stays in sync with a single source
 * of truth.
 *
 * Copy is structured for scanability: hero → pain points → outcomes →
 * curriculum highlights → FAQ. Designed to rank for mid-intent queries like
 * "how to build an app as a product manager" without paying per-query.
 */

import type { ROLE_LABELS } from "@/lib/constants";

export type RoleLandingSlug =
  | "product-managers"
  | "project-managers"
  | "business-analysts"
  | "bi-engineers";

export interface RoleLandingConfig {
  /** URL slug — matches [slug] segment under /for/[slug] */
  slug: RoleLandingSlug;
  /** Role key into ROLE_LABELS — keeps app taxonomy in one place */
  roleKey: keyof typeof ROLE_LABELS;
  /** Human role label, singular (for H1/headings) */
  roleSingular: string;
  /** Human role label, plural (for URLs and list contexts) */
  rolePlural: string;

  /** SEO metadata */
  title: string;
  metaDescription: string;

  /** Hero */
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaLabel: string;

  /** 3 pain points this role feels that ZTS solves */
  painPoints: { title: string; body: string }[];

  /** 4-6 concrete outcomes after the course */
  outcomes: string[];

  /** 3-4 most relevant modules for this role (reinforces curriculum depth) */
  curriculumHighlights: {
    moduleNumber: number;
    title: string;
    whyItMatters: string;
  }[];

  /** 3-4 FAQ entries addressing role-specific objections */
  faq: { question: string; answer: string }[];

  /** Search queries this page is optimized to rank for (for internal tracking) */
  targetQueries: string[];
}

export const ROLE_LANDING_CONFIGS: Record<RoleLandingSlug, RoleLandingConfig> =
  {
    "product-managers": {
      slug: "product-managers",
      roleKey: "pm",
      roleSingular: "Product Manager",
      rolePlural: "Product Managers",
      title:
        "AI Coding for Product Managers — Ship Software Without an Engineer",
      metaDescription:
        "A practical course for PMs who want to build real products with AI. Learn Cursor and Claude Code, ship a capstone, and stop waiting on engineering to prototype.",
      heroHeadline: "Build it yourself. Ship it this week.",
      heroSubheadline:
        "The AI coding course built for Product Managers. 16 modules, one real capstone, zero engineering degree required — so you can prototype without a Jira ticket.",
      heroCtaLabel: "Start with 5 free modules",
      painPoints: [
        {
          title: "Your best ideas sit in a backlog",
          body: "Every PM has a graveyard of experiments that died waiting for engineering capacity. The tools changed. You can build a working prototype this afternoon.",
        },
        {
          title: "You can describe it. You can't ship it.",
          body: "You write crisp PRDs. You click through Figma. But when it comes time to put something in front of a real user, you're blocked on someone else's sprint.",
        },
        {
          title: "AI coding feels like a black box",
          body: "You've heard about Cursor and Claude Code but every tutorial assumes you're already a developer. Zero to Ship doesn't.",
        },
      ],
      outcomes: [
        "Ship a working web app — not a Figma prototype — that solves a real problem in your product",
        "Use AI coding tools (Cursor or Claude Code) daily to prototype features in hours, not sprints",
        "Read and understand what engineering ships so design review and QA become faster",
        "Build internal tools, dashboards, and experiments without opening a ticket",
        "Graduate with a portfolio capstone you can show in interviews and promo packets",
      ],
      curriculumHighlights: [
        {
          moduleNumber: 2,
          title: "Prompt Engineering & Critical Thinking",
          whyItMatters:
            "PMs already write crisp specs. This module turns that skill into AI outputs that actually work on the first try.",
        },
        {
          moduleNumber: 7,
          title: "Data & APIs",
          whyItMatters:
            "Stop asking engineers what the data looks like. Pull it yourself and build the proof-of-concept your PRD needs.",
        },
        {
          moduleNumber: 12,
          title: "Shipping to Production",
          whyItMatters:
            "Deploy a working product to a real URL, behind a real domain, with real users. No staging, no handoff.",
        },
        {
          moduleNumber: 16,
          title: "Capstone",
          whyItMatters:
            "A finished, shipped project you can point to in promo reviews, job interviews, or LinkedIn.",
        },
      ],
      faq: [
        {
          question: "I've never written a line of code. Is this for me?",
          answer:
            "Yes — that's the target audience. Modules 1–5 are free and assume zero prior experience. If you've ever written a spec or drawn a wireframe, you have what it takes.",
        },
        {
          question: "How is this different from Bubble or no-code tools?",
          answer:
            "No-code tools lock you into their platform. Zero to Ship teaches you to use real AI coding tools (Cursor, Claude Code) to build on standard web tech. Your projects are yours — hosted anywhere, editable by any engineer who joins your team later.",
        },
        {
          question: "Will this replace my engineering team?",
          answer:
            "No, and it shouldn't try to. It makes you a better partner to engineering — faster prototypes, clearer specs, and the ability to explore ideas before you open a ticket.",
        },
        {
          question: "How much time does the course take?",
          answer:
            "Most students finish the 16 modules in 4–6 weeks at 3–5 hours per week. Work at your own pace — modules are asynchronous.",
        },
      ],
      targetQueries: [
        "ai coding for product managers",
        "how product managers build software",
        "cursor for product managers",
        "claude code for pm",
        "vibe coding for product managers",
      ],
    },

    "project-managers": {
      slug: "project-managers",
      roleKey: "pjm",
      roleSingular: "Project Manager",
      rolePlural: "Project Managers",
      title:
        "AI Coding for Project Managers — Automate the Busywork, Ship the Tools",
      metaDescription:
        "A practical course for PjMs who want to build their own dashboards, status trackers, and automations with AI. 16 modules, hands-on projects, no coding background required.",
      heroHeadline: "Automate the reports. Build the dashboard. Ship the tool.",
      heroSubheadline:
        "The AI coding course built for Project Managers. Stop living in spreadsheets — build the internal tools your team actually needs, in a weekend, with AI.",
      heroCtaLabel: "Start with 5 free modules",
      painPoints: [
        {
          title: "You live in a graveyard of spreadsheets",
          body: "Status reports, risk trackers, dependency maps, RAID logs. Every tool you use ends in .xlsx and every update is manual.",
        },
        {
          title: "IT takes 6 weeks to build anything custom",
          body: "The tool you need exists. You've described it to IT four times. It's still not built. Now it doesn't need to be.",
        },
        {
          title: "You're the bottleneck for your own reporting",
          body: "Every Monday morning you spend two hours compiling status. With AI coding, that's a 100-line script you run once and forget.",
        },
      ],
      outcomes: [
        "Build a custom project dashboard that auto-syncs from Jira, Asana, or Monday",
        "Automate weekly status reports into a single script you run once",
        "Ship internal tools for your team without opening an IT ticket",
        "Prototype process changes in a working app instead of a slide deck",
        "Graduate with a portfolio capstone — a real tool your team actually uses",
      ],
      curriculumHighlights: [
        {
          moduleNumber: 6,
          title: "Working with Data",
          whyItMatters:
            "Project managers drown in data. This module turns CSVs, API exports, and database dumps into dashboards you build yourself.",
        },
        {
          moduleNumber: 9,
          title: "Automations & Workflows",
          whyItMatters:
            "Automate the weekly reporting grind. Schedule scripts, chain actions, replace repetitive meetings with a Slack bot.",
        },
        {
          moduleNumber: 12,
          title: "Shipping to Production",
          whyItMatters:
            "Deploy your tool to a real URL your whole team can use. No more 'run this on my laptop' workflows.",
        },
        {
          moduleNumber: 16,
          title: "Capstone",
          whyItMatters:
            "A finished internal tool — dashboard, tracker, or automation — that becomes part of how your team operates.",
        },
      ],
      faq: [
        {
          question: "I'm not technical. Can I really do this?",
          answer:
            "Yes. Modules 1–5 are free and assume zero coding experience. If you can write a process doc, you can describe what you want to an AI — and that's half the skill.",
        },
        {
          question: "Why not just use a no-code tool like Airtable or Notion?",
          answer:
            "Those are great for some things. But they top out fast when you need custom logic, multiple data sources, or something your team actually owns. With AI coding, you're not limited by someone else's platform.",
        },
        {
          question: "My company locks down IT. Can I even run these tools?",
          answer:
            "Most of what you'll build can run locally, be hosted on approved platforms like Vercel, or fit inside your existing toolchain. Module 12 covers deployment options for restricted environments.",
        },
        {
          question: "Will this help me during my PMP recertification or promotion cycle?",
          answer:
            "A shipped internal tool is stronger evidence of impact than any status report. Your capstone is portfolio material for performance reviews, interviews, and your PMP PDU log.",
        },
      ],
      targetQueries: [
        "ai coding for project managers",
        "project manager automation with ai",
        "build a project dashboard without coding",
        "cursor for project managers",
        "pmp ai tools",
      ],
    },

    "business-analysts": {
      slug: "business-analysts",
      roleKey: "ba",
      roleSingular: "Business Analyst",
      rolePlural: "Business Analysts",
      title:
        "AI Coding for Business Analysts — Build Your Own Analysis Tools",
      metaDescription:
        "A practical course for BAs who want to go from requirements docs to working prototypes. Learn AI coding, ship a capstone, and stop handing off your best ideas.",
      heroHeadline: "Stop handing off. Start shipping.",
      heroSubheadline:
        "The AI coding course built for Business Analysts. Turn your requirements into working prototypes, data tools, and process automations — without the engineering handoff.",
      heroCtaLabel: "Start with 5 free modules",
      painPoints: [
        {
          title: "You document the work. Someone else builds it.",
          body: "You've written 200 user stories this year. You've seen maybe a dozen shipped the way you imagined. The lost-in-translation tax is real.",
        },
        {
          title: "Your analysis lives in PowerPoint",
          body: "Every finding, every process map, every proposal — trapped in static slides. A working prototype changes every stakeholder conversation.",
        },
        {
          title: "You want to own the 'how' — not just the 'what'",
          body: "Gathering requirements is valuable. So is building the thing. BAs who do both become indispensable.",
        },
      ],
      outcomes: [
        "Turn requirements into working prototypes stakeholders can click through",
        "Build your own data analysis tools — no more begging the data team for a SQL query",
        "Automate process maps into executable workflows",
        "Validate requirements with users directly, in a working app, not a mockup",
        "Graduate with a portfolio capstone — a real tool that solves a real business problem",
      ],
      curriculumHighlights: [
        {
          moduleNumber: 3,
          title: "Thinking in Systems",
          whyItMatters:
            "BAs already think in processes and flows. This module translates that skill into code you can actually run.",
        },
        {
          moduleNumber: 7,
          title: "Data & APIs",
          whyItMatters:
            "Pull data from the systems you already analyze. Build dashboards and reports yourself instead of waiting on the data team.",
        },
        {
          moduleNumber: 11,
          title: "User Testing with Real Prototypes",
          whyItMatters:
            "Swap out clickable Figmas for working prototypes that gather real user signal — a massive upgrade for requirement validation.",
        },
        {
          moduleNumber: 16,
          title: "Capstone",
          whyItMatters:
            "A finished shipped tool — analysis dashboard, process automation, or stakeholder prototype — that proves the business value.",
        },
      ],
      faq: [
        {
          question: "I'm a BA, not a developer. Does this really apply to me?",
          answer:
            "Especially to you. BAs already think in flows, requirements, and edge cases — the exact skills that produce good AI outputs. You bring the domain knowledge; the course teaches the tools.",
        },
        {
          question: "How does this differ from getting a certification like CBAP?",
          answer:
            "Certifications prove you know the BA discipline. Zero to Ship gives you a shipped tool you can demo. Both have value — this is complementary evidence of impact.",
        },
        {
          question: "Will I be able to work with my company's existing systems?",
          answer:
            "Yes. Module 7 covers APIs and data integration — pulling from Salesforce, SQL databases, Excel exports, internal REST APIs. If your data is accessible, you can use it.",
        },
        {
          question: "What if I just want to prototype faster, not replace engineering?",
          answer:
            "That's the sweet spot. A working prototype at requirement-gathering time turns a 2-week back-and-forth into a 30-minute session. You stay in the BA lane but move 10x faster.",
        },
      ],
      targetQueries: [
        "ai coding for business analysts",
        "business analyst prototype tools",
        "ba to developer transition",
        "cursor for business analyst",
        "build prototype as ba",
      ],
    },

    "bi-engineers": {
      slug: "bi-engineers",
      roleKey: "bi",
      roleSingular: "BI Engineer",
      rolePlural: "BI Engineers",
      title:
        "AI Coding for BI Engineers — Ship Data Apps, Not Just Dashboards",
      metaDescription:
        "A practical course for BI Engineers who want to build full data apps with AI. Go beyond Tableau — ship interactive data products, not screenshots.",
      heroHeadline: "Beyond dashboards. Build data products.",
      heroSubheadline:
        "The AI coding course built for BI Engineers. You already know SQL. Now ship full interactive data apps — not just Tableau screenshots — with AI doing the front-end heavy lifting.",
      heroCtaLabel: "Start with 5 free modules",
      painPoints: [
        {
          title: "Your dashboards are screenshots in Slack",
          body: "You built something beautiful in Looker or Tableau. It lives behind an SSO wall, gets screenshotted, and loses all interactivity in the process.",
        },
        {
          title: "You know SQL. You don't know web apps.",
          body: "Every BI engineer hits the same wall: 'I wish I could wrap this query in a real interactive tool.' AI coding tools just removed that wall.",
        },
        {
          title: "Stakeholders ask for one more filter. Forever.",
          body: "You build a dashboard, they ask for a drilldown, you build that, they ask for an export. With a real app, they self-serve.",
        },
      ],
      outcomes: [
        "Ship interactive data apps with charts, filters, and drill-downs — beyond what any BI tool allows",
        "Build internal tools that combine your SQL skills with modern web UX",
        "Deploy data products to real URLs so stakeholders can self-serve instead of DMing you",
        "Integrate directly with your warehouse (Snowflake, BigQuery, Postgres) from apps you own",
        "Graduate with a portfolio capstone — a real data product stakeholders use daily",
      ],
      curriculumHighlights: [
        {
          moduleNumber: 6,
          title: "Working with Data",
          whyItMatters:
            "You already know data. This module shows how to pull from your warehouse into a live app instead of exporting to CSV.",
        },
        {
          moduleNumber: 8,
          title: "Frontend Basics for Data People",
          whyItMatters:
            "You don't need to be a React expert. You need to make your charts interactive and your filters work. That's exactly what this module delivers.",
        },
        {
          moduleNumber: 12,
          title: "Shipping to Production",
          whyItMatters:
            "Put your data app behind a URL your whole org can use, with authentication and role-based access. No more 'my local Streamlit.'",
        },
        {
          moduleNumber: 16,
          title: "Capstone",
          whyItMatters:
            "A finished, shipped data product — custom dashboard, self-serve report, or embedded analytics tool — that replaces a recurring request.",
        },
      ],
      faq: [
        {
          question: "Why not just use Streamlit or Metabase?",
          answer:
            "Those are fine for rapid prototypes. Zero to Ship teaches you to build on real web tech so your data apps can do things no Streamlit can — auth, custom UX, third-party integrations, mobile responsiveness. You own the whole stack.",
        },
        {
          question: "I already write Python and SQL. What's new here?",
          answer:
            "AI-assisted frontend work. Most BI engineers are strong on backend and data but have never shipped a user-facing app. This course closes exactly that gap, fast.",
        },
        {
          question: "Will this replace Looker or Tableau?",
          answer:
            "No — and it doesn't need to. Use BI tools for what they're good at (self-serve exploration) and ship custom apps for what they can't do (interactive tools, embedded products, custom workflows).",
        },
        {
          question: "How much of the course is beginner material I can skip?",
          answer:
            "Modules 1–3 are beginner foundations. As a BI Engineer you can scan those in an hour. The real value for you starts at module 6 and accelerates through the capstone.",
        },
      ],
      targetQueries: [
        "ai coding for bi engineers",
        "beyond tableau data apps",
        "build a data app with ai",
        "bi engineer to full stack",
        "cursor for data analysts",
      ],
    },
  };

export const ROLE_LANDING_SLUGS: RoleLandingSlug[] = Object.keys(
  ROLE_LANDING_CONFIGS
) as RoleLandingSlug[];

export function getRoleLandingConfig(
  slug: string
): RoleLandingConfig | undefined {
  if ((ROLE_LANDING_SLUGS as string[]).includes(slug)) {
    return ROLE_LANDING_CONFIGS[slug as RoleLandingSlug];
  }
  return undefined;
}
