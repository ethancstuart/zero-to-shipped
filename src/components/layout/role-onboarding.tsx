"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Target, BarChart3, Users, Zap, Terminal, MousePointer, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { ROLE_LABELS, TOOL_LABELS } from "@/lib/constants";
import type { RoleTrack, ToolPreference } from "@/types";

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

const TOOLS: { value: ToolPreference; icon: React.ReactNode; description: string }[] = [
  {
    value: "claude-code",
    icon: <Terminal className="size-8" />,
    description: "AI-powered CLI. Great if you like working in the terminal.",
  },
  {
    value: "cursor",
    icon: <MousePointer className="size-8" />,
    description: "AI-powered editor. Great if you prefer a visual IDE.",
  },
];

const ROLE_OUTCOMES: Record<RoleTrack, string[]> = {
  pm: [
    "Ship a prototype dashboard for stakeholder reviews",
    "Build an internal tool that replaces a manual workflow",
    "Create a product spec generator with AI",
  ],
  pjm: [
    "Build a project status tracker your team can use",
    "Automate reporting with a custom dashboard",
    "Create a project health dashboard with live data",
  ],
  ba: [
    "Build a data dictionary tool for your team",
    "Create a requirements tracker with validation",
    "Ship a process flow app that documents workflows",
  ],
  bi: [
    "Build a self-service query tool for analysts",
    "Create a data catalog your team can search",
    "Ship an automated report suite with scheduling",
  ],
};

const STEPS = ["role", "tool", "outcomes"] as const;

function StepIndicator({ current }: { current: typeof STEPS[number] }) {
  const currentIndex = STEPS.indexOf(current);
  return (
    <div className="mb-6 flex items-center justify-center gap-2">
      {STEPS.map((_, i) => (
        <div
          key={i}
          className={`size-2 rounded-full transition-colors ${
            i <= currentIndex ? "bg-primary" : "bg-muted"
          }`}
        />
      ))}
      <span className="ml-2 text-xs text-muted-foreground">
        Step {currentIndex + 1} of {STEPS.length}
      </span>
    </div>
  );
}

export function RoleOnboarding() {
  const [step, setStep] = useState<"role" | "tool" | "outcomes">("role");
  const [selectedRole, setSelectedRole] = useState<RoleTrack | null>(null);
  const [selectedTool, setSelectedTool] = useState<ToolPreference | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleContinueRole = () => {
    if (selectedRole) setStep("tool");
  };

  const handleContinueTool = () => {
    setStep("outcomes");
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({
          role_track: selectedRole,
          ...(selectedTool && { tool_preference: selectedTool }),
        })
        .eq("id", user.id);
    }
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {step === "role" ? (
          <>
            <StepIndicator current="role" />
            <h1 className="mb-2 text-center text-2xl font-bold">
              Welcome to Zero to Ship!
            </h1>
            <p className="mb-8 text-center text-muted-foreground">
              Choose your role to get personalized module recommendations.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {ROLES.map((role) => (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={`rounded-xl border-2 p-6 text-left transition-all ${
                    selectedRole === role.value
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
                onClick={handleContinueRole}
                disabled={!selectedRole}
                size="lg"
              >
                Continue
              </Button>
            </div>
          </>
        ) : step === "tool" ? (
          <>
            <StepIndicator current="tool" />
            <h1 className="mb-2 text-center text-2xl font-bold">
              Pick your AI tool
            </h1>
            <p className="mb-8 text-center text-muted-foreground">
              You&apos;ll use this starting in Module 5. You can switch anytime.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {TOOLS.map((tool) => (
                <button
                  key={tool.value}
                  onClick={() => setSelectedTool(tool.value)}
                  className={`rounded-xl border-2 p-6 text-left transition-all ${
                    selectedTool === tool.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="mb-3 text-primary">{tool.icon}</div>
                  <h3 className="mb-1 font-semibold">
                    {TOOL_LABELS[tool.value]}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {tool.description}
                  </p>
                </button>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("role")}
              >
                Back
              </Button>
              <Button
                onClick={handleContinueTool}
                size="lg"
              >
                Continue
              </Button>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              You can change both in your profile settings later.
            </p>
          </>
        ) : (
          <>
            <StepIndicator current="outcomes" />
            <h1 className="mb-2 text-center text-2xl font-bold">
              Here&apos;s what you&apos;ll build
            </h1>
            <p className="mb-8 text-center text-muted-foreground">
              As a {selectedRole ? ROLE_LABELS[selectedRole] : "builder"}, your
              curriculum is tailored to these outcomes:
            </p>
            <div className="space-y-3">
              {selectedRole &&
                ROLE_OUTCOMES[selectedRole].map((outcome, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card p-5"
                  >
                    <Rocket className="mt-0.5 size-5 shrink-0 text-primary" />
                    <p className="font-medium">{outcome}</p>
                  </div>
                ))}
            </div>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("tool")}
              >
                Back
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                size="lg"
              >
                {saving ? "Saving..." : "Let's start building"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
