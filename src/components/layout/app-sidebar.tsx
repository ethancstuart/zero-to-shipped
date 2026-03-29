"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  GitBranch,
  FileText,
  User,
  Award,
  Rocket,
  LogOut,
  Trophy,
  Route,
  ClipboardList,
  Gift,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  { href: "/referrals", label: "Referrals", icon: Gift },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/certificate", label: "Certificate", icon: Award },
];

export function AppSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const { current, next, progressPercent } = getXPProgress(profile.xp);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <Rocket className="size-5 text-primary" />
        <span className="font-bold">Zero to Ship</span>
        {profile.subscription_tier === "premium" && (
          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            Premium
          </span>
        )}
      </div>

      {/* XP Bar */}
      <div className="border-b border-border px-6 py-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-medium">Lv.{current.level} {current.title}</span>
          <span className="text-muted-foreground">{profile.xp} XP</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {next && (
          <p className="mt-1 text-[10px] text-muted-foreground">
            {next.xpRequired - profile.xp} XP to {next.title}
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-border p-4">
        <div className="mb-2 flex items-center gap-3">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt=""
              width={32}
              height={32}
              className="size-8 rounded-full"
            />
          ) : (
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {profile.display_name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {profile.display_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {profile.current_streak > 0 && `${profile.current_streak}d streak`}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start gap-2 text-muted-foreground"
        >
          <LogOut className="size-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
