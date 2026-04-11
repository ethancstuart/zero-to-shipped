import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Rocket,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/constants";
import {
  ROLE_LANDING_CONFIGS,
  ROLE_LANDING_SLUGS,
  getRoleLandingConfig,
  type RoleLandingSlug,
} from "@/lib/content/role-landing";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): { slug: RoleLandingSlug }[] {
  return ROLE_LANDING_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const config = getRoleLandingConfig(slug);
  if (!config) return { title: "Not Found" };

  const ogUrl = `${siteConfig.url}/api/og?template=role-landing&role=${encodeURIComponent(
    config.rolePlural
  )}&headline=${encodeURIComponent(config.heroHeadline)}`;

  return {
    title: config.title,
    description: config.metaDescription,
    alternates: {
      canonical: `${siteConfig.url}/for/${config.slug}`,
    },
    openGraph: {
      title: config.title,
      description: config.metaDescription,
      url: `${siteConfig.url}/for/${config.slug}`,
      type: "website",
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: `Zero to Ship for ${config.rolePlural}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.metaDescription,
      images: [ogUrl],
    },
  };
}

export default async function RoleLandingPage({ params }: Props) {
  const { slug } = await params;
  const config = getRoleLandingConfig(slug);
  if (!config) notFound();

  // Schema.org Course JSON-LD for richer search results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `Zero to Ship — ${config.rolePlural}`,
    description: config.metaDescription,
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      sameAs: siteConfig.url,
    },
    url: `${siteConfig.url}/for/${config.slug}`,
    audience: {
      "@type": "EducationalAudience",
      audienceType: config.rolePlural,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "PT40H",
    },
    offers: {
      "@type": "Offer",
      price: "99",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${siteConfig.url}/pricing`,
    },
  };

  return (
    <div className="py-16 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
          For {config.rolePlural}
        </p>
        <h1 className="mb-5 text-4xl font-bold leading-tight sm:text-5xl">
          {config.heroHeadline}
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          {config.heroSubheadline}
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" render={<Link href="/" />}>
            {config.heroCtaLabel}
            <ArrowRight className="ml-2 size-4" />
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/pricing" />}>
            See Pricing
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          5 free modules. No credit card. Upgrade when you&apos;re ready.
        </p>
      </section>

      {/* Pain points */}
      <section className="mx-auto mt-20 max-w-5xl px-4">
        <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">
          If you&apos;re a {config.roleSingular}, you know the feeling.
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {config.painPoints.map((pain) => (
            <div
              key={pain.title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <Target className="mb-3 size-5 text-primary" />
              <h3 className="mb-2 text-base font-semibold">{pain.title}</h3>
              <p className="text-sm text-muted-foreground">{pain.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Outcomes */}
      <section className="mx-auto mt-20 max-w-4xl px-4">
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent p-8 sm:p-10">
          <h2 className="mb-2 text-2xl font-bold sm:text-3xl">
            What you&apos;ll be able to do
          </h2>
          <p className="mb-8 text-muted-foreground">
            Concrete outcomes. Not a certificate that sits in your LinkedIn.
          </p>
          <ul className="space-y-4">
            {config.outcomes.map((outcome) => (
              <li key={outcome} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                <span className="text-base">{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Curriculum highlights */}
      <section className="mx-auto mt-20 max-w-5xl px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-2xl font-bold sm:text-3xl">
            The modules built for you
          </h2>
          <p className="text-muted-foreground">
            16 modules total.{" "}
            {config.curriculumHighlights.length} of them matter most for{" "}
            {config.rolePlural.toLowerCase()}.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {config.curriculumHighlights.map((mod) => (
            <div
              key={mod.moduleNumber}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-primary text-sm font-bold text-primary">
                  {mod.moduleNumber}
                </div>
                <h3 className="text-base font-semibold leading-tight">
                  {mod.title}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                <Sparkles className="mr-1.5 inline size-4 text-primary" />
                {mod.whyItMatters}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats row */}
      <section className="mx-auto mt-20 max-w-4xl px-4">
        <div className="grid grid-cols-2 gap-6 rounded-2xl border border-border bg-card p-6 sm:grid-cols-4 sm:p-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">16</div>
            <div className="mt-1 text-xs text-muted-foreground">Modules</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">40h</div>
            <div className="mt-1 text-xs text-muted-foreground">
              <Clock className="mr-1 inline size-3" />
              Typical completion
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">1</div>
            <div className="mt-1 text-xs text-muted-foreground">
              <Rocket className="mr-1 inline size-3" />
              Shipped capstone
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">$99</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Founding price
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-20 max-w-3xl px-4">
        <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">
          {config.roleSingular}s ask us
        </h2>
        <div className="space-y-4">
          {config.faq.map((item) => (
            <details
              key={item.question}
              className="group rounded-xl border border-border bg-card p-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold">
                {item.question}
                <ArrowRight className="size-4 shrink-0 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto mt-20 max-w-3xl px-4">
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-transparent to-transparent p-8 text-center sm:p-12">
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
            Start free. Ship something real.
          </h2>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
            5 free modules get you from zero to your first shipped web app. If
            you like how it feels, unlock the rest for $99 one-time. No
            subscription.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/" />}>
              {config.heroCtaLabel}
              <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/pricing" />}>
              See Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Cross-links to other role pages — internal linking for SEO */}
      <section className="mx-auto mt-20 max-w-4xl px-4 text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          Different role? We have pages for them too.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {ROLE_LANDING_SLUGS.filter((s) => s !== config.slug).map(
            (otherSlug) => {
              const other = ROLE_LANDING_CONFIGS[otherSlug];
              return (
                <Link
                  key={otherSlug}
                  href={`/for/${otherSlug}`}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
                >
                  For {other.rolePlural} &rarr;
                </Link>
              );
            }
          )}
        </div>
      </section>
    </div>
  );
}
