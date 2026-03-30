import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  ExternalLink,
  GitFork,
  Mail,
  Shield,
  Sparkles,
  Users,
  BarChart3,
  GitPullRequest,
  Newspaper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AGENT_TEMPLATES,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  REPO_URL,
  type AgentTemplate,
} from "@/data/agent-templates";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "AI Agent Templates for Non-Engineers",
  description:
    "Free, open-source agent templates you can fork and customize. Build news digests, advisory boards, data monitors, and PR reviewers — no CS degree required.",
  openGraph: {
    title: "AI Agent Templates for Non-Engineers",
    description:
      "Free, open-source agent templates. Fork, customize, ship.",
    url: `${siteConfig.url}/agents`,
    images: [
      {
        url: `/api/og?template=guide&title=${encodeURIComponent("AI Agent Templates")}&subtitle=${encodeURIComponent("Fork. Customize. Ship. — Zero to Ship")}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  "daily-ai-news-digest": <Newspaper className="size-6" />,
  "council-advisory-agent": <Users className="size-6" />,
  "data-monitor-agent": <BarChart3 className="size-6" />,
  "pr-review-agent": <GitPullRequest className="size-6" />,
};

function TemplateCard({ template }: { template: AgentTemplate }) {
  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
      {/* Tier badge */}
      {template.tier === "beta" && (
        <span className="absolute right-4 top-4 rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-xs font-medium text-amber-400">
          Beta
        </span>
      )}

      {/* Icon + Name */}
      <div className="mb-3 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {TEMPLATE_ICONS[template.slug] ?? <Bot className="size-6" />}
        </div>
        <h3 className="font-mono text-lg font-bold">{template.name}</h3>
      </div>

      {/* Difficulty */}
      <span
        className={`mb-3 inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${DIFFICULTY_COLORS[template.difficulty]}`}
      >
        {DIFFICULTY_LABELS[template.difficulty]}
      </span>

      {/* Description */}
      <p className="mb-3 text-sm text-muted-foreground">
        {template.description}
      </p>

      {/* Use case */}
      <p className="mb-4 text-sm italic text-muted-foreground/80">
        {template.useCase}
      </p>

      {/* Stack pills */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {template.stack.map((tech) => (
          <span
            key={tech}
            className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Features */}
      <ul className="mb-6 space-y-1.5">
        {template.features.slice(0, 3).map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
            {feature}
          </li>
        ))}
      </ul>

      {/* Spacer + CTA */}
      <div className="mt-auto flex items-center gap-3">
        <a
          href={`${REPO_URL}/tree/main${template.repoPath}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <GitFork className="size-3.5" />
          Fork template
          <ExternalLink className="size-3" />
        </a>
        <span className="text-xs text-muted-foreground">
          {template.buildTime}
        </span>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-5xl px-4">
        {/* Hero */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Bot className="size-4" />
            Open-source agent templates
          </div>
          <h1 className="mb-4 text-3xl font-bold sm:text-5xl">
            Build AI Agents Without
            <br />
            Writing Code From Scratch
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Free templates you can fork and customize in under an hour. News
            digests, advisory boards, data monitors, and code reviewers — built
            for non-engineers who want to ship real automation.
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
              View on GitHub
              <ExternalLink className="ml-2 size-3.5" />
            </Button>
            <Button
              render={<Link href="/guides/agent-builder" />}
              variant="outline"
              size="lg"
            >
              Read the Agent Builder Guide
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>

        {/* Template Grid */}
        <section className="mb-16">
          <div className="mb-8 flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <h2 className="text-2xl font-bold">Agent Templates</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {AGENT_TEMPLATES.map((template) => (
              <TemplateCard key={template.slug} template={template} />
            ))}
          </div>
        </section>

        {/* Why Agents? */}
        <section className="mb-16 rounded-xl border border-border bg-card p-8">
          <h2 className="mb-6 text-2xl font-bold">
            Why should non-engineers care about agents?
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="mb-2 font-semibold">Automate the boring stuff</h3>
              <p className="text-sm text-muted-foreground">
                Agents run on schedules. They check your metrics, scan the news,
                review pull requests, and email you the results — so you can
                focus on decisions, not data gathering.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">
                Think in systems, not prompts
              </h3>
              <p className="text-sm text-muted-foreground">
                A prompt gives you one answer. An agent gives you a process.
                The Council Agent doesn&apos;t just respond — it evaluates your
                idea from 6 different perspectives and delivers a structured
                recommendation.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Ship real infrastructure</h3>
              <p className="text-sm text-muted-foreground">
                These aren&apos;t toys. They&apos;re TypeScript projects with
                proper error handling, environment management, and documentation.
                The same patterns that power production systems at real
                companies.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold">
            From fork to running agent in 3 steps
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Fork a template",
                desc: "Pick the agent that matches your use case. Click fork on GitHub, clone it locally.",
              },
              {
                step: "2",
                title: "Configure your .env",
                desc: "Add your Anthropic API key, email provider, and any data sources. Each template has a .env.example.",
              },
              {
                step: "3",
                title: "Run and schedule",
                desc: "npm install && npm start. Set up a cron schedule and your agent runs automatically.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-primary font-mono text-lg font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Responsible Use Notice */}
        <div className="mb-16 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <Shield className="mt-0.5 size-5 shrink-0 text-amber-500" />
          <div>
            <p className="mb-1 text-sm font-medium text-amber-500">
              Responsible use
            </p>
            <p className="text-sm text-muted-foreground">
              These templates call external APIs using your API keys. Never
              commit your <code className="font-mono">.env</code> file. Review
              each template&apos;s <code className="font-mono">DATA_FLOW.md</code>{" "}
              to understand what data is sent where. If you accidentally push an
              API key, rotate it immediately.
            </p>
          </div>
        </div>

        {/* Course CTA */}
        <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h2 className="mb-2 text-xl font-bold">
            These templates show you what&apos;s possible.
            <br />
            Zero to Ship teaches you how to build your own.
          </h2>
          <p className="mb-6 text-muted-foreground">
            16 hands-on modules. From first terminal command to deployed
            product. Gamified progress, certificates, and a founding member
            community.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button render={<Link href="/pricing" />} size="lg">
              Get Full Access — $79
              <ArrowRight className="ml-2 size-4" />
            </Button>
            <p className="w-full text-sm font-medium text-green-400">
              Founding member price: $49 (limited spots)
            </p>
          </div>
        </div>

        {/* Guide CTA */}
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Mail className="mx-auto mb-3 size-8 text-primary" />
          <h2 className="mb-2 text-xl font-bold">
            Want the full walkthrough?
          </h2>
          <p className="mb-6 text-muted-foreground">
            The Agent Builder Guide breaks down what agents are, how each
            template works, and how to build your own from scratch.
          </p>
          <Button
            render={<Link href="/guides/agent-builder" />}
            variant="outline"
            size="lg"
          >
            Read the Agent Builder Guide
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
