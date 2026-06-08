import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { NavLoginButton } from "./nav-login-button";
import { MobileMenu } from "./mobile-menu";
import { createClient } from "@/lib/supabase/server";

const navItems = [
  { label: "Pulse", href: "/pulse" },
  { label: "Build", href: "/build" },
  { label: "Learn", href: "/learn" },
  { label: "System", href: "/system" },
  { label: "Tools", href: "/tools" },
  { label: "Which tool?", href: "/which-tool" },
];

export async function MarketingNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[hsl(var(--bg))]/88 backdrop-blur-xl border-b border-[hsl(var(--border-base))]">
      <nav className="flex items-center justify-between px-6 lg:px-12 py-5">
        <Link href="/">
          <span className="text-xs tracking-[2px] uppercase text-[hsl(var(--fg-muted))]">
            prototype studio
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg))] transition-all duration-300"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Link
                href="/dashboard"
                className="bg-[hsl(var(--fg))] text-[hsl(var(--bg))] rounded-full px-5 py-2 text-xs transition-all duration-300 hover:opacity-90"
              >
                Dashboard
              </Link>
            ) : (
              <NavLoginButton />
            )}
          </div>
          <MobileMenu isAuthenticated={!!user} />
        </div>
      </nav>
    </header>
  );
}
