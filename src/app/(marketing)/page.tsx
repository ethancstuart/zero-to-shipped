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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/layout/login-button";
import { MODULE_METADATA } from "@/lib/content/modules";
import { ROLE_LABELS, TIER_LABELS, siteConfig } from "@/lib/constants";
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
  name: "Zero to Shipped",
  description:
    "A gamified learning platform teaching PMs, Project Managers, BAs, and BI Engineers to build real products with AI coding tools.",
  provider: {
    "@type": "Organization",
    name: "Zero to Shipped",
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

export default function LandingPage() {
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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Rocket className="size-4" />
            Free course &middot; 16 modules &middot; ~70 hours
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Build with AI.
            <br />
            <span className="text-primary">No engineering degree required.</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            A gamified learning platform for PMs, Project Managers, Business
            Analysts, and BI Engineers who want to build real products with AI
            coding tools — from zero to shipped.
          </p>
          <div className="flex items-center justify-center gap-4">
            <LoginButton />
            <Button
              variant="outline"
              render={<a href="#curriculum" />}
            >
              View Curriculum
              <ArrowRight className="ml-2 size-4" />
            </Button>
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
              return (
                <div
                  key={role}
                  className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
                >
                  <div className="mb-3 text-primary">{ROLE_ICONS[role]}</div>
                  <h3 className="mb-1 font-semibold">{ROLE_LABELS[role]}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {ROLE_DESCRIPTIONS[role]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {coreModules.length} core modules
                  </p>
                </div>
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

      {/* CTA */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to start building?</h2>
          <p className="mb-8 text-muted-foreground">
            Join for free. Pick your role. Start shipping.
          </p>
          <LoginButton />
        </div>
      </section>
    </div>
  );
}
