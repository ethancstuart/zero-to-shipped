/**
 * Paywall A/B test — 3-variant split on the in-module premium gate.
 *
 * Variants:
 *  - control: price-led (current production copy, kept as baseline)
 *  - outcome: outcome-led ("Ship your first AI app this week")
 *  - social:  social-proof ("Join the founding members")
 *
 * Assignment is deterministic per user.id so:
 *  - same user always sees the same variant (no flicker across sessions)
 *  - server-side render has no flash-of-unhashed-content
 *  - funnel backend can re-derive the variant for any paid user
 *
 * Hash: DJB2-style 32-bit, mod 3 for equal bucket distribution. Not cryptographic.
 */

export const PAYWALL_VARIANTS = ["control", "outcome", "social"] as const;
export type PaywallVariant = (typeof PAYWALL_VARIANTS)[number];

export function getPaywallVariant(userId: string): PaywallVariant {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0; // force 32-bit
  }
  const bucket = Math.abs(hash) % PAYWALL_VARIANTS.length;
  return PAYWALL_VARIANTS[bucket];
}

interface PaywallVariantCopy {
  /** One-line hook shown directly above the CTA button. Varies the pitch angle. */
  hook: string;
  /** Button label on the primary CTA. */
  ctaLabel: string;
}

export const PAYWALL_VARIANT_COPY: Record<PaywallVariant, PaywallVariantCopy> = {
  control: {
    hook: "One-time payment. Lifetime access. No subscription.",
    ctaLabel: "Unlock Full Access — $99",
  },
  outcome: {
    hook: "Ship your first real AI-built app. 16 modules, one capstone.",
    ctaLabel: "Start building — $99",
  },
  social: {
    hook: "Join PMs, BAs, and PjMs already shipping real work with AI.",
    ctaLabel: "Join the founding members — $99",
  },
};
