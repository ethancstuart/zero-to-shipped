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

type PaywallVariant = "control" | "outcome" | "social";

interface VariantRow {
  signups: number;
  paid: number;
  conversion: string;
}

type VariantBreakdown = Record<PaywallVariant, VariantRow>;

interface FunnelData {
  generatedAt: string;
  allTime: FunnelStep;
  last7d: FunnelStep;
  last30d: FunnelStep;
  paywallVariants?: {
    allTime: VariantBreakdown;
    last7d: VariantBreakdown;
    last30d: VariantBreakdown;
  };
}

const VARIANT_META: Record<
  PaywallVariant,
  { label: string; copy: string; color: string }
> = {
  control: {
    label: "Control — price-led",
    copy: "Unlock Full Access — $99",
    color: "bg-slate-400",
  },
  outcome: {
    label: "Variant A — outcome",
    copy: "Start building — $99",
    color: "bg-indigo-400",
  },
  social: {
    label: "Variant B — social proof",
    copy: "Join the founding members — $99",
    color: "bg-fuchsia-400",
  },
};

function PaywallVariantSection({
  title,
  description,
  breakdown,
}: {
  title: string;
  description: string;
  breakdown: VariantBreakdown;
}) {
  const variants: PaywallVariant[] = ["control", "outcome", "social"];
  const maxConversion = Math.max(
    ...variants.map((v) => parseFloat(breakdown[v].conversion))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {variants.map((variant) => {
          const row = breakdown[variant];
          const meta = VARIANT_META[variant];
          const isLeader =
            parseFloat(row.conversion) === maxConversion &&
            maxConversion > 0;
          return (
            <div key={variant} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {meta.label}
                    </span>
                    {isLeader && (
                      <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-500">
                        leader
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    &ldquo;{meta.copy}&rdquo;
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-lg font-bold tabular-nums">
                    {row.conversion}%
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {row.paid}/{row.signups} paid
                  </div>
                </div>
              </div>
              <div className="relative h-2 overflow-hidden rounded bg-muted">
                <div
                  className={`${meta.color} h-full transition-all duration-500`}
                  style={{
                    width: `${Math.min(parseFloat(row.conversion) * 10, 100)}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
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

      {data.paywallVariants && (
        <>
          <div className="pt-6">
            <h2 className="text-xl font-bold text-foreground">
              Paywall A/B Test
            </h2>
            <p className="text-sm text-muted-foreground">
              Deterministic 3-way split by user ID. Conversion rate = paid /
              signups per variant.
            </p>
          </div>

          <PaywallVariantSection
            title="Last 7 Days"
            description="Recent paywall variant performance"
            breakdown={data.paywallVariants.last7d}
          />

          <PaywallVariantSection
            title="Last 30 Days"
            description="Monthly paywall variant performance"
            breakdown={data.paywallVariants.last30d}
          />

          <PaywallVariantSection
            title="All Time"
            description="Lifetime paywall variant performance"
            breakdown={data.paywallVariants.allTime}
          />
        </>
      )}
    </div>
  );
}
