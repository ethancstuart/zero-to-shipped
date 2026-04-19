import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WaitlistForm } from "./waitlist-form";

export const metadata = {
  title: "Join the Waitlist — Zero to Ship",
  description:
    "Zero to Ship opens April 28. Founding member pricing: $99 one-time (200 spots). Join the waitlist to get notified when doors open.",
};

export default function WaitlistPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center py-20">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-500">
          Opens April 28 · Founding price: $99
        </div>

        <h1 className="mb-4 text-3xl font-bold">Get notified at launch</h1>
        <p className="mb-2 text-muted-foreground">
          Zero to Ship opens Monday, April 28. Founding member pricing is{" "}
          <strong className="text-foreground">$99 one-time</strong> for the
          first 200 students — then $199.
        </p>
        <p className="mb-8 text-sm text-muted-foreground">
          One email when doors open. No spam.
        </p>

        <WaitlistForm />

        <div className="mt-8 rounded-xl border border-border bg-card p-5 text-left">
          <p className="mb-1 text-sm font-semibold">Free while you wait</p>
          <p className="mb-3 text-sm text-muted-foreground">
            The Builder&apos;s Library has 44 prompts, 4 CLAUDE.md templates,
            and 6 guides — all free, no sign-up required.
          </p>
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Browse the library
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
