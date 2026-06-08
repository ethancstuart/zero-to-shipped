# Core Web Vitals Baseline

**Date:** 2026-06-08
**Target site:** https://zerotoship.app

## Target Metrics (Lighthouse CI assertions)

| Metric | Target | Status |
|--------|--------|--------|
| Performance score | ≥ 75 (warn) | TBD |
| Accessibility score | ≥ 90 (error) | TBD |
| Best Practices score | ≥ 85 (warn) | TBD |
| SEO score | ≥ 90 (error) | TBD |
| Cumulative Layout Shift | ≤ 0.1 (error) | TBD |
| Total Blocking Time | ≤ 500ms (warn) | TBD |
| Largest Contentful Paint | ≤ 2.5s (target) | TBD |
| First Contentful Paint | ≤ 1.8s (target) | TBD |
| Interaction to Next Paint | ≤ 200ms (target) | TBD |

## Pages Audited

- `/` — homepage with generative mesh + GSAP
- `/pulse` — pillar hub with filterable grid
- `/learn` — pillar hub with numbered learning path
- `/tools` — tools directory with filter

## How to Run

```bash
# Local
npm run build
npm run lhci

# Results saved to .lighthouseci/
```

## Notes

- Generative mesh canvas may impact performance score on homepage — accept up to a 10pt drop
- GSAP animations contribute to TBT — bias toward "swap" font display and lazy GSAP imports if score falls below target
- CLS should remain near 0 — we use explicit dimensions on hero, mesh canvas is fixed positioned
- Mobile testing requires a separate run with `--preset=mobile` Lighthouse flag
