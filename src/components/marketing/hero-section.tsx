import Link from "next/link";
import { FoundingCounter } from "@/components/marketing/founding-counter";

export function HeroSection() {
  return (
    <section className="border-b border-slate-100">
      {/* 3px gradient top bar */}
      <div className="h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400" />

      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left: Headline + CTA */}
        <div className="px-6 py-12 sm:px-10 sm:py-16 lg:px-14">
          {/* Founding badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5">
            <span className="size-2 animate-pulse rounded-full bg-purple-500" />
            <span className="text-xs font-semibold text-purple-700">
              Founding: $99 — 200 spots remaining
            </span>
          </div>

          {/* Headline */}
          <h1
            className="mb-4 text-4xl font-extrabold text-slate-950 sm:text-5xl lg:text-6xl"
            style={{ letterSpacing: "-0.03em", lineHeight: "1.1" }}
          >
            Stop learning.
            <br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Start shipping.
            </span>
          </h1>

          {/* Subhead */}
          <p
            className="mb-2 text-base text-slate-600 sm:text-lg"
            style={{ lineHeight: "1.6" }}
          >
            Go from &ldquo;I have an idea&rdquo; to a live URL — even if
            you&apos;ve never written a line of code.
          </p>
          <p className="mb-8 text-sm text-slate-400">
            Built for PMs, Project Managers, BAs, and BI Engineers.
          </p>

          {/* CTAs */}
          <div className="mb-4 flex flex-wrap gap-3">
            <Link
              href="/preview/module-1"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-opacity hover:opacity-90"
            >
              Try Module 1 free →
            </Link>
            <Link
              href="#curriculum"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              View curriculum
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            No sign-up required · 5 modules free after sign-in
          </p>
        </div>

        {/* Right: Platform preview */}
        <div className="flex flex-col gap-3 bg-slate-50 p-6 sm:p-8 lg:p-10">
          {/* Module card */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">
                Module 1 · The Build Loop
              </span>
              <span className="text-xs font-semibold text-green-600">Free</span>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { done: true, label: "Set up your dev environment" },
                { done: true, label: "Write your first prompt" },
                { done: false, label: "Ship your first working app", active: true },
              ].map(({ done, label, active }) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={`flex size-4 shrink-0 items-center justify-center rounded-full text-white ${
                      active ? "bg-indigo-500" : done ? "bg-green-500" : "bg-slate-200"
                    }`}
                  >
                    <span className="text-[8px] font-bold">
                      {active ? "→" : done ? "✓" : ""}
                    </span>
                  </div>
                  <span
                    className={`text-xs ${
                      active
                        ? "font-semibold text-indigo-600"
                        : done
                          ? "text-slate-700"
                          : "text-slate-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* XP progress */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                Your progress
              </span>
              <span className="text-xs font-semibold text-purple-600">
                240 XP
              </span>
            </div>
            <div className="mb-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[35%] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
            </div>
            <p className="text-[11px] text-slate-400">
              Module 1 of 16 · Keep your streak going
            </p>
          </div>

          {/* Badges */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { emoji: "🔥", label: "3 day streak" },
              { emoji: "🏆", label: "First Build" },
              { emoji: "📦", label: "Deployed" },
            ].map(({ emoji, label }) => (
              <div
                key={label}
                className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm"
              >
                <div className="mb-1 text-xl">{emoji}</div>
                <div className="text-[11px] font-bold text-slate-900">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
