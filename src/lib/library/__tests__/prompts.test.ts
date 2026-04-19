import { describe, it, expect } from 'vitest';
import { PROMPTS, CATEGORY_LABELS } from '@/lib/library/prompts';
import type { PromptCategory } from '@/lib/library/prompts';

const validCategories = Object.keys(CATEGORY_LABELS) as PromptCategory[];

describe('PROMPTS', () => {
  it('all prompts have required fields', () => {
    for (const prompt of PROMPTS) {
      expect(prompt.id).toBeTruthy();
      expect(prompt.title).toBeTruthy();
      expect(prompt.description).toBeTruthy();
      expect(prompt.category).toBeTruthy();
      expect(prompt.prompt).toBeTruthy();
      expect(typeof prompt.free).toBe('boolean');
    }
  });

  it('all ids are unique', () => {
    const ids = PROMPTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all categories are valid PromptCategory values', () => {
    for (const prompt of PROMPTS) {
      expect(validCategories).toContain(prompt.category);
    }
  });

  it('has at least 40 prompts', () => {
    expect(PROMPTS.length).toBeGreaterThanOrEqual(40);
  });

  it('build category has 12 prompts with first 6 free', () => {
    const build = PROMPTS.filter((p) => p.category === 'build');
    expect(build.length).toBe(12);
    const free = build.filter((p) => p.free);
    expect(free.length).toBe(6);
  });

  it('debug category has 8 prompts with first 4 free', () => {
    const debug = PROMPTS.filter((p) => p.category === 'debug');
    expect(debug.length).toBe(8);
    const free = debug.filter((p) => p.free);
    expect(free.length).toBe(4);
  });

  it('refactor and ship categories have no free prompts', () => {
    const gatedCategories: PromptCategory[] = ['refactor', 'ship'];
    for (const cat of gatedCategories) {
      const free = PROMPTS.filter((p) => p.category === cat && p.free);
      expect(free.length).toBe(0);
    }
  });

  it('think category has exactly 1 free prompt (brainstorm)', () => {
    const free = PROMPTS.filter((p) => p.category === 'think' && p.free);
    expect(free.length).toBe(1);
    expect(free[0].id).toBe('think-brainstorm');
  });

  it('pm category has exactly 1 free prompt (prd)', () => {
    const free = PROMPTS.filter((p) => p.category === 'pm' && p.free);
    expect(free.length).toBe(1);
    expect(free[0].id).toBe('pm-prd');
  });

  it('exactly 12 free prompts total', () => {
    const free = PROMPTS.filter((p) => p.free);
    expect(free.length).toBe(12);
  });
});
