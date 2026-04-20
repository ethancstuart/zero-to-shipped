import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Zero to Ship",
  description:
    "Zero to Ship was built by a PM who got tired of watching good ideas die in sprint planning. Here's what it is and why it exists.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <h1 className="mb-8 text-3xl font-bold">About Zero to Ship</h1>

      <div className="space-y-6 text-muted-foreground [&>p]:leading-relaxed">
        <p>
          Zero to Ship is a course for people who already understand products,
          users, and problems — but have never had a direct way to build. It
          teaches the AI coding workflow from zero to a shipped capstone project,
          built specifically for PMs, Project Managers, BAs, and BI Engineers.
        </p>

        <p>
          The curriculum is 16 modules: environment setup, prompt engineering,
          how software actually works, version control, databases, APIs,
          deployment, and a full capstone. Not a survey of tools. A structured
          path with real output at the end.
        </p>

        <p>
          It was built by a product leader at a Fortune 100 media and tech
          company — someone who spent years writing specs for engineers and
          watching ideas get scoped down, deprioritized, or lost. When AI coding
          tools became capable enough to bridge that gap, the course followed.
        </p>

        <p>
          The goal isn&apos;t to turn you into a software engineer. It&apos;s
          to give you a working build loop — prompt, review, evaluate, iterate —
          that you can use to ship internal tools, validate ideas, and build
          things that used to require headcount.
        </p>
      </div>

      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        <Button render={<Link href="/preview/module-1" />}>
          Start Module 1 free
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
