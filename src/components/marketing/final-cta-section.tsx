import Link from "next/link";

export function FinalCtaSection() {
  return (
    <section className="px-6 py-20 text-center sm:px-10 bg-gradient-to-br from-[hsl(var(--pillar-system-surface))] to-[hsl(var(--pillar-pulse-surface))]">
      <h2
        className="mb-3 text-3xl font-extrabold text-[hsl(var(--fg))]"
        style={{ letterSpacing: "-0.02em" }}
      >
        Ready to build something?
      </h2>
      <p className="mb-8 text-base text-[hsl(var(--fg-secondary))]">
        Module 1 is free. No sign-up. You&apos;ll ship a working app in 40 minutes.
      </p>
      <Link
        href="/learn/setup-and-first-build"
        className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--accent-hsl))] px-7 py-3 text-sm font-bold text-white shadow-[var(--shadow-md)] transition-opacity hover:opacity-90"
      >
        Try Module 1 free →
      </Link>
    </section>
  );
}
