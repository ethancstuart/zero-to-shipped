"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ADMIN_EMAIL = "ethan@zerotoship.app";
const REFRESH_INTERVAL = 60_000; // 1 minute

interface FunnelStep {
  signups: number;
  started: number;
  module1Completed: number;
  module5Completed: number;
  paid: number;
  rates: {
    signupToStarted: string;
    startedToMod1: string;
    mod1ToMod5: string;
    mod5ToPaid: string;
    overallSignupToPaid: string;
  };
}

interface FunnelData {
  generatedAt: string;
  allTime: FunnelStep;
  last7d: FunnelStep;
  last30d: FunnelStep;
}

const STEP_LABELS = [
  { key: "signups" as const, label: "Signups", color: "bg-blue-500" },
  { key: "started" as const, label: "Module 1 Started", color: "bg-blue-400" },
  { key: "module1Completed" as const, label: "Module 1 Completed", color: "bg-cyan-400" },
  { key: "module5Completed" as const, label: "Module 5 Completed", color: "bg-emerald-400" },
  { key: "paid" as const, label: "Paid", color: "bg-green-400" },
];

const RATE_LABELS: { key: keyof FunnelStep["rates"]; label: string }[] = [
  { key: "signupToStarted", label: "Signup -> Started" },
  { key: "startedToMod1", label: "Started -> Mod 1 Done" },
  { key: "mod1ToMod5", label: "Mod 1 -> Mod 5 Done" },
  { key: "mod5ToPaid", label: "Mod 5 -> Paid" },
  { key: "overallSignupToPaid", label: "Signup -> Paid (overall)" },
];

function FunnelBar({ step, maxValue }: { step: FunnelStep; maxValue: number }) {
  return (
    <div className="space-y-2">
      {STEP_LABELS.map(({ key, label, color }) => {
        const value = step[key];
        const width = maxValue > 0 ? Math.max((value / maxValue) * 100, 2) : 2;
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="w-40 shrink-0 text-right text-xs text-muted-foreground">
              {label}
            </span>
            <div className="flex-1 relative">
              <div
                className={`${color} h-7 rounded transition-all duration-500`}
                style={{ width: `${width}%` }}
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow-sm">
                {value.toLocaleString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ConversionRates({ rates }: { rates: FunnelStep["rates"] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {RATE_LABELS.map(({ key, label }) => (
        <div
          key={key}
          className="rounded-lg border border-foreground/10 bg-muted/30 p-3 text-center"
        >
          <div className="text-lg font-bold tabular-nums text-foreground">
            {rates[key]}%
          </div>
          <div className="mt-1 text-[10px] leading-tight text-muted-foreground">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

function FunnelSection({
  title,
  description,
  step,
}: {
  title: string;
  description: string;
  step: FunnelStep;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FunnelBar step={step} maxValue={step.signups} />
        <ConversionRates rates={step.rates} />
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export default function FunnelPage() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFunnel = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics/funnel");
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch funnel data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check admin auth
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email === ADMIN_EMAIL) {
        setAuthorized(true);
        fetchFunnel();
      } else {
        setAuthorized(false);
        setLoading(false);
      }
    });
  }, [fetchFunnel]);

  // Auto-refresh
  useEffect(() => {
    if (!authorized) return;
    const interval = setInterval(fetchFunnel, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [authorized, fetchFunnel]);

  if (loading) return <LoadingSkeleton />;

  if (authorized === false) {
    return (
      <div className="mx-auto max-w-4xl py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="mt-2 text-muted-foreground">
          This page is restricted to administrators.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl py-20 text-center">
        <h1 className="text-2xl font-bold text-destructive">Error</h1>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <button
          onClick={fetchFunnel}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Conversion Funnel</h1>
          <p className="text-sm text-muted-foreground">
            {"Signup -> Started -> Module 1 -> Module 5 -> Paid"}
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div>Auto-refreshes every 60s</div>
          <div>
            Last updated:{" "}
            {new Date(data.generatedAt).toLocaleTimeString()}
          </div>
        </div>
      </div>

      <FunnelSection
        title="Last 7 Days"
        description="Recent conversion performance"
        step={data.last7d}
      />

      <FunnelSection
        title="Last 30 Days"
        description="Monthly conversion trends"
        step={data.last30d}
      />

      <FunnelSection
        title="All Time"
        description="Lifetime funnel metrics"
        step={data.allTime}
      />
    </div>
  );
}
