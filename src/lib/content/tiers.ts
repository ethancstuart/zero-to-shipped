// Content tier definitions
// Free: Modules 1-5 (Foundations) — enough to learn basics and get hooked
// Premium: Modules 6-16 — intermediate, advanced, capstone

export const FREE_MODULES = [1, 2, 3, 4, 5] as const;
export const PREMIUM_MODULES = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] as const;

export function isFreeTier(moduleNumber: number): boolean {
  return moduleNumber >= 1 && moduleNumber <= 5;
}

export function isPremiumTier(moduleNumber: number): boolean {
  return moduleNumber >= 6 && moduleNumber <= 16;
}

export function canAccessModule(
  moduleNumber: number,
  subscriptionTier: "free" | "premium"
): boolean {
  if (subscriptionTier === "premium") return true;
  return isFreeTier(moduleNumber);
}
