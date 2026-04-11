"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";
import type { PaywallVariant } from "@/lib/experiments/paywall-variant";

export function PremiumGateTracker({
  moduleNumber,
  moduleTitle,
  variant,
}: {
  moduleNumber: number;
  moduleTitle: string;
  variant: PaywallVariant;
}) {
  useEffect(() => {
    track("premium_gate_hit", {
      module_number: moduleNumber,
      module_title: moduleTitle,
      variant,
    });
    track("paywall_variant_shown", {
      module_number: moduleNumber,
      variant,
    });
  }, [moduleNumber, moduleTitle, variant]);

  return null;
}
