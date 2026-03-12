"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Target, BarChart3, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { ROLE_LABELS } from "@/lib/constants";
import type { RoleTrack } from "@/types";

const ROLES: { value: RoleTrack; icon: React.ReactNode; description: string }[] = [
  {
    value: "pm",
    icon: <Target className="size-8" />,
    description: "You define what gets built and ship products to users.",
  },
  {
    value: "pjm",
    icon: <BarChart3 className="size-8" />,
    description: "You keep projects on track, on time, and on budget.",
  },
  {
    value: "ba",
    icon: <Users className="size-8" />,
    description: "You bridge business needs and technical solutions.",
  },
  {
    value: "bi",
    icon: <Zap className="size-8" />,
    description: "You build data pipelines, dashboards, and analytics.",
  },
];

export function RoleOnboarding() {
  const [selected, setSelected] = useState<RoleTrack | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ role_track: selected })
        .eq("id", user.id);
    }
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="mb-2 text-center text-2xl font-bold">
          Welcome to Zero to Shipped!
        </h1>
        <p className="mb-8 text-center text-muted-foreground">
          Choose your role to get personalized module recommendations.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {ROLES.map((role) => (
            <button
              key={role.value}
              onClick={() => setSelected(role.value)}
              className={`rounded-xl border-2 p-6 text-left transition-all ${
                selected === role.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div className="mb-3 text-primary">{role.icon}</div>
              <h3 className="mb-1 font-semibold">
                {ROLE_LABELS[role.value]}
              </h3>
              <p className="text-sm text-muted-foreground">
                {role.description}
              </p>
            </button>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button
            onClick={handleSave}
            disabled={!selected || saving}
            size="lg"
          >
            {saving ? "Saving..." : "Continue"}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            You can change this later in your profile settings.
          </p>
        </div>
      </div>
    </div>
  );
}
