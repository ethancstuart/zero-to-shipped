import Link from "next/link";
import { LoginButton } from "@/components/layout/login-button";

export function PricingSection() {
  return (
    <section className="border-b border-slate-100 bg-slate-50 px-6 py-14 sm:px-10">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-purple-600">
        Pricing
      </p>
      <p className="mb-8 text-sm text-slate-500">
        Everything is free. Premium content coming later.
      </p>

      <div className="max-w-md">
        {/* Free card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-1 font-bold text-slate-900">Free</p>
          <p className="mb-1 text-3xl font-extrabold text-slate-950">$0</p>
          <p className="mb-5 text-xs text-slate-400">forever</p>
          <ul className="mb-6 flex flex-col gap-2 text-sm text-slate-600">
            {[
              "All published content and guides",
              "XP, badges, and streaks",
              "Progress tracking",
              "AI assistant",
              "Builder tools and comparisons",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-green-500">&#10003;</span> {f}
              </li>
            ))}
          </ul>
          <LoginButton source="pricing_page" label="Start free" />
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        <Link href="/pricing" className="underline hover:text-slate-600">
          See full details
        </Link>
      </p>
    </section>
  );
}
