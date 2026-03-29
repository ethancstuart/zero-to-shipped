import { describe, it, expect } from 'vitest';
import {
  LEVELS,
  BADGES,
  getLevelForXP,
  getXPProgress,
  getBadgeBySlug,
} from '@/lib/gamification/constants';

describe('getLevelForXP', () => {
  it('returns Novice for 0 XP', () => {
    expect(getLevelForXP(0)).toEqual(expect.objectContaining({ level: 1, title: 'Novice' }));
  });

  it('returns Novice for 499 XP', () => {
    expect(getLevelForXP(499)).toEqual(expect.objectContaining({ level: 1, title: 'Novice' }));
  });

  it('returns Builder for 500 XP', () => {
    expect(getLevelForXP(500)).toEqual(expect.objectContaining({ level: 2, title: 'Builder' }));
  });

  it('returns Builder for 1199 XP', () => {
    expect(getLevelForXP(1199)).toEqual(expect.objectContaining({ level: 2, title: 'Builder' }));
  });

  it('returns Shipper for 1200 XP', () => {
    expect(getLevelForXP(1200)).toEqual(expect.objectContaining({ level: 3, title: 'Shipper' }));
  });

  it('returns Shipper for 1999 XP', () => {
    expect(getLevelForXP(1999)).toEqual(expect.objectContaining({ level: 3, title: 'Shipper' }));
  });

  it('returns Master for 2000+ XP', () => {
    expect(getLevelForXP(2000)).toEqual(expect.objectContaining({ level: 4, title: 'Master' }));
    expect(getLevelForXP(9999)).toEqual(expect.objectContaining({ level: 4, title: 'Master' }));
  });
});

describe('getXPProgress', () => {
  it('returns 0% progress at start of a level', () => {
    const result = getXPProgress(0);
    expect(result.current.level).toBe(1);
    expect(result.next?.level).toBe(2);
    expect(result.progressPercent).toBe(0);
  });

  it('returns 50% progress at midpoint of level 1', () => {
    const result = getXPProgress(250);
    expect(result.progressPercent).toBe(50);
  });

  it('returns 100% for max level with no next level', () => {
    const result = getXPProgress(2000);
    expect(result.current.level).toBe(4);
    expect(result.next).toBeNull();
    expect(result.progressPercent).toBe(100);
  });

  it('returns correct progress within level 2', () => {
    // Level 2: 500-1199 (range 700)
    const result = getXPProgress(850);
    expect(result.current.level).toBe(2);
    expect(result.next?.level).toBe(3);
    expect(result.progressPercent).toBe(50);
  });
});

describe('getBadgeBySlug', () => {
  it('returns correct badge for valid slug', () => {
    const badge = getBadgeBySlug('first-checkpoint');
    expect(badge).toBeDefined();
    expect(badge?.name).toBe('First Step');
  });

  it('returns undefined for invalid slug', () => {
    expect(getBadgeBySlug('nonexistent')).toBeUndefined();
  });
});

describe('BADGES', () => {
  it('all slugs are unique', () => {
    const slugs = BADGES.map((b) => b.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('LEVELS', () => {
  it('levels are in ascending XP order', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].xpRequired).toBeGreaterThan(LEVELS[i - 1].xpRequired);
    }
  });
});
