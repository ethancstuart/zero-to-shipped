import Link from "next/link";
import {
  Rocket,
  BookOpen,
  Trophy,
  Users,
  ArrowRight,
  CheckCircle2,
  Zap,
  Target,
  BarChart3,
  Award,
  Globe,
  Briefcase,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/layout/login-button";
import { FoundingCounter } from "@/components/marketing/founding-counter";
import { MODULE_METADATA } from "@/lib/content/modules";
import { ROLE_LABELS, TIER_LABELS, siteConfig } from "@/lib/constants";
import { getRoleLandingSlugByRoleKey } from "@/lib/content/role-landing";
import type { RoleTrack, ModuleTier } from "@/types";

const ROLE_ICONS: Record<RoleTrack, React.ReactNode> = {
  pm: <Target className="size-6" />,
  pjm: <BarChart3 className="size-6" />,
  ba: <Users className="size-6" />,
  bi: <Zap className="size-6" />,
};

const ROLE_DESCRIPTIONS: Record<RoleTrack, string> = {
  pm: "Build prototypes, validate ideas, and ship internal tools that impress stakeholders.",
  pjm: "Create status dashboards, automate reporting, and build project tracking tools.",
  ba: "Build data dictionaries, process flow tools, and requirements trackers.",
  bi: "Create self-service query builders, data catalogs, and automated report suites.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Zero to Ship",
  description:
    "A gamified learning platform teaching PMs, Project Managers, BAs, and BI Engineers to build real products with AI coding tools.",
  provider: {
    "@type": "Organization",
    name: "Zero to Ship",
    url: siteConfig.url,
  },
  numberOfCredits: 16,
  educationalLevel: "Beginner to Advanced",
  isAccessibleForFree: true,
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "Online",
    courseWorkload: "PT70H",
  },
};

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const tiers: ModuleTier[] = ["foundations", "intermediate", "advanced", "capstone"];

  return (
    <div className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="mx-auto max-w-4xl px-4 text-center">
          {error === "auth" && (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Sign in failed. Please try again.
            </div>
          )}
          <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-500">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-500 sm:px-4 sm:text-sm">
              <Rocket className="size-4" />
              Founding member pricing: $99 (first 100 students)
            </div>
            <h1 className="mb-6 text-3xl font-bold tracking-tight sm:text-6xl">
              Stop learning.
              <br />
              <span className="text-primary">Start shipping.</span>
            </h1>
            <p className="mx-auto mb-4 max-w-2xl text-sm text-muted-foreground sm:text-lg">
              Go from &ldquo;I have an idea&rdquo; to &ldquo;here&apos;s the live
              URL&rdquo; — even if you&apos;ve never written a line of code.
            </p>
            <p className="mx-auto mb-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Built for PMs, Project Managers, BAs, and BI Engineers
            </p>
            <p className="mx-auto mb-8 max-w-2xl text-sm font-medium text-muted-foreground">
              16 modules. Ship a capstone. Earn a certificate.
            </p>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-500 delay-200">
            <FoundingCounter />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" render={<Link href="/preview/module-1" />}>
                Try Module 1 free
                <ArrowRight className="ml-2 size-4" />
              </Button>
              <LoginButton source="landing_hero" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              No sign-up required to preview. 5 modules free after you sign in.
            </p>
            <div className="mt-6">
              <Button
                variant="ghost"
                size="sm"
                render={<a href="#curriculum" />}
              >
                View Curriculum
                <ArrowRight className="ml-1 size-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6">
              <BookOpen className="mb-4 size-8 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">16 Hands-On Modules</h3>
              <p className="text-sm text-muted-foreground">
                From setup to capstone, each module builds real skills with
                interactive checkpoints and practical exercises.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <Trophy className="mb-4 size-8 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">Gamified Progress</h3>
              <p className="text-sm text-muted-foreground">
                Earn XP, unlock badges, maintain streaks, and level up as you
                build your way through the curriculum.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <Users className="mb-4 size-8 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">Role-Specific Tracks</h3>
              <p className="text-sm text-muted-foreground">
                Tailored learning paths for PMs, Project Managers, BAs, and BI
                Engineers — focus on what matters to your role.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Build */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-4 text-center text-3xl font-bold">
            What You&apos;ll Build
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
            Real projects for your actual role — not toy apps.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-2 text-primary"><Target className="size-6" /></div>
              <h3 className="mb-1 font-semibold">Product Managers</h3>
              <p className="text-sm text-muted-foreground">
                Ship prototypes your eng team deprioritized.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-2 text-primary"><BarChart3 className="size-6" /></div>
              <h3 className="mb-1 font-semibold">Project Managers</h3>
              <p className="text-sm text-muted-foreground">
                Build status dashboards stakeholders check daily.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-2 text-primary"><Users className="size-6" /></div>
              <h3 className="mb-1 font-semibold">Business Analysts</h3>
              <p className="text-sm text-muted-foreground">
                Create data tools that replace manual spreadsheets.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-2 text-primary"><Zap className="size-6" /></div>
              <h3 className="mb-1 font-semibold">BI Engineers</h3>
              <p className="text-sm text-muted-foreground">
                Automate the reports you rebuild every Monday.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Tracks */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-4 text-center text-3xl font-bold">
            Choose Your Track
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
            Every module is available to everyone, but your role track highlights
            the modules most relevant to your daily work.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(ROLE_LABELS) as RoleTrack[]).map((role) => {
              const coreModules = MODULE_METADATA.filter(
                (m) => m.roleRelevance[role] === "core"
              );
              const roleSlug = getRoleLandingSlugByRoleKey(role);
              return (
                <Link
                  key={role}
                  href={`/for/${roleSlug}`}
                  className="group rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                >
                  <div className="mb-3 text-primary">{ROLE_ICONS[role]}</div>
                  <h3 className="mb-1 font-semibold">{ROLE_LABELS[role]}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {ROLE_DESCRIPTIONS[role]}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {coreModules.length} core modules
                    </p>
                    <ArrowRight className="size-4 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section id="curriculum" className="border-t border-border py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-4 text-center text-3xl font-bold">Curriculum</h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
            16 modules organized into four tiers, from foundational skills to
            your capstone project.
          </p>
          <div className="space-y-10">
            {tiers.map((tier) => {
              const modules = MODULE_METADATA.filter((m) => m.tier === tier);
              return (
                <div key={tier}>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
                    {TIER_LABELS[tier]}
                  </h3>
                  <div className="space-y-3">
                    {modules.map((mod) => (
                      <div
                        key={mod.number}
                        className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {mod.number}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium">{mod.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {mod.description}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{mod.estimatedHours} hours</span>
                            <span>{mod.checkpoints.length} checkpoints</span>
                          </div>
                        </div>
                        <CheckCircle2 className="size-5 shrink-0 text-muted-foreground/30" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Built For Professionals */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="mb-6 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Built for professionals in
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["Tech", "Finance", "Healthcare", "Media", "Consulting"].map(
              (category) => (
                <span
                  key={category}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground"
                >
                  {category}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* Course Stats */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <BookOpen className="mx-auto mb-3 size-6 text-primary" />
              <p className="text-3xl font-bold">16</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Hands-on modules
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <CheckCircle2 className="mx-auto mb-3 size-6 text-primary" />
              <p className="text-3xl font-bold">100+</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Checkpoints
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <Briefcase className="mx-auto mb-3 size-6 text-primary" />
              <p className="text-3xl font-bold">4</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Role-specific tracks
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <Award className="mx-auto mb-3 size-6 text-primary" />
              <p className="text-3xl font-bold">1</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Certificate of completion
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Walk Away With */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-4 text-center text-3xl font-bold">
            What You&apos;ll Walk Away With
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
            Not just knowledge — tangible proof you can build.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-6">
              <Globe className="mt-0.5 size-6 shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold">A deployed project with a real URL</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ship something live to the internet that anyone can visit.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-6">
              <Briefcase className="mt-0.5 size-6 shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold">A portfolio you can show in interviews</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Demonstrate technical ability with real, working projects.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-6">
              <Code2 className="mt-0.5 size-6 shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold">The AI build loop — a skill that transfers to any project</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Learn the repeatable process for turning ideas into software with AI.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-6">
              <Award className="mt-0.5 size-6 shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold">A certificate proving you can ship</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Shareable proof of completion for your LinkedIn and resume.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to start building?</h2>
          <p className="mb-4 text-muted-foreground">
            5 modules free. Full access: $199 one-time.
          </p>
          <p className="mb-8 text-sm font-medium text-green-500">
            First 100 students get founding member pricing: $99
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" render={<Link href="/preview/module-1" />}>
              Try Module 1 free
              <ArrowRight className="ml-2 size-4" />
            </Button>
            <LoginButton source="landing_cta" />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            No sign-up required to preview.{" "}
            <Link href="/pricing" className="underline underline-offset-2 hover:text-foreground">
              See full pricing →
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
