import { describe, it, expect } from 'vitest';
import { TEMPLATES } from '@/lib/library/templates';

describe('TEMPLATES', () => {
  it('all templates have required fields', () => {
    for (const t of TEMPLATES) {
      expect(t.id).toBeTruthy();
      expect(t.title).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.stack).toBeTruthy();
      expect(t.content).toBeTruthy();
      expect(typeof t.free).toBe('boolean');
    }
  });

  it('all ids are unique', () => {
    const ids = TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has exactly 4 templates', () => {
    expect(TEMPLATES.length).toBe(4);
  });

  it('exactly 1 free template (Blank Canvas)', () => {
    const free = TEMPLATES.filter((t) => t.free);
    expect(free.length).toBe(1);
    expect(free[0].id).toBe('blank-canvas');
  });

  it('all template content is non-trivial (at least 100 chars)', () => {
    for (const t of TEMPLATES) {
      expect(t.content.length).toBeGreaterThan(100);
    }
  });
});
