import Link from "next/link";

const FREE_RESOURCES = [
  {
    emoji: "⚡",
    title: "Claude Code 101",
    body: "Get from idea to running code in one session.",
    href: "/guides/claude-code-101",
  },
  {
    emoji: "🗂️",
    title: "Prompt Cheat Sheet",
    body: "40+ prompts for PMs who build.",
    href: "/library",
  },
  {
    emoji: "📊",
    title: "SQL for PMs & BAs",
    body: "The 4 queries that cover 90% of PM/BA work.",
    href: "/guides/sql-for-product-managers",
  },
  {
    emoji: "🗺️",
    title: "Learning Paths by Role",
    body: "Start free. Know exactly when to go paid.",
    href: "/learning-paths",
  },
];

export function FreeContentHub() {
  return (
    <section className="border-b border-slate-100 px-6 py-12 sm:px-10">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-purple-600">
        Free resources — no account needed
      </p>
      <p className="mb-6 text-sm text-slate-500">
        Start learning right now. These are free, forever.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FREE_RESOURCES.map(({ emoji, title, body, href }) => (
          <Link
            key={title}
            href={href}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
          >
            <div className="mb-3 text-2xl">{emoji}</div>
            <p className="mb-1 font-bold text-slate-900 group-hover:text-indigo-600">
              {title}
            </p>
            <p className="text-xs text-slate-500" style={{ lineHeight: "1.5" }}>
              {body}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
