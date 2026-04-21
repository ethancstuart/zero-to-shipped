import Link from "next/link";

const FREE_RESOURCES = [
  {
    emoji: "📖",
    title: "Git for PMs",
    body: "The 5 commands you actually need. Nothing else.",
    href: "/guides/git-101",
  },
  {
    emoji: "⚡",
    title: "Claude Code 101",
    body: "Get from idea to running code in one session.",
    href: "/guides/claude-code-101",
  },
  {
    emoji: "🤖",
    title: "Agent Templates",
    body: "4 open-source templates. Clone and run.",
    href: "/agents",
  },
  {
    emoji: "🗂️",
    title: "Prompt Cheat Sheet",
    body: "40+ prompts for PMs who build.",
    href: "/library",
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
