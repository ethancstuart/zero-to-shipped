import dynamic from "next/dynamic";
import { Suspense } from "react";
import { siteConfig } from "@/lib/constants";
import { HeroSection } from "@/components/marketing/hero-section";
import { WhatYouBuildStrip } from "@/components/marketing/what-you-build-strip";
import { FreeContentHub } from "@/components/marketing/free-content-hub";
import { FinalCtaSection } from "@/components/marketing/final-cta-section";
import { AuthErrorBanner } from "@/components/marketing/auth-error-banner";

// Below-fold sections: code-split to reduce initial bundle
const CurriculumSection = dynamic(
  () =>
    import("@/components/marketing/curriculum-section").then(
      (m) => ({ default: m.CurriculumSection })
    ),
  { ssr: true, loading: () => <div className="min-h-[200px]" /> }
);
const PricingSection = dynamic(
  () =>
    import("@/components/marketing/pricing-section").then(
      (m) => ({ default: m.PricingSection })
    ),
  { ssr: true, loading: () => <div className="min-h-[200px]" /> }
);
const RoleTracksSection = dynamic(
  () =>
    import("@/components/marketing/role-tracks-section").then(
      (m) => ({ default: m.RoleTracksSection })
    ),
  { ssr: true, loading: () => <div className="min-h-[100px]" /> }
);

export const dynamic_rendering = "force-static";

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

export default function LandingPage() {
  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Error banner reads ?error=auth client-side so the page can stay static */}
      <Suspense>
        <AuthErrorBanner />
      </Suspense>

      <HeroSection />
      <WhatYouBuildStrip />
      <FreeContentHub />
      <CurriculumSection />
      <PricingSection />
      <RoleTracksSection />
      <FinalCtaSection />
    </div>
  );
}
