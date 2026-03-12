"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  GitBranch,
  FileText,
  User,
  Award,
  Rocket,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import type { Profile } from "@/types";
import { getXPProgress } from "@/lib/gamification/constants";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/modules", label: "Modules", icon: BookOpen },
  { href: "/skill-tree", label: "Skill Tree", icon: GitBranch },
  { href: "/cheat-sheets", label: "Cheat Sheets", icon: FileText },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/certificate", label: "Certificate", icon: Award },
];

export function AppTopbar({ profile }: { profile: Profile }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { current } = getXPProgress(profile.xp);

  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm lg:pl-68">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        {/* Desktop: page context */}
        <div className="hidden lg:block" />

        {/* Stats */}
        <div className="flex items-center gap-4">
          {profile.current_streak > 0 && (
            <div className="flex items-center gap-1 text-sm text-orange-500">
              <Flame className="size-4" />
              <span className="font-medium">{profile.current_streak}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-medium text-primary">
              Lv.{current.level}
            </span>
            <span className="text-muted-foreground">{profile.xp} XP</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-14 lg:hidden">
          <nav className="space-y-1 p-4">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="size-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
