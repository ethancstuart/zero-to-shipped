import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "SQL for Product Managers and Business Analysts — Zero to Ship",
  description:
    "The 4 SQL queries that cover 90% of what PMs and BAs actually need — retention, feature usage, cohort analysis, and funnel drop-off. No engineering background required.",
  openGraph: {
    title: "SQL for Product Managers and Business Analysts",
    description:
      "Stop waiting on the data team. These 4 queries cover 90% of what PMs and BAs actually need — written in plain English first, SQL second.",
    url: `${siteConfig.url}/guides/sql-for-product-managers`,
    images: [
      {
        url: `/api/og?template=guide&title=${encodeURIComponent("SQL for Product Managers")}&subtitle=${encodeURIComponent("4 Queries That Cover 90% of PM Work — Zero to Ship")}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

const queries = [
  {
    number: 1,
    title: "Who is using this feature?",
    useCase: "Feature adoption · Usage segmentation · Rollout tracking",
    businessQuestion:
      "You shipped a feature 3 weeks ago. Leadership asks: 'Who's using it?' You need a count by cohort (new vs. returning users, plan tier, signup date) — not a screenshot from Amplitude.",
    sql: `SELECT
  u.plan_tier,
  COUNT(DISTINCT e.user_id)      AS users_who_used_feature,
  COUNT(e.id)                    AS total_events,
  MIN(e.created_at)::date        AS first_used,
  MAX(e.created_at)::date        AS last_used
FROM events e
JOIN users u ON u.id = e.user_id
WHERE e.event_name = 'feature_x_clicked'
  AND e.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.plan_tier
ORDER BY users_who_used_feature DESC;`,
    plain: `"Give me a count of users who triggered 'feature_x_clicked' in the last 30 days, grouped by plan tier. Include total event count and first/last use dates."`,
    whatYouLearn:
      "SELECT, FROM, JOIN, WHERE, GROUP BY, COUNT(DISTINCT). These 6 keywords appear in almost every PM query you'll ever write.",
  },
  {
    number: 2,
    title: "Where are users dropping off?",
    useCase: "Funnel analysis · Onboarding drop-off · Checkout abandonment",
    businessQuestion:
      "You have a 5-step onboarding flow. 2,400 users start it. 310 finish. Where exactly are they leaving — and is it getting better or worse over time?",
    sql: `WITH funnel AS (
  SELECT
    user_id,
    MAX(CASE WHEN event_name = 'onboarding_step_1' THEN 1 ELSE 0 END) AS step_1,
    MAX(CASE WHEN event_name = 'onboarding_step_2' THEN 1 ELSE 0 END) AS step_2,
    MAX(CASE WHEN event_name = 'onboarding_step_3' THEN 1 ELSE 0 END) AS step_3,
    MAX(CASE WHEN event_name = 'onboarding_step_4' THEN 1 ELSE 0 END) AS step_4,
    MAX(CASE WHEN event_name = 'onboarding_completed' THEN 1 ELSE 0 END) AS completed
  FROM events
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY user_id
)
SELECT
  SUM(step_1)     AS entered_step_1,
  SUM(step_2)     AS reached_step_2,
  SUM(step_3)     AS reached_step_3,
  SUM(step_4)     AS reached_step_4,
  SUM(completed)  AS completed_onboarding,
  ROUND(SUM(completed)::numeric / NULLIF(SUM(step_1), 0) * 100, 1) AS completion_rate_pct
FROM funnel;`,
    plain: `"Show me how many users hit each step of onboarding in the last 30 days. Use conditional aggregation so each step is a column. Include the completion rate."`,
    whatYouLearn:
      "CTEs (WITH), CASE WHEN, conditional aggregation, NULLIF to avoid divide-by-zero. These are the patterns that turn raw events into funnel charts.",
  },
  {
    number: 3,
    title: "Are users coming back?",
    useCase: "Retention analysis · Cohort tables · Churn prediction",
    businessQuestion:
      "Your sign-up numbers look healthy. But are those users still around in week 2? Week 4? A retention cohort shows the real picture — and it's almost always harder to hear than the signup chart.",
    sql: `WITH cohorts AS (
  SELECT
    user_id,
    DATE_TRUNC('week', MIN(created_at)) AS cohort_week
  FROM events
  WHERE event_name = 'account_created'
  GROUP BY user_id
),
activity AS (
  SELECT
    e.user_id,
    DATE_TRUNC('week', e.created_at) AS activity_week
  FROM events e
  WHERE e.event_name = 'session_start'
  GROUP BY e.user_id, DATE_TRUNC('week', e.created_at)
)
SELECT
  c.cohort_week,
  COUNT(DISTINCT c.user_id)                                      AS cohort_size,
  COUNT(DISTINCT CASE WHEN a.activity_week = c.cohort_week + INTERVAL '1 week'
                      THEN a.user_id END)                        AS week_1_retained,
  COUNT(DISTINCT CASE WHEN a.activity_week = c.cohort_week + INTERVAL '4 weeks'
                      THEN a.user_id END)                        AS week_4_retained
FROM cohorts c
LEFT JOIN activity a ON a.user_id = c.user_id
WHERE c.cohort_week >= NOW() - INTERVAL '12 weeks'
GROUP BY c.cohort_week
ORDER BY c.cohort_week;`,
    plain: `"Build a weekly cohort retention table. For each signup cohort, show how many users came back in week 1 and week 4. Last 12 weeks only."`,
    whatYouLearn:
      "DATE_TRUNC for time-based grouping, LEFT JOIN to include users with no activity, cohort analysis pattern. This query is the foundation of every retention deck you'll ever build.",
  },
  {
    number: 4,
    title: "What's driving revenue?",
    useCase: "Revenue attribution · Plan upgrades · Expansion MRR",
    businessQuestion:
      "Finance wants to know which features correlate with upgrades. You want to know if the users who hit your key activation event are 3x more likely to pay — and you want to show the data, not guess.",
    sql: `SELECT
  CASE
    WHEN activated.user_id IS NOT NULL THEN 'Activated'
    ELSE 'Not Activated'
  END                                        AS activation_status,
  COUNT(DISTINCT u.id)                       AS users,
  COUNT(DISTINCT CASE WHEN u.plan_tier = 'paid'
                      THEN u.id END)         AS paid_users,
  ROUND(
    COUNT(DISTINCT CASE WHEN u.plan_tier = 'paid' THEN u.id END)::numeric
    / NULLIF(COUNT(DISTINCT u.id), 0) * 100, 1
  )                                          AS conversion_rate_pct,
  ROUND(AVG(u.lifetime_value_cents) / 100.0, 2) AS avg_ltv_usd
FROM users u
LEFT JOIN (
  SELECT DISTINCT user_id
  FROM events
  WHERE event_name = 'key_activation_event'
    AND created_at >= NOW() - INTERVAL '90 days'
) activated ON activated.user_id = u.id
WHERE u.created_at >= NOW() - INTERVAL '90 days'
GROUP BY activation_status;`,
    plain: `"Compare conversion rate and average LTV between users who hit the key activation event vs. those who didn't. Last 90 days, new users only."`,
    whatYouLearn:
      "LEFT JOIN with a subquery, CASE WHEN for segmentation, AVG with arithmetic for unit conversion. This is the activation → revenue correlation every growth PM needs.",
  },
];

const aiWorkflow = [
  {
    step: "1. Write the question in plain English",
    detail:
      'Start here: "I want to know which plan tier has the highest feature adoption rate in the last 30 days." This is your spec. Don\'t touch SQL yet.',
  },
  {
    step: "2. Describe your schema to Claude",
    detail:
      'Paste your table definitions. "I have a `users` table (id, plan_tier, created_at) and an `events` table (id, user_id, event_name, created_at). Write a query for my question above."',
  },
  {
    step: "3. Ask Claude to explain before you run",
    detail:
      '"Before I run this, explain what each clause does in plain English. I want to understand it, not just copy it." This catches errors and teaches you the pattern.',
  },
  {
    step: "4. Run it against a date-limited sample first",
    detail:
      "Add `LIMIT 100` and a tight date range before running against your full table. A runaway query on 10M rows can lock your database.",
  },
  {
    step: "5. Verify one number by hand",
    detail:
      "Pick one row in the result. Count the raw events manually (or spot-check against a known source). One verified data point is worth 10 unverified ones.",
  },
];

export default function SqlForProductManagersPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4">
        <Link
          href="/guides"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Guides
        </Link>

        {/* Hero */}
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              Data
            </span>
            <span className="text-xs text-muted-foreground">25 min</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            SQL for Product Managers and Business Analysts
          </h1>
          <p className="text-lg text-muted-foreground">
            The 4 queries that cover 90% of what PMs and BAs actually need — feature
            adoption, funnel drop-off, retention cohorts, and revenue attribution. Written
            in plain English first. SQL second. With AI doing the heavy lifting.
          </p>
        </div>

        {/* Why this matters */}
        <div className="mb-10 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-base font-bold">
            Why PMs and BAs should learn SQL (and what to skip)
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            You don&apos;t need to become a data engineer. You need to answer your own
            questions without opening a ticket. That&apos;s a different bar — and a much
            lower one.
          </p>
          <p className="mb-3 text-sm text-muted-foreground">
            The goal is not to write perfect SQL. The goal is to write{" "}
            <em>correct enough</em> SQL to validate a hypothesis, answer a leadership
            question, or build the context you need before handing off to engineering.
            Claude writes the first draft. You read it, verify one number by hand, and
            move on.
          </p>
          <p className="text-sm text-muted-foreground">
            What you need to learn: SELECT, WHERE, GROUP BY, JOIN, aggregate functions,
            and CTEs. That&apos;s it. Everything else you ask Claude. The 4 queries below
            demonstrate all of these in realistic PM/BA contexts.
          </p>
        </div>

        {/* How to read your database schema */}
        <div className="mb-10 rounded-xl border border-border bg-muted/30 p-5">
          <h2 className="mb-2 font-semibold">
            Before you write queries: read your schema
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            SQL works on your actual table names and column names — not generic ones. Before
            writing any query, run this in your database dashboard (Supabase, Metabase,
            DBeaver, etc.):
          </p>
          <div className="rounded-lg bg-muted px-4 py-3 font-mono text-xs">
            {`-- PostgreSQL / Supabase
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;`}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Paste the output into Claude: <em>&ldquo;Here is my schema. Now write me a query
            that [your question].&rdquo;</em> This one habit will make every query 10x more
            accurate.
          </p>
        </div>

        {/* The 4 queries */}
        <h2 className="mb-6 text-xl font-bold">The 4 queries</h2>
        <div className="flex flex-col gap-8 mb-14">
          {queries.map((q) => (
            <div
              key={q.number}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start gap-3 border-b border-border bg-muted/30 px-5 py-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {q.number}
                </span>
                <div>
                  <h3 className="font-bold leading-tight">{q.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {q.useCase}
                  </p>
                </div>
              </div>

              <div className="p-5">
                {/* Business question */}
                <div className="mb-5 rounded-lg border-l-2 border-primary/40 bg-primary/5 py-2 pl-4 pr-3">
                  <p className="text-xs font-semibold text-foreground mb-1">
                    The situation
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {q.businessQuestion}
                  </p>
                </div>

                {/* Plain English version */}
                <div className="mb-4">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Plain English (give this to Claude first)
                  </p>
                  <div className="rounded-lg bg-muted px-4 py-3 text-xs text-foreground italic">
                    {q.plain}
                  </div>
                </div>

                {/* SQL */}
                <div className="mb-4">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    SQL
                  </p>
                  <div className="overflow-x-auto rounded-lg bg-slate-950 px-4 py-3">
                    <pre className="font-mono text-xs leading-relaxed text-slate-100 whitespace-pre">
                      {q.sql}
                    </pre>
                  </div>
                </div>

                {/* What you learn */}
                <div className="rounded-lg bg-primary/5 px-4 py-3">
                  <p className="text-xs font-semibold text-primary mb-1">
                    What this teaches you
                  </p>
                  <p className="text-xs text-muted-foreground">{q.whatYouLearn}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI workflow */}
        <div className="mb-12">
          <h2 className="mb-1 text-xl font-bold">
            The 5-step workflow for writing SQL with AI
          </h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Don&apos;t start with the SQL. Start with the question. This workflow works for
            every query you&apos;ll ever write.
          </p>
          <div className="flex flex-col gap-3">
            {aiWorkflow.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <div>
                  <p className="mb-1 text-sm font-semibold">{item.step.replace(`${i + 1}. `, "")}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Common mistakes */}
        <div className="mb-12 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-base font-bold">3 mistakes that waste hours</h2>
          <div className="flex flex-col gap-4 text-sm">
            <div>
              <p className="font-semibold">Querying without a LIMIT</p>
              <p className="mt-0.5 text-muted-foreground">
                Always add <code className="rounded bg-muted px-1 py-0.5 text-xs">LIMIT 100</code> when
                exploring. A full table scan on 50M rows will time out, burn compute credits, and
                frustrate your data team. Add the LIMIT first, verify the shape of the data, then
                remove it for the real run.
              </p>
            </div>
            <div>
              <p className="font-semibold">Using SELECT * in production queries</p>
              <p className="mt-0.5 text-muted-foreground">
                <code className="rounded bg-muted px-1 py-0.5 text-xs">SELECT *</code> pulls
                every column — including blobs, PII, and columns you don&apos;t need. Name your
                columns explicitly. It&apos;s better documentation and significantly faster on
                wide tables.
              </p>
            </div>
            <div>
              <p className="font-semibold">Trusting the first number without a sanity check</p>
              <p className="mt-0.5 text-muted-foreground">
                AI-written SQL is usually correct. Usually. Before putting a number in a deck or
                a message to leadership, verify one row by hand against a source of truth (your
                BI tool, a raw export, a known data point). One verified number is worth 10
                unverified ones.
              </p>
            </div>
          </div>
        </div>

        {/* Reading schema tip */}
        <div className="mb-12 rounded-xl border border-primary/20 bg-primary/5 p-6">
          <h2 className="mb-2 text-base font-bold">
            The one skill that makes everything else faster
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Learn to read a database schema like a PM reads a PRD — not to memorize it,
            but to understand the nouns and verbs of the system. Tables are nouns (users,
            orders, events). Joins are relationships between them. Once you see the schema
            as a data model instead of a technical artifact, every question you have maps
            naturally to a query structure.
          </p>
          <p className="text-sm text-muted-foreground">
            This skill — reading schemas, understanding data models, knowing what&apos;s
            possible — is what separates PMs who wait for dashboards from PMs who build
            them. Zero to Ship Module 12 covers the full data product stack: schema design,
            query patterns, and shipping interactive data apps to real URLs.
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-xl border border-border bg-card p-7 text-center">
          <h2 className="mb-2 text-lg font-bold">
            Ready to build the full data product?
          </h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Module 12 (Data Products) takes you from SQL queries to a deployed interactive
            data app — charts, filters, drill-downs, and a live URL you can share with
            stakeholders.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/preview/module-1"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Start with Module 1 — free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#curriculum"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
            >
              View full curriculum
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
