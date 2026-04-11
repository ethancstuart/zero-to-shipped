"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { PaywallVariant } from "@/lib/experiments/paywall-variant";

export function CheckoutButton({
  tier,
  label,
  source,
  variant,
  moduleNumber,
}: {
  tier: "full_access" | "extras";
  label: string;
  /** Where this button is rendered. Used to attribute A/B conversions. */
  source?: "pricing_page" | "premium_gate";
  /** The paywall A/B variant the user is in. Only meaningful when source="premium_gate". */
  variant?: PaywallVariant;
  /** Module the gate is guarding. Only meaningful when source="premium_gate". */
  moduleNumber?: number;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);

    if (source === "premium_gate" && variant) {
      track("paywall_cta_click", {
        tier,
        variant,
        module_number: moduleNumber ?? 0,
      });
    } else {
      track("checkout_click", { tier, source: source ?? "unknown" });
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please sign in first to purchase.");
      router.push("/");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Button className="w-full" onClick={handleCheckout} disabled={loading}>
      {loading ? "Redirecting..." : label}
    </Button>
  );
}
