"use client";

import { useState, useEffect, useCallback } from "react";
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
  Flame,
  Trophy,
  Route,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "./theme-toggle";
import type { Profile } from "@/types";
import { getXPProgress } from "@/lib/gamification/constants";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/modules", label: "Modules", icon: BookOpen },
  { href: "/learning-path", label: "Learning Path", icon: Route },
  { href: "/skill-tree", label: "Skill Tree", icon: GitBranch },
  { href: "/cheat-sheets", label: "Cheat Sheets", icon: FileText },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/build-log", label: "Build Log", icon: ClipboardList },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/certificate", label: "Certificate", icon: Award },
];

export function AppTopbar({ profile }: { profile: Profile }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { current } = getXPProgress(profile.xp);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobile();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileOpen, closeMobile]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

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
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background pt-14 transition-all duration-200 lg:hidden",
          mobileOpen
            ? "pointer-events-auto opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 -translate-y-2"
        )}
      >
        <nav className="flex h-full flex-col p-4">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
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
          </div>
          <div className="mt-auto pt-4">
            <Separator className="mb-4" />
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              <LogOut className="size-5" />
              Sign Out
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
