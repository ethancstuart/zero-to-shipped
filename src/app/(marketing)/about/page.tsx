import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Zero to Ship",
  description:
    "Zero to Ship is built by builders, for builders. A course for people who think in products and want to ship them.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <h1 className="mb-3 text-3xl font-bold">Built by builders, for builders</h1>
      <p className="mb-10 text-lg text-muted-foreground">
        Zero to Ship exists because the people who understand products best
        have always had to wait for someone else to build them.
      </p>

      <div className="space-y-6 text-muted-foreground [&>p]:leading-relaxed">
        <p>
          We&apos;re PMs, project managers, BAs, and analysts. We write the
          specs. We run the sprints. We know what users need and why. And for
          years, the only way to turn that understanding into a working product
          was to hand it off — and hope the handoff survived contact with
          reality.
        </p>

        <p>
          AI coding tools changed that. For the first time, the gap between
          knowing what to build and actually building it is closeable — without
          a CS degree, without a co-founder, without a sprint cycle. Zero to
          Ship teaches the workflow that makes that possible.
        </p>

        <p>
          The curriculum was built by someone in the same seat you&apos;re in:
          a product leader who got tired of watching good ideas die in
          backlog grooming and decided to learn to ship them directly. Every
          module comes from that experience — what actually works, what
          doesn&apos;t, and what you need to know to go from a blank folder to
          a deployed product.
        </p>

        <p>
          This isn&apos;t a course about AI. It&apos;s a course about building
          — using the best tools available right now. The people who take it
          come out with something real: a capstone project, a certificate, and
          a build loop they can apply to anything.
        </p>
      </div>

      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        <Button render={<Link href="/preview/module-1" />}>
          Start building — Module 1 is free
          <ArrowRight className="ml-2 size-4" />
        </Button>
        <Button variant="outline" render={<Link href="/pricing" />}>
          See pricing
        </Button>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Questions?{" "}
        <a
          href="mailto:ethan@zerotoship.app"
          className="text-foreground underline-offset-4 hover:underline"
        >
          ethan@zerotoship.app
        </a>
      </p>
    </div>
  );
}
