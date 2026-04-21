export function WhatYouBuildStrip() {
  const items = [
    {
      title: "A working web app",
      body: "Real URL. Runs in a browser. Built from a plain-English prompt in under 40 minutes.",
    },
    {
      title: "The build loop",
      body: "Prompt → review → run → evaluate → iterate. Taught in context, not theory.",
    },
    {
      title: "Proof it works on you",
      body: "Before you pay for anything, you'll know if the method clicks — because you just did it.",
    },
  ];

  return (
    <section className="border-b border-slate-100 bg-[#fafbff] px-6 py-10 sm:px-10">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-purple-600">
        What you build in Module 1 — free, no sign-up
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map(({ title, body }) => (
          <div
            key={title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="mb-1.5 font-bold text-slate-900">{title}</p>
            <p className="text-sm text-slate-500" style={{ lineHeight: "1.6" }}>
              {body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
