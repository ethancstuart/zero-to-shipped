import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink, GitFork } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailGate } from "@/components/guides/email-gate";
import { siteConfig } from "@/lib/constants";
import { REPO_URL } from "@/data/agent-templates";

export const metadata: Metadata = {
  title: "The Agent Builder Guide — AI Agents for Non-Engineers",
  description:
    "Learn what AI agents are, why they matter for PMs and non-engineers, and how to build your first one. A practical guide with 4 free templates.",
  openGraph: {
    title: "The Agent Builder Guide — AI Agents for Non-Engineers",
    description:
      "What AI agents are, why they matter, and how to build your first one.",
    url: `${siteConfig.url}/guides/agent-builder`,
    images: [
      {
        url: `/api/og?template=guide&title=${encodeURIComponent("The Agent Builder Guide")}&subtitle=${encodeURIComponent("AI Agents for Non-Engineers — Zero to Ship")}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function AgentBuilderGuidePage() {
  return (
    <div className="py-20">
      <article className="prose prose-lg mx-auto max-w-3xl px-4 dark:prose-invert">
        <h1>The Agent Builder Guide — AI Agents for Non-Engineers</h1>
        <p className="lead">
          You&apos;ve used ChatGPT. You&apos;ve tried Claude. Maybe you&apos;ve
          even built something with Claude Code. But there&apos;s a level beyond
          chatting with AI — building agents that work for you while you sleep.
          This guide shows you what agents are, why they matter, and how to
          build your first one today.
        </p>

        {/* ===== PART 1: CONCEPTUAL INTRO (visible to everyone) ===== */}

        <h2>What is an AI Agent?</h2>
        <p>
          An AI agent is a program that takes action on your behalf. Not just
          answering questions — actually doing things. Checking your metrics.
          Scanning the news. Reviewing code. Sending you a summary.
        </p>
        <p>
          The difference between a prompt and an agent is the difference between
          asking someone a question and hiring someone to do a job. A prompt
          gives you one answer. An agent gives you an ongoing process.
        </p>
        <p>Here&apos;s a concrete example:</p>
        <ul>
          <li>
            <strong>Prompt:</strong> &ldquo;Summarize today&apos;s AI news.&rdquo;
            → You get one summary. Tomorrow you ask again.
          </li>
          <li>
            <strong>Agent:</strong> Every morning at 7am, scan 5 RSS feeds,
            extract the top stories, generate a digest, and email it to you.
            → You get a summary every day without asking.
          </li>
        </ul>
        <p>
          That&apos;s the shift. Agents are AI that runs without you prompting
          it. They have triggers (a schedule, a webhook, a threshold), they have
          access to tools (APIs, databases, email), and they have a defined
          output (an email, a Slack message, a review comment).
        </p>

        <h2>Why Non-Engineers Should Care Right Now</h2>
        <p>
          If you&apos;re a PM, analyst, project manager, or anyone who works
          with data and decisions, agents are about to change your workflow more
          than any other AI tool.
        </p>
        <p>Here&apos;s why:</p>
        <ol>
          <li>
            <strong>Agents eliminate repetitive knowledge work.</strong> Checking
            dashboards, compiling reports, monitoring metrics, reviewing
            documents — these are tasks that eat hours every week. An agent does
            them in seconds, on schedule, without forgetting.
          </li>
          <li>
            <strong>Agents let you think in systems.</strong> Instead of
            reacting to information as it arrives, you define the system once:
            what to monitor, what matters, and what action to take. Then the
            agent runs the system while you focus on decisions.
          </li>
          <li>
            <strong>The barrier to building agents just disappeared.</strong>{" "}
            Six months ago, building an agent required deep programming
            knowledge. Today, with Claude Code and TypeScript templates, you
            can fork a working agent and have it running in 30 minutes.
          </li>
        </ol>

        <h2>The Anatomy of an Agent</h2>
        <p>Every agent has four parts:</p>
        <ol>
          <li>
            <strong>Trigger</strong> — what starts the agent. A cron schedule
            (&ldquo;every morning at 7am&rdquo;), a webhook (&ldquo;when a PR
            is opened&rdquo;), or a threshold (&ldquo;when revenue drops 10%&rdquo;).
          </li>
          <li>
            <strong>Context</strong> — what the agent knows. RSS feeds, database
            queries, API responses, file contents. The agent gathers this
            information before making decisions.
          </li>
          <li>
            <strong>Intelligence</strong> — the AI model that processes the
            context. This is where Claude (or any LLM) analyzes, summarizes,
            evaluates, or decides.
          </li>
          <li>
            <strong>Action</strong> — what the agent does with its output. Send
            an email, post a Slack message, write a GitHub comment, update a
            database, trigger another agent.
          </li>
        </ol>
        <p>
          That&apos;s it. Trigger → Context → Intelligence → Action. Every agent
          you&apos;ll ever build follows this pattern.
        </p>

        {/* ===== EMAIL GATE ===== */}
        <EmailGate>
          {/* ===== PART 2: THE 4 TEMPLATES (email-gated) ===== */}

          <h2>The 4 Templates — What Each One Does</h2>
          <p>
            We&apos;ve built 4 free, open-source agent templates that you can
            fork and customize. Each one is a real, production-quality TypeScript
            project — not a toy demo.
          </p>

          <h3>1. Daily AI News Digest</h3>
          <p>
            <strong>Difficulty:</strong> Beginner
            <br />
            <strong>What it does:</strong> Scans RSS feeds every morning,
            summarizes the top AI stories, and emails you a clean digest.
            <br />
            <strong>Who it&apos;s for:</strong> PMs who need to brief
            stakeholders on AI trends without spending an hour reading.
            <br />
            <strong>How it works:</strong>
          </p>
          <ol>
            <li>
              <strong>Trigger:</strong> Cron schedule (daily at 7am)
            </li>
            <li>
              <strong>Context:</strong> Fetches 5-10 RSS feeds (TechCrunch AI,
              The Verge, Anthropic blog, etc.)
            </li>
            <li>
              <strong>Intelligence:</strong> Claude analyzes all articles,
              ranks by relevance, generates 2-3 sentence summaries for the top
              5-8 stories
            </li>
            <li>
              <strong>Action:</strong> Sends a formatted HTML email via Resend
            </li>
          </ol>
          <p>
            Fork it, swap the RSS feeds for your industry, adjust the summary
            length, and you have a personalized news agent running in under 30
            minutes.
          </p>

          <h3>2. Council Advisory Agent</h3>
          <p>
            <strong>Difficulty:</strong> Intermediate
            <br />
            <strong>What it does:</strong> Takes a proposal or decision and
            runs it through a board of AI advisors — each with a different
            expertise and perspective. Delivers a structured review with
            tensions, agreements, and a unified verdict.
            <br />
            <strong>Who it&apos;s for:</strong> Founders, PMs, or anyone making
            strategic decisions who wants multiple perspectives before
            committing.
            <br />
            <strong>How it works:</strong>
          </p>
          <ol>
            <li>
              <strong>Trigger:</strong> On-demand (you submit a proposal)
            </li>
            <li>
              <strong>Context:</strong> Your proposal text + persona definitions
              (e.g., &ldquo;Technical Reviewer,&rdquo; &ldquo;Business
              Strategist,&rdquo; &ldquo;User Advocate&rdquo;)
            </li>
            <li>
              <strong>Intelligence:</strong> Claude role-plays each persona
              sequentially, then synthesizes a cross-persona discussion and
              final verdict
            </li>
            <li>
              <strong>Action:</strong> Outputs a structured markdown document
              with domain reviews, tensions, and recommendations
            </li>
          </ol>
          <p>
            This template is based on a real advisory board system used to make
            every strategic decision for Zero to Ship. The personas in the
            template are generic examples — customize them to match your domain.
          </p>

          <h3>3. Data Monitor Agent</h3>
          <p>
            <strong>Difficulty:</strong> Intermediate
            <br />
            <strong>What it does:</strong> Watches metrics you care about —
            API response times, database row counts, Stripe revenue, social
            followers — and alerts you when thresholds are crossed.
            <br />
            <strong>Who it&apos;s for:</strong> Anyone who checks dashboards
            manually and wants to be notified only when something actually
            needs attention.
            <br />
            <strong>How it works:</strong>
          </p>
          <ol>
            <li>
              <strong>Trigger:</strong> Cron schedule (configurable interval,
              minimum 1 minute)
            </li>
            <li>
              <strong>Context:</strong> Queries configured data sources (APIs,
              databases, Stripe)
            </li>
            <li>
              <strong>Intelligence:</strong> Claude compares current values to
              thresholds, generates context on why a metric changed
            </li>
            <li>
              <strong>Action:</strong> Sends an alert email with the anomaly
              and AI-generated explanation
            </li>
          </ol>
          <p>
            The template includes a minimum polling interval safeguard — it
            won&apos;t let you accidentally run it every 5 seconds and burn
            your API quota.
          </p>

          <h3>4. PR Review Agent</h3>
          <p>
            <strong>Difficulty:</strong> Advanced
            <br />
            <strong>What it does:</strong> Reviews GitHub pull requests
            automatically — checking for security issues, code quality,
            missing tests, and unclear naming. Posts a structured review
            comment directly on the PR.
            <br />
            <strong>Who it&apos;s for:</strong> Solo builders and small teams
            without dedicated code reviewers.
            <br />
            <strong>How it works:</strong>
          </p>
          <ol>
            <li>
              <strong>Trigger:</strong> GitHub webhook (fires when a PR is
              opened or updated)
            </li>
            <li>
              <strong>Context:</strong> PR diff, file changes, commit messages
              via GitHub API
            </li>
            <li>
              <strong>Intelligence:</strong> Claude analyzes the diff for
              security vulnerabilities, quality issues, missing tests, and
              naming conventions
            </li>
            <li>
              <strong>Action:</strong> Posts a structured review comment on the
              PR via GitHub API
            </li>
          </ol>

          {/* ===== PART 3: GETTING STARTED ===== */}

          <h2>Getting Started — Fork to Running Agent</h2>
          <p>
            Every template follows the same setup pattern. Here&apos;s how to
            go from zero to running agent:
          </p>

          <h3>Prerequisites</h3>
          <ul>
            <li>
              Node.js 18+ installed (<code>node --version</code> to check)
            </li>
            <li>
              An Anthropic API key (sign up at{" "}
              <a href="https://console.anthropic.com">console.anthropic.com</a>)
            </li>
            <li>
              A Resend API key for email-sending templates (free tier works)
            </li>
          </ul>

          <h3>Step 1: Fork and Clone</h3>
          <pre>
            <code>{`# Fork the repo on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/zts-agent-templates.git
cd zts-agent-templates/templates/daily-ai-news-digest`}</code>
          </pre>

          <h3>Step 2: Install Dependencies</h3>
          <pre>
            <code>{`npm install`}</code>
          </pre>

          <h3>Step 3: Configure Environment</h3>
          <pre>
            <code>{`# Copy the example env file
cp .env.example .env

# Edit .env with your API keys
# ANTHROPIC_API_KEY=sk-ant-...
# RESEND_API_KEY=re_...
# (see each template's README for required variables)`}</code>
          </pre>

          <h3>Step 4: Run</h3>
          <pre>
            <code>{`npm start`}</code>
          </pre>
          <p>
            That&apos;s it. The agent runs once. To schedule it, deploy to
            Vercel with a cron trigger, or use a local cron job:
          </p>
          <pre>
            <code>{`# Run every morning at 7am (add to crontab -e)
0 7 * * * cd /path/to/template && npm start`}</code>
          </pre>

          <h3>Understanding DATA_FLOW.md</h3>
          <p>
            Every template includes a <code>DATA_FLOW.md</code> file that
            explains exactly what data goes where:
          </p>
          <pre>
            <code>{`Your RSS feeds → Template fetches articles
Articles → Sent to Anthropic API for summarization
Summary → Sent to Resend API for email delivery
Email → Delivered to your inbox`}</code>
          </pre>
          <p>
            Read this file before running any template. Know what data leaves
            your machine and where it goes.
          </p>

          {/* ===== PART 4: RESPONSIBLE USE ===== */}

          <h2>Responsible Use — What Every Agent Builder Should Know</h2>

          <h3>Protect Your API Keys</h3>
          <p>
            Every template uses <code>.env</code> files for secrets. The{" "}
            <code>.gitignore</code> excludes them from version control. But
            mistakes happen — especially if you&apos;re new to git.
          </p>
          <ul>
            <li>
              <strong>Never commit your <code>.env</code> file.</strong> If you
              see it in <code>git status</code>, something is wrong.
            </li>
            <li>
              <strong>If you accidentally push an API key,</strong> rotate it
              immediately. Go to the provider&apos;s dashboard and generate a
              new one. The old one should be considered compromised.
            </li>
            <li>
              <strong>Use minimal permissions.</strong> If an API key only needs
              read access, don&apos;t give it write access.
            </li>
          </ul>

          <h3>Understand Your Data Flow</h3>
          <p>
            When your agent calls the Anthropic API, the full prompt — including
            any data you&apos;ve gathered — is sent to Anthropic&apos;s servers
            for processing. Be mindful of what business information you include
            in proposals, especially with the Council Agent. Don&apos;t paste
            confidential company data into an agent that sends it to an external
            API.
          </p>

          <h3>Respect Rate Limits</h3>
          <p>
            Every API has limits on how often you can call it. The templates
            include safeguards (like minimum polling intervals on the Data
            Monitor), but if you customize the schedules, be thoughtful:
          </p>
          <ul>
            <li>
              A cron running every minute burns 1,440 API calls per day
            </li>
            <li>
              Most free tiers have daily or monthly limits — check your
              provider&apos;s pricing page
            </li>
            <li>
              When in doubt, start with a daily schedule and increase frequency
              only if needed
            </li>
          </ul>

          <h3>Test Locally First</h3>
          <p>
            Run <code>npm start</code> locally before deploying to a cron.
            Check the output. Make sure the email looks right, the data is
            accurate, and the agent doesn&apos;t error out. Then schedule it.
          </p>
        </EmailGate>

        {/* CTA */}
        <div className="not-prose mt-12 rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="mb-2 text-xl font-bold">
            Ready to build your first agent?
          </h2>
          <p className="mb-6 text-muted-foreground">
            Fork a template, customize it, and have a working agent in under an
            hour.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              render={
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              size="lg"
            >
              <GitFork className="mr-2 size-4" />
              Fork the Templates
              <ExternalLink className="ml-2 size-3.5" />
            </Button>
            <Button
              render={<Link href="/agents" />}
              variant="outline"
              size="lg"
            >
              Browse All Templates
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
}
