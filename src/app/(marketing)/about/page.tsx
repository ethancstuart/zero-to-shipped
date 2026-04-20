import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "About — Zero to Ship",
  description:
    "Zero to Ship was built by a product leader who wanted to learn to build. Here's the story.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <div className="mb-12 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="relative size-28 shrink-0 overflow-hidden rounded-full border border-border">
          <Image
            src="/ethan-stuart.jpg"
            alt="Ethan Stuart"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div>
          <h1 className="mb-1 text-2xl font-bold">Ethan Stuart</h1>
          <p className="text-sm text-muted-foreground">
            Product &amp; Analytics Leader · Builder · Founder, Zero to Ship
          </p>
        </div>
      </div>

      <div className="space-y-6 text-muted-foreground [&>p]:leading-relaxed">
        <p>
          I lead a data product and analytics team at a Fortune 100 media and
          tech company. My entire career has been in product, advanced
          analytics, and strategy — thinking about what to build, why it
          matters, and how to measure whether it worked.
        </p>

        <p>
          I built Zero to Ship because I wanted to. That&apos;s the real
          answer. I&apos;d spent years writing specs for engineers and watching
          ideas get scoped down, deprioritized, or lost entirely. When AI
          coding tools got good enough that I could describe something in plain
          English and watch it come to life, I stopped writing specs and
          started building.
        </p>

        <p>
          Zero to Ship is the course I wish I&apos;d had — not a programming
          tutorial, not a ChatGPT explainer, but a structured path from
          &ldquo;I have no idea where to start&rdquo; to &ldquo;I just shipped
          something real.&rdquo; Built specifically for the people who already
          understand products, users, and problems. The ones who just never had
          a way in.
        </p>

        <p>
          Every module in this course is something I built, tested, and
          iterated on myself. The capstone project I ask you to ship is the
          same kind of thing I was building when I realized this workflow was
          genuinely different. I teach it because it worked.
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
