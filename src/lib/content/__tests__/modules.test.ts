import { describe, it, expect } from 'vitest';
import { MODULE_METADATA, getModuleBySlug } from '@/lib/content/modules';
import type { ModuleTier, RoleTrack } from '@/types';

describe('MODULE_METADATA', () => {
  it('has exactly 16 modules', () => {
    expect(MODULE_METADATA).toHaveLength(16);
  });

  it('module numbers are sequential 1-16', () => {
    const numbers = MODULE_METADATA.map((m) => m.number);
    expect(numbers).toEqual(Array.from({ length: 16 }, (_, i) => i + 1));
  });

  it('all slugs are unique', () => {
    const slugs = MODULE_METADATA.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('all modules have valid tier values', () => {
    const validTiers: ModuleTier[] = ['foundations', 'intermediate', 'advanced', 'capstone'];
    for (const mod of MODULE_METADATA) {
      expect(validTiers).toContain(mod.tier);
    }
  });

  it('all modules have at least one checkpoint', () => {
    for (const mod of MODULE_METADATA) {
      expect(mod.checkpoints.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('all modules have valid roleRelevance entries', () => {
    const validRoles: RoleTrack[] = ['pm', 'pjm', 'ba', 'bi'];
    const validValues = ['core', 'recommended', 'optional'];
    for (const mod of MODULE_METADATA) {
      for (const role of validRoles) {
        expect(validValues).toContain(mod.roleRelevance[role]);
      }
    }
  });
});

describe('getModuleBySlug', () => {
  it('returns correct module', () => {
    const mod = getModuleBySlug('setup-and-first-build');
    expect(mod).toBeDefined();
    expect(mod?.number).toBe(1);
    expect(mod?.title).toBe('Setup & First Build');
  });

  it('returns undefined for invalid slug', () => {
    expect(getModuleBySlug('nonexistent-module')).toBeUndefined();
  });
});
