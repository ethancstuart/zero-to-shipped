import { describe, it, expect } from 'vitest';
import { MCP_PLUGINS, CATEGORY_LABELS } from '@/data/mcp-plugins';
import type { MCPCategory } from '@/data/mcp-plugins';

const validCategories = Object.keys(CATEGORY_LABELS) as MCPCategory[];

describe('MCP_PLUGINS', () => {
  it('all plugins have required fields', () => {
    for (const plugin of MCP_PLUGINS) {
      expect(plugin.name).toBeTruthy();
      expect(plugin.slug).toBeTruthy();
      expect(plugin.category).toBeTruthy();
      expect(plugin.description).toBeTruthy();
      expect(plugin.url).toBeTruthy();
      expect(plugin.installCommand).toBeTruthy();
    }
  });

  it('all slugs are unique', () => {
    const slugs = MCP_PLUGINS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('all categories are valid MCPCategory values', () => {
    for (const plugin of MCP_PLUGINS) {
      expect(validCategories).toContain(plugin.category);
    }
  });

  it('all URLs start with https://', () => {
    for (const plugin of MCP_PLUGINS) {
      expect(plugin.url).toMatch(/^https:\/\//);
    }
  });

  it('verified plugins have a lastVerified date', () => {
    const verified = MCP_PLUGINS.filter((p) => p.verified);
    expect(verified.length).toBeGreaterThan(0);
    for (const plugin of verified) {
      expect(plugin.lastVerified).toBeTruthy();
      // Check it looks like a date (YYYY-MM-DD)
      expect(plugin.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
