"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

export function PremiumGateTracker({
  moduleNumber,
  moduleTitle,
}: {
  moduleNumber: number;
  moduleTitle: string;
}) {
  useEffect(() => {
    track("premium_gate_hit", {
      module_number: moduleNumber,
      module_title: moduleTitle,
    });
  }, [moduleNumber, moduleTitle]);

  return null;
}
