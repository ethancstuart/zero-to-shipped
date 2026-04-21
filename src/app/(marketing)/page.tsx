import { siteConfig } from "@/lib/constants";
import { HeroSection } from "@/components/marketing/hero-section";
import { WhatYouBuildStrip } from "@/components/marketing/what-you-build-strip";
import { FreeContentHub } from "@/components/marketing/free-content-hub";
import { CurriculumSection } from "@/components/marketing/curriculum-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { RoleTracksSection } from "@/components/marketing/role-tracks-section";
import { FinalCtaSection } from "@/components/marketing/final-cta-section";

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

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {error === "auth" && (
        <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-center text-sm text-red-700">
          Sign in failed. Please try again.
        </div>
      )}

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
