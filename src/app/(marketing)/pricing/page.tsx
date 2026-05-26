import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { LoginButton } from "@/components/layout/login-button";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Everything on Prototype Studio is free. All content, tools, and features are available at no cost. Premium content coming later.",
};

const ALL_FEATURES = [
  "All published modules and lessons",
  "XP, badges, and streaks",
  "Skill tree visualization",
  "Progress tracking",
  "AI assistant",
  "Builder tools and comparisons",
  "Cheat sheets and guides",
  "Role-specific learning paths",
  "Capstone templates",
  "Certificate of completion",
  "Public profile with sharing",
  "Leaderboard access",
];

const FAQ_ITEMS = [
  {
    question: "Is everything really free?",
    answer:
      "Yes. All published content, tools, and features are available at no cost. Premium content may be introduced later, but everything available today is free.",
  },
  {
    question: 'Is this "learn to code"?',
    answer:
      'No. This is "learn to ship." You\'ll use AI coding tools to build real products in your actual role — PM, BA, Project Manager, or BI Engineer.',
  },
  {
    question: "Who built this?",
    answer:
      "Built by a product leader who uses AI tools daily to ship at scale. Every module is based on real workflows, not theory.",
  },
  {
    question: "Do I need any coding experience?",
    answer:
      "None. Prototype Studio is built for Product Managers, Business Analysts, Project Managers, and BI Engineers — people with strong product instincts who have never written production code. Module 1 starts from scratch.",
  },
  {
    question: "What tools will I use?",
    answer:
      "Cursor and Claude Code — the two most widely adopted AI coding tools. Both have free tiers you can start with. Setup is covered in Module 1.",
  },
  {
    question: "How long does it take to complete?",
    answer:
      "Most learners finish the full curriculum in 4-6 weeks at a pace of 2-3 hours per week. Each module is self-contained — you can go faster or take breaks without losing context.",
  },
  {
    question: "Will there be paid content later?",
    answer:
      "Possibly. If premium content is introduced, everything that is free today will remain free. We will announce any changes well in advance.",
  },
];

export default function PricingPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">
            Everything is free.
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            All content, tools, and features are available at no cost. Premium
            content coming later.
          </p>
        </div>

        {/* Free tier card */}
        <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-500 mx-auto max-w-md rounded-xl border-2 border-primary bg-card p-6 sm:p-8">
          <h2 className="mb-1 text-xl font-bold">Free</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Full access to everything on the platform.
          </p>
          <p className="mb-6">
            <span className="text-4xl font-bold">$0</span>
            <span className="text-muted-foreground"> forever</span>
          </p>

          <LoginButton source="pricing_page" />

          <ul className="mt-6 space-y-3">
            {ALL_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        <div className="mt-16 space-y-6">
          <h2 className="text-center text-2xl font-bold">FAQ</h2>
          <div className="mx-auto max-w-2xl space-y-4">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.question}
                className="rounded-lg border border-border bg-card p-5"
              >
                <h3 className="mb-1 font-semibold">{item.question}</h3>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Free preview nudge */}
        <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="mb-2 text-xl font-bold">Ready to start?</h2>
          <p className="mx-auto mb-6 max-w-lg text-muted-foreground">
            Jump straight in. No account required for the first lesson.
          </p>
          <Link
            href="/learn/setup-and-first-build"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Try Setup &amp; First Build free
          </Link>
        </div>
      </div>
    </div>
  );
}
