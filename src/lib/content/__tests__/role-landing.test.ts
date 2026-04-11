import { describe, expect, it } from "vitest";
import {
  ROLE_LANDING_CONFIGS,
  ROLE_LANDING_SLUGS,
  getRoleLandingConfig,
  getRoleLandingSlugByRoleKey,
} from "../role-landing";
import { ROLE_LABELS } from "@/lib/constants";

describe("ROLE_LANDING_CONFIGS", () => {
  it("has exactly 4 role landing pages", () => {
    expect(ROLE_LANDING_SLUGS.length).toBe(4);
  });

  it("every slug maps to its own config", () => {
    for (const slug of ROLE_LANDING_SLUGS) {
      expect(ROLE_LANDING_CONFIGS[slug].slug).toBe(slug);
    }
  });

  it("every config points at a real role key from ROLE_LABELS", () => {
    const validKeys = new Set(Object.keys(ROLE_LABELS));
    for (const slug of ROLE_LANDING_SLUGS) {
      expect(validKeys.has(ROLE_LANDING_CONFIGS[slug].roleKey)).toBe(true);
    }
  });

  it("every config has required copy fields populated", () => {
    for (const slug of ROLE_LANDING_SLUGS) {
      const c = ROLE_LANDING_CONFIGS[slug];
      expect(c.title).toBeTruthy();
      expect(c.metaDescription).toBeTruthy();
      expect(c.heroHeadline).toBeTruthy();
      expect(c.heroSubheadline).toBeTruthy();
      expect(c.heroCtaLabel).toBeTruthy();
      expect(c.roleSingular).toBeTruthy();
      expect(c.rolePlural).toBeTruthy();
    }
  });

  it("every config has at least 3 pain points, 4 outcomes, 3 curriculum highlights, 3 FAQ", () => {
    for (const slug of ROLE_LANDING_SLUGS) {
      const c = ROLE_LANDING_CONFIGS[slug];
      expect(c.painPoints.length).toBeGreaterThanOrEqual(3);
      expect(c.outcomes.length).toBeGreaterThanOrEqual(4);
      expect(c.curriculumHighlights.length).toBeGreaterThanOrEqual(3);
      expect(c.faq.length).toBeGreaterThanOrEqual(3);
      expect(c.targetQueries.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("meta descriptions are within SEO length sweet spot (120-180 chars)", () => {
    for (const slug of ROLE_LANDING_SLUGS) {
      const desc = ROLE_LANDING_CONFIGS[slug].metaDescription;
      expect(desc.length).toBeGreaterThanOrEqual(120);
      expect(desc.length).toBeLessThanOrEqual(180);
    }
  });

  it("curriculum highlights reference valid module numbers (1-16)", () => {
    for (const slug of ROLE_LANDING_SLUGS) {
      for (const mod of ROLE_LANDING_CONFIGS[slug].curriculumHighlights) {
        expect(mod.moduleNumber).toBeGreaterThanOrEqual(1);
        expect(mod.moduleNumber).toBeLessThanOrEqual(16);
      }
    }
  });
});

describe("getRoleLandingConfig", () => {
  it("returns config for valid slugs", () => {
    for (const slug of ROLE_LANDING_SLUGS) {
      expect(getRoleLandingConfig(slug)).toBeDefined();
    }
  });

  it("returns undefined for unknown slugs", () => {
    expect(getRoleLandingConfig("engineers")).toBeUndefined();
    expect(getRoleLandingConfig("")).toBeUndefined();
    expect(getRoleLandingConfig("product-manager")).toBeUndefined();
  });
});

describe("getRoleLandingSlugByRoleKey", () => {
  it("maps every ROLE_LABELS key to a valid landing slug", () => {
    for (const key of Object.keys(ROLE_LABELS) as (keyof typeof ROLE_LABELS)[]) {
      const slug = getRoleLandingSlugByRoleKey(key);
      expect(ROLE_LANDING_SLUGS).toContain(slug);
    }
  });

  it("is invertible — slug → config → key round-trips", () => {
    for (const key of Object.keys(ROLE_LABELS) as (keyof typeof ROLE_LABELS)[]) {
      const slug = getRoleLandingSlugByRoleKey(key);
      expect(ROLE_LANDING_CONFIGS[slug].roleKey).toBe(key);
    }
  });
});
