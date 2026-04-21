import Link from "next/link";
import { MODULE_METADATA } from "@/lib/content/modules";

const FREE_MODULE_NUMBERS = [1, 2, 3, 4, 5];

export function CurriculumSection() {
  return (
    <section id="curriculum" className="border-b border-slate-100 px-6 py-14 sm:px-10">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-purple-600">
        The full curriculum
      </p>
      <p className="mb-8 text-sm text-slate-500">
        16 modules. Every one produces something real.
      </p>

      <div className="flex flex-col gap-3">
        {MODULE_METADATA.map((mod) => {
          const isFree = FREE_MODULE_NUMBERS.includes(mod.number);

          if (isFree) {
            return (
              <div
                key={mod.number}
                className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4"
              >
                <div className="flex size-5 shrink-0 items-center justify-center rounded bg-green-500 text-white">
                  <span className="text-[10px] font-bold">✓</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900">
                      Module {mod.number} — {mod.title}
                    </span>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                      Free
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Ship: {mod.ships}
                  </p>
                </div>
              </div>
            );
          }

          // Locked module — C-style 2-column preview card
          const lessonTopics = mod.checkpoints.slice(0, 4);

          return (
            <div
              key={mod.number}
              className="rounded-xl border border-dashed border-purple-200 bg-purple-50/50 p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="font-bold text-slate-900">
                  Module {mod.number} — {mod.title}
                </span>
                <span className="text-sm">🔒</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-purple-100 bg-white p-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    What&apos;s inside
                  </p>
                  <ul className="flex flex-col gap-1">
                    {lessonTopics.map((topic) => (
                      <li
                        key={topic}
                        className="flex items-start gap-1.5 text-xs text-slate-600"
                      >
                        <span className="mt-0.5 shrink-0 text-purple-500">
                          →
                        </span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-purple-100 bg-white p-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-purple-700">
                    You&apos;ll ship:
                  </p>
                  <p
                    className="text-xs text-slate-700"
                    style={{ lineHeight: "1.6" }}
                  >
                    {mod.ships}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-opacity hover:opacity-90"
        >
          Unlock all 16 modules — $99 founding →
        </Link>
      </div>
    </section>
  );
}
