import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Builder's Tool Stack — Builder's Library — Zero to Ship",
  description:
    "The full modern builder stack — every tool you need, with free tier notes. Coming Week 2.",
  openGraph: {
    url: `${siteConfig.url}/library/builder-tools`,
  },
};

export default function BuilderToolsPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4">
        <Link
          href="/library"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Builder&apos;s Library
        </Link>

        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Coming Week 2
          </p>
          <h1 className="mb-4 text-3xl font-bold">Builder&apos;s Tool Stack</h1>
          <p className="mx-auto max-w-lg text-muted-foreground">
            The full modern builder stack — Warp, Cursor, Claude Code, GitHub, Vercel, Supabase,
            Resend. Every tool explained with free tier notes.
          </p>
          <div className="mt-8">
            <Link
              href="/library"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Browse the library
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
