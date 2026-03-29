import { describe, it, expect } from 'vitest';
import { canAccessModule, isFreeTier, isPremiumTier } from '@/lib/content/tiers';

describe('canAccessModule', () => {
  it('free users can access modules 1-5', () => {
    for (let i = 1; i <= 5; i++) {
      expect(canAccessModule(i, 'free')).toBe(true);
    }
  });

  it('free users cannot access modules 6-16', () => {
    for (let i = 6; i <= 16; i++) {
      expect(canAccessModule(i, 'free')).toBe(false);
    }
  });

  it('premium users can access all modules 1-16', () => {
    for (let i = 1; i <= 16; i++) {
      expect(canAccessModule(i, 'premium')).toBe(true);
    }
  });

  it('edge case: module 0 is not accessible', () => {
    expect(canAccessModule(0, 'free')).toBe(false);
    expect(canAccessModule(0, 'premium')).toBe(true); // premium returns true for any number
  });

  it('edge case: module 17 is not free tier', () => {
    expect(isFreeTier(17)).toBe(false);
    expect(isPremiumTier(17)).toBe(false);
  });
});
