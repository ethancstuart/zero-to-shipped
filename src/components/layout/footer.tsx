import Link from "next/link";

const columns = [
  {
    heading: "Platform",
    links: [
      { label: "Pulse", href: "/pulse" },
      { label: "Build", href: "/build" },
      { label: "Learn", href: "/learn" },
      { label: "System", href: "/system" },
    ],
  },
  {
    heading: "By role",
    links: [
      { label: "Product Managers", href: "/for/product-managers" },
      { label: "Project Managers", href: "/for/project-managers" },
      { label: "Business Analysts", href: "/for/business-analysts" },
      { label: "BI Engineers", href: "/for/bi-engineers" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Tools", href: "/tools" },
      { label: "Compare", href: "/compare" },
      { label: "Showcase", href: "/showcase" },
      { label: "API Docs", href: "/api/docs" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "Transparency", href: "/transparency" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[hsl(var(--border-base))] py-20 px-6 lg:px-12">
      <div className="max-w-[1300px] mx-auto flex flex-col gap-12 sm:flex-row sm:justify-between">
        {/* Logo area */}
        <div>
          <p className="text-xs tracking-[1px] uppercase text-[hsl(var(--fg-muted))]">
            Prototype Studio
          </p>
          <p className="text-xs text-[hsl(var(--fg-faint))] mt-2">
            Build real products with AI.
          </p>
        </div>

        {/* Link columns */}
        <div className="flex gap-12 lg:gap-16">
          {columns.map((col) => (
            <div key={col.heading}>
              <p className="text-[10px] tracking-[1.5px] uppercase text-[hsl(var(--fg-muted))] font-medium mb-4">
                {col.heading}
              </p>
              <ul>
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[hsl(var(--fg-secondary))] hover:text-[hsl(var(--fg))] transition-colors block mb-2.5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
