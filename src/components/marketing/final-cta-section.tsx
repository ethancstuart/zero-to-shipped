import Link from "next/link";

export function FinalCtaSection() {
  return (
    <section
      className="px-6 py-20 text-center sm:px-10"
      style={{ background: "linear-gradient(135deg, #f5f3ff, #eff6ff)" }}
    >
      <h2
        className="mb-3 text-3xl font-extrabold text-slate-950"
        style={{ letterSpacing: "-0.02em" }}
      >
        Ready to build something?
      </h2>
      <p className="mb-8 text-base text-slate-500">
        Module 1 is free. No sign-up. You&apos;ll ship a working app in 40 minutes.
      </p>
      <Link
        href="/preview/module-1"
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-opacity hover:opacity-90"
      >
        Try Module 1 free →
      </Link>
    </section>
  );
}
