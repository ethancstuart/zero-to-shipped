---
name: brand-guidelines
description: >
  Auto-apply Zero to Ship brand identity to all UI work. Trigger when building course
  pages, components, landing sections, or any visual element. Ensures consistent blue
  accent, shadcn/ui patterns, and educational tone.
---

# Zero to Ship Brand Guidelines

You are building UI for **Zero to Ship — Build with AI, No Engineering Degree Required**.
A gamified learning platform for PMs, Project Managers, BAs, and BI Engineers. Apply without exception.

## Brand Personality
- **Empowering, educational, hands-on**
- Gamified and rewarding (XP, streaks, skill trees, certificates)
- Practical and project-focused — teaches real product building
- Approachable for non-engineers, but technically credible
- Claude Code is the featured AI tool

## Colors

### Dark Mode (Default)
| Token | Value | Use |
|-------|-------|-----|
| Background | `#0A0A0A` | Page background |
| Foreground | `#FAFAFA` | Primary text |
| Card | `#141414` | Card/panel backgrounds |
| Primary / Accent | `#3B82F6` | Interactive elements (BLUE) |
| Primary Foreground | `#FFFFFF` | Text on primary |
| Secondary | `#171717` | Secondary backgrounds |
| Muted | `#171717` | Disabled/muted backgrounds |
| Muted Foreground | `#A3A3A3` | Secondary text |
| Border | `#262626` | Borders and dividers |
| Destructive | `#EF4444` | Error/danger |
| Ring | `#3B82F6` | Focus rings |

### Light Mode
| Token | Value | Use |
|-------|-------|-----|
| Background | `#FAFAFA` | Page background |
| Foreground | `#0A0A0A` | Primary text |
| Card | `#FFFFFF` | Card backgrounds |
| Primary / Accent | `#2563EB` | Interactive elements (deeper blue) |
| Muted Foreground | `#737373` | Secondary text |
| Border | `#E5E5E5` | Borders |

### Chart Colors (Dark)
`#3B82F6`, `#60A5FA`, `#2563EB`, `#93C5FD`, `#1D4ED8`

## Typography
| Role | Font | Notes |
|------|------|-------|
| Body / Headings | **Inter** | Primary sans-serif, all weights |
| Code / Data | **JetBrains Mono** | For code blocks, badges, technical content |

- Font smoothing: antialiased
- Prose styling via `@tailwindcss/typography`
- Code highlighting: Shiki (light/dark theme switching)

## Component Rules
- Built on **shadcn/ui (base-nova style)** — always use shadcn patterns
- Cards: border-based, white (light) / `#141414` (dark)
- Buttons: primary (solid blue fill), secondary (border), ghost (text)
- Tags/badges: pill-shaped, consistent with shadcn conventions
- Toast notifications via Sonner
- Border radius: base 0.625rem (10px), scaled via calc()

## Spacing
- Base radius: 0.625rem
- Scale: sm (0.375rem) → md (0.5rem) → lg (0.625rem) → xl (0.875rem) → 2xl (1.125rem)

## Motion
- Staggered fade-in for grid children (0-300ms delays)
- Entry animation: 0.5s ease-out, opacity + translate-y
- Theme toggle transitions
- Framer Motion for orchestrated sequences

## Technical Context
- Framework: Next.js 16 + React 19 + Tailwind v4
- Components: shadcn/ui v4 (base-nova)
- Theme: next-themes with class-based dark mode (default: dark)
- Animation: Framer Motion + tw-animate-css
- Content: Shiki code highlighting, tool-specific content visibility

## Tool-Specific Content
- `[data-tool="cursor"]` and `[data-tool="claude-code"]` — content toggles
- Shown conditionally via `[data-tool-active="tool-name"]`
- Always support both Cursor and Claude Code paths

## Never Do
- Use any accent color other than blue (#3B82F6 dark / #2563EB light)
- Break shadcn/ui patterns — extend, don't replace
- Use heavy shadows instead of borders
- Make the learning experience feel corporate or intimidating
- Forget code block styling — Shiki is the standard, not raw `<pre>`
