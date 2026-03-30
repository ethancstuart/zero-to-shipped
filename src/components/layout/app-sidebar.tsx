"use client";

import Link from "next/link";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
      <div className="flex h-16 items-center gap-2 px-6">
        <Rocket className="size-5 text-primary" />
        <span className="font-bold">Zero to Ship</span>
        {profile.subscription_tier === "premium" && (
          <Badge variant="secondary" className="ml-auto text-[10px]">
            Premium
          </Badge>
        )}
      </div>

      <Separator />

      {/* XP Bar */}
      <div className="px-6 py-4">
        <Progress value={progressPercent} className="mb-1">
          <span className="text-xs font-medium">Lv.{current.level} {current.title}</span>
          <span className="ml-auto text-xs text-muted-foreground">{profile.xp} XP</span>
        </Progress>
        {next && (
          <p className="mt-1 text-[10px] text-muted-foreground">
            {next.xpRequired - profile.xp} XP to {next.title}
          </p>
        )}
      </div>

      <Separator />

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
      <Separator />
      <div className="p-4">
        <div className="mb-2 flex items-center gap-3">
          <Avatar>
            {profile.avatar_url ? (
              <AvatarImage
                src={profile.avatar_url}
                alt={`${profile.display_name ?? "User"}'s avatar`}
              />
            ) : null}
            <AvatarFallback>
              {profile.display_name?.[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
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
