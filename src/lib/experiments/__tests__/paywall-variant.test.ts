import { describe, expect, it } from "vitest";
import {
  PAYWALL_VARIANTS,
  PAYWALL_VARIANT_COPY,
  getPaywallVariant,
} from "../paywall-variant";

describe("getPaywallVariant", () => {
  it("returns one of the 3 variants for any input", () => {
    const v = getPaywallVariant("user-abc-123");
    expect(PAYWALL_VARIANTS).toContain(v);
  });

  it("is deterministic — same id always returns same variant", () => {
    const ids = [
      "00000000-0000-0000-0000-000000000001",
      "user-ethan",
      "🦄-emoji-id",
      "a".repeat(64),
    ];
    for (const id of ids) {
      const first = getPaywallVariant(id);
      for (let i = 0; i < 20; i++) {
        expect(getPaywallVariant(id)).toBe(first);
      }
    }
  });

  it("distributes roughly evenly across 3 buckets (within 15% of uniform)", () => {
    const buckets: Record<string, number> = {
      control: 0,
      outcome: 0,
      social: 0,
    };
    const N = 3_000;
    for (let i = 0; i < N; i++) {
      // Use UUID-like ids so the distribution is realistic
      const id = `user-${i}-${(i * 7919).toString(16)}`;
      buckets[getPaywallVariant(id)]++;
    }
    const expected = N / 3;
    const tolerance = expected * 0.15;
    for (const variant of PAYWALL_VARIANTS) {
      expect(buckets[variant]).toBeGreaterThan(expected - tolerance);
      expect(buckets[variant]).toBeLessThan(expected + tolerance);
    }
  });

  it("treats different ids as different buckets (some divergence expected)", () => {
    // Sanity: the hash actually splits — not all ids map to one variant
    const seen = new Set<string>();
    for (let i = 0; i < 100; i++) {
      seen.add(getPaywallVariant(`id-${i}`));
    }
    expect(seen.size).toBe(3);
  });
});

describe("PAYWALL_VARIANT_COPY", () => {
  it("has copy for every variant", () => {
    for (const variant of PAYWALL_VARIANTS) {
      expect(PAYWALL_VARIANT_COPY[variant]).toBeDefined();
      expect(PAYWALL_VARIANT_COPY[variant].hook).toBeTruthy();
      expect(PAYWALL_VARIANT_COPY[variant].ctaLabel).toBeTruthy();
    }
  });

  it("CTA labels all reference the $99 price so the anchor stays visible", () => {
    for (const variant of PAYWALL_VARIANTS) {
      expect(PAYWALL_VARIANT_COPY[variant].ctaLabel).toContain("$99");
    }
  });
});
