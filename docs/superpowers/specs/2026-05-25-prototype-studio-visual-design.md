# Prototype Studio — Visual Design Spec

**Status:** Approved (with Council + Masthead review amendments)  
**Date:** 2026-05-25  
**Scope:** Full visual overhaul — design system, motion, all pages

## Design Direction

Light editorial + system synthesis. White, fresh, marketing-friendly, not intimidating. High-craft kinetic editorial motion at the obys-2 / phantom.land level. Both light and dark themes fully designed at launch.

**Core identity:** "Learn to build with AI." Everything else (tool tracking, agent OS, showcase) supports the learning mission.

**Audience tone:** Soften for non-technical users (PMs, analysts, builders). Monospace reserved for data contexts only — not used as brand identity on marketing surfaces.

**NOT:** generic SaaS minimalism, dark hacker aesthetic, gimmicky 3D (no bruno-simon).

## Typography

| Role | Font | Weights | Usage |
|------|------|---------|-------|
| Display | Space Grotesk | 300, 600 | Hero headlines, page titles |
| Body | DM Sans | 300, 400, 500 | Prose, descriptions, card copy |
| System | JetBrains Mono | 300, 400 | Labels, metadata, code, version badges |

### Type Scale

| Token | Size | Weight | Font |
|-------|------|--------|------|
| `--text-display` | clamp(56px, 9vw, 100px) | 300/600 | Space Grotesk |
| `--text-h1` | 36px | 600 | Space Grotesk |
| `--text-h2` | 28px | 300 | Space Grotesk |
| `--text-h3` | 20px | 500 | Space Grotesk |
| `--text-body` | 15px | 400 | DM Sans |
| `--text-small` | 13px | 400 | DM Sans |
| `--text-caption` | 11px | 400 | JetBrains Mono |
| `--text-micro` | 10px | 400 | JetBrains Mono |

### Monospace Usage (Review Amendment)

JetBrains Mono is **data-only**: code blocks, version badges, timestamps, the `// prototype.studio` hero signature, and stats/metrics. Pillar labels, nav logo, footer headings, pills, and section labels use DM Sans with letter-spacing tracking instead. This keeps the system aesthetic without alienating non-technical visitors.

## Color System

### Core Tokens

| Token | Light | Dark |
|-------|-------|------|
| `--bg` | `#ffffff` | `#0a0a0a` |
| `--bg-subtle` | `#fafaf8` | `#111111` |
| `--bg-muted` | `#f5f5f3` | `#1a1a1a` |
| `--fg` | `#1a1a1a` | `#fafafa` |
| `--fg-secondary` | `#666666` | `#999999` |
| `--fg-muted` | `#999999` | `#666666` |
| `--fg-faint` | `#cccccc` | `#333333` |
| `--border` | `#f0f0f0` | `#1f1f1f` |
| `--border-hover` | `#dddddd` | `#333333` |
| `--accent` | `#3b82f6` | `#60a5fa` |

### Pillar Colors

| Pillar | Surface Light | Border Light | Text | Surface Dark | Border Dark |
|--------|-------------|-------------|------|-------------|-------------|
| Pulse | `#f8faff` | `#e0ecff` | `#3b82f6` | `#0d1520` | `#1e3a5f` |
| Build | `#fffbf5` | `#f5edd8` | `#d97706` | `#1a1408` | `#3d2e0a` |
| Learn | `#f0fdf4` | `#d1fae5` | `#059669` | `#081f14` | `#0d3b25` |
| System | `#faf5ff` | `#ede5ff` | `#7c3aed` | `#150d20` | `#2d1a4e` |

### Spacing

4px base: 4, 8, 12, 16, 24, 32, 40, 60, 80, 120, 160, 200, 240

### Radius

6px (pills), 8px (buttons, code), 10px (cards), 12px (large cards), 16px (bento tiles, modals)

### Shadows (light mode; dark uses border glow)

- `--shadow-sm`: `0 2px 8px rgba(0,0,0,0.03)`
- `--shadow-md`: `0 8px 24px rgba(0,0,0,0.04)`
- `--shadow-lg`: `0 16px 48px rgba(0,0,0,0.06)`

## Texture & Ambient

- **Grain overlay**: CSS SVG noise filter at 2-2.5% opacity over all backgrounds. Fixed position, pointer-events none.
- **Gradient washes**: Subtle radial gradient on hero (white → warm off-white). Full-bleed gradient breaks between major sections using pillar colors.
- **Ambient dots**: Faint blue dots floating with parallax in hero area. 3-5 dots, 8s cycle, max 0.3 opacity.
- **Decorative dot grid**: 5x5 grid of 3px dots at 15% opacity in hero area, upper right.

## Motion System

### Entrance Animations

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Hero words | Mask reveal (translateY 105% → 0) | 900ms | cubic-bezier(0.16, 1, 0.3, 1) |
| Hero subtitle/CTA | Fade + slide up 20px | 800ms | ease-out |
| Section dividers | Fade + slide up 30px | 800ms | ease-out |
| Cards (staggered) | Fade + slide up 40px, 120ms stagger | 600ms | cubic-bezier(0.16, 1, 0.3, 1) |
| Bento tiles | Fade + slide up 30px, 100ms stagger | 600ms | cubic-bezier(0.16, 1, 0.3, 1) |
| Gradient break text | Fade + slide up 30px | 1000ms | cubic-bezier(0.16, 1, 0.3, 1) |

All entrance animations are scroll-triggered via GSAP ScrollTrigger (replaces custom IntersectionObserver code and Framer Motion for scroll-driven work).

### Interactive Motion

| Element | Effect |
|---------|--------|
| Cursor spotlight | 600px radial gradient (accent at 4% opacity), follows mouse, 100ms ease-out |
| Card hover | translateY(-4px) + rotateX(2deg) + rotateY(-1deg) + shadow-md, 400ms |
| Button magnetic | Translates toward cursor (0.12x distance), resets on mouseleave |
| Button ripple | Expanding circle from click point (rgba white 10%), 400ms |
| Nav link hover | Letter-spacing 0→0.5px + color darken, 300ms |
| Pillar dot pulse | Scale 1→1.3, opacity 0.6→1, 3s infinite |
| Scroll indicator | 1px line with dark fill animating top-to-bottom, 2s infinite |

### Scroll-Driven

| Feature | Behavior |
|---------|----------|
| Scroll-pinned pillars | Section height 400vh, sticky inner. Scroll progress maps to 4 pillar states. Tabs highlight, detail cards swap with fade+slide, stats count up on each transition. **Progress dots** (4 dots, one per pillar) fixed on right edge showing current state. |
| Number theater | Digits scramble randomly for first 40% of animation, then ease to target. 1200ms duration. Triggered by IntersectionObserver. |
| Parallax | Decorative elements at 0.5x-0.8x scroll speed. Content at 1x. |
| Section color transitions | Background gradient shifts between sections using pillar tints |

### Page Transitions

View Transitions API for route changes. Shared element animation: content card → detail page (card expands, pillar color spreads).

## Generative Hero Background

Canvas-based dot mesh grid (20x14 points, 60px spacing). Lines connect adjacent dots. Mouse proximity (250px radius) warps points toward cursor at 8% force. Dots are accent-colored with distance-based opacity (0.03-0.25). Lines at rgba(200,210,230,0.15). 40% overall opacity.

**Scope:** Hero section only. Fades out as user scrolls past the hero (opacity transitions to 0 over 200px of scroll). The mesh is the greeting, not the wallpaper.

## Component Library

### Navigation

- Fixed top, white bg with 85% opacity + 16px backdrop blur
- Logo: JetBrains Mono, 12px, uppercase, tracked 2px, fg-muted
- Links: DM Sans, 13px, fg-muted → fg on hover with letter-spacing animation
- CTA: dark pill, 100px radius, 12px, magnetic pull, hover lift + shadow
- Mobile: hamburger → full-screen overlay with staggered link reveal

### Cards

**Pillar Card** (homepage pillars, hub featured):
- Pillar tinted bg + border
- 3D tilt on hover (2-3deg)
- JetBrains Mono pillar label, Space Grotesk title, DM Sans description
- Content count in caption style
- Staggered scroll entrance

**Content Card** (article/lesson listings):
- White bg (bg-subtle in dark), border
- Metadata row: pillar pill + type pill
- Space Grotesk title (text-h3), DM Sans description (text-small)
- Footer: JetBrains Mono time estimate + difficulty
- Hover: translateY(-2px) + border-hover + shadow-sm

**Tool Card** (/tools grid):
- Logo + name + version badge
- Category pill, capability count
- Hover: subtle glow in tool's primary color

**Bento Tile** (homepage features):
- 16px radius, border, mixed sizes (large 2x2, medium 2x1, small 1x1)
- Each tile has unique interior content (agent replay, capability heatmap, live ticker, stat)
- Staggered scroll entrance, hover lift + shadow-lg

### Pills & Badges

- **Pillar pills**: tinted bg + colored text, monospace, 10px, 100px radius
- **Status pills**: border + neutral or tinted bg, `v1.0`, `live`, `new`
- **Difficulty**: neutral gray bg, monospace
- **Format**: small monospace label

### Buttons

- **Primary**: dark bg, white text, 8px radius, magnetic pull, ripple, hover lift + shadow
- **Secondary**: border, transparent bg, 8px radius, hover darkens border + text
- **Ghost**: text only, underline reveal on hover

### Section Dividers

- Number (JetBrains Mono, 10px, fg-faint) + gradient line + uppercase label
- Scroll-triggered fade-up entrance

### Code Blocks

- bg-muted, thin border, 8px radius
- Shiki syntax highlighting
- JetBrains Mono, 12-13px
- Copy button appears on hover (top-right)

### Callouts

- Left border 3px accent color (pillar or default blue)
- Slight tinted background matching pillar
- DM Sans text, 13px

### Live Feed Ticker

- Horizontal auto-scrolling strip
- **Data source:** Automated from `tool_releases` Supabase table (populated by tool-intelligence cron every 6 hours). Query 10 most recent releases.
- Tool events with colored dots
- JetBrains Mono, 11px, fg-muted
- 20s linear infinite animation, duplicated content for seamless loop

### Footer

- Border-top separator
- Logo (JetBrains Mono uppercase) + tagline left
- 3-column links: monospace headings (micro), DM Sans links (small)
- Generous padding (80px top)

## Page Templates

### Homepage

**Two-track:** Logged-out users see the marketing spectacle. Logged-in users redirect to /dashboard with a simplified homepage accessible via nav.

**Marketing Homepage (logged out):**
1. **Hero** (100vh): Generative mesh bg (fades on scroll), comment syntax `// prototype.studio`, word-by-word mask reveal headline ("Build Real / Products. / With AI."), DM Sans subtitle, primary + secondary CTA, pulsing pillar dots meta, scroll indicator
2. **"Start here" content row**: 3 curated content cards (best beginner pieces) — visible within 2 scrolls so time-constrained visitors can engage immediately
3. **Scroll-pinned pillars** (400vh sticky): Left tab navigation cycling through 4 pillars with detail card swap + number scramble stats. Progress dots on right edge.
4. **Number theater stats**: 5-column stats bar with scramble-to-target animation
5. **Bento grid features**: 6 tiles (1 large agent replay, 1 medium tool intelligence, 1 medium live ticker, 2 small stats)
6. **Full-bleed gradient break**: Pillar color wash, centered large statement
7. **Horizontal scroll showcase**: Drag-scrollable project cards with snap + arrow buttons for mouse users. Seeded with Ethan's own builds (Meridian, RidgeCap, NexusWatch, LongTable).
8. **Footer**

**First-visit banner:** If no auth cookie, show subtle dismissible banner above pillar cards: "New here? Start with Learn →" linking to a beginner lesson.

**Primary CTA behavior:** "Start building" scrolls to content / deep-links to the best Build walkthrough. "Explore the platform" navigates to pillar overview. No auth wall on first click — let people browse first, convert through value.

### Pillar Hub (/pulse, /build, /learn, /system)

1. Pillar-tinted hero header (pillar surface bg, large title, description)
2. Filter pills row (all / type1 / type2 / type3)
3. Content grid: 3-column content cards, staggered entrance
4. Empty states: dashed border, monospace "coming soon"

### Content Detail (/[pillar]/[slug])

1. Scroll progress bar at top (2px, accent-colored, fixed)
2. Metadata row: pillar pill + type pill + time + difficulty
3. Title (Space Grotesk h1) + description (DM Sans, fg-secondary)
4. Divider
5. Two-column layout: prose body (max-width 720px) + sticky sidebar
6. Sidebar: table of contents (active state with left border), bookmark action, related content
7. Bottom: next/prev navigation + related content card row
8. **Mobile (<640px):** Sidebar collapses. ToC becomes a collapsible top bar below metadata — expands on tap, collapses after selection.

### Tools Directory (/tools)

1. Section header with count badge
2. Category filter pills
3. 3-column tool card grid, staggered entrance
4. Search input (monospace placeholder)

### Tool Detail (/tools/[slug])

1. Tool header: logo + name + version pill + status badge
2. Tabs: Overview / Releases / Capabilities / Related
3. Release timeline: vertical, monospace dates, staggered reveal
4. Capability matrix: grouped categories, quality score indicators

### Showcase (/showcase)

1. Header with "Submit" CTA
2. Tool filter row
3. 3-column grid or masonry layout
4. Cards: screenshot (with hover scale), title, tools, build time, upvotes
5. Horizontal scroll variant for featured row

### Arena (/build/arena)

1. Split view: two panels side by side
2. Tool labels on each side
3. Voting buttons with animated fill counter
4. Community vote results bar

### Observatory (/system/observatory)

1. Pipeline run list (status indicators, timestamps)
2. Expanded: step-by-step visualization with connector lines
3. Per-step: agent name, status dot, duration, tokens, cost (all monospace)
4. Animated connector lines between steps

### Transparency (/transparency)

1. Live cost ticker (animated counting number)
2. Pipeline log feed (newest first, monospace)
3. Architecture overview

### Ask (/ask — AI Assistant)

1. Full-screen chat interface
2. Message bubbles with monospace code blocks
3. Typing indicator with pulsing dots
4. Input bar fixed at bottom

### Pricing (/pricing)

1. Centered layout, 2-3 tier cards
2. Feature comparison list with checkmarks
3. Highlight on recommended tier

### For/[slug] (Role Landing Pages)

1. Role-specific hero (personalized headline)
2. Curated content picks for that role
3. Testimonial/social proof section
4. CTA to sign up

## Dark Mode

Invert all core tokens per the color table above. Pillar surfaces shift to deep tints. Grain overlay increases to 3% opacity. Shadows replaced with subtle border glow (1px border with pillar or accent color at low opacity). Generative mesh dot colors shift to lighter accent. Cards use bg-subtle background with border-hover borders. The overall feel should be equally designed — not just "invert the colors" but a crafted dark experience.

## Responsive

- Mobile-first: single column below 640px
- sm (640px): 2-column grids
- lg (1024px): 3-4 column grids, sidebar appears on content pages
- Max content width: 1300px
- Horizontal padding: 24px mobile, 48px desktop
- Scroll-pinned section degrades to static card stack on mobile
- Horizontal scroll showcase works naturally on mobile (touch drag)
- Generative mesh hidden on mobile (performance)
- Bento grid stacks to 2-column then 1-column

## Performance

- Fonts: preconnect + swap display
- Generative mesh: requestAnimationFrame, hidden below 1024px
- IntersectionObserver for all scroll-triggered animations (no scroll listeners for entrance)
- Scroll-pinned section uses single scroll listener with throttle
- CSS animations preferred over JS where possible
- View transitions: progressive enhancement (check for API support)

## OG Images & Social Cards

Auto-generated per page type using Next.js OG image generation (`/api/og`):
- **Template:** Pillar color band (left edge) + title in Space Grotesk + `// prototype.studio` comment mark (bottom right) + white background
- **Per-type variants:** Content pages use pillar color, tool pages use tool logo, homepage uses gradient
- Consistent, recognizable, zero manual effort

## Paywall Strategy (Future)

When premium tier launches, gate at the content level using existing `isPremium` MDX frontmatter. Show title + first paragraph, blur the rest with "Upgrade to continue" CTA. Free features (sandboxes, AI assistant, bookmarks, skill tree) remain free — premium unlocks advanced content only.

## Accessibility

**prefers-reduced-motion:** All elements render in their final "after animation" position immediately. No motion, full content. The site must be beautiful even without a single animation — static final states are the fallback, not a degraded experience.

## Implementation Notes

- Build as Tailwind CSS v4 tokens in globals.css + custom CSS for base animations
- **GSAP + ScrollTrigger** for all scroll-driven animations, entrance choreography, and pinned sections (replaces Framer Motion + custom IO for scroll work)
- Canvas API for generative mesh (no external lib)
- All motion respects `prefers-reduced-motion` — show static final states
- shadcn/ui components restyled to match (override base-nova defaults)
- Custom MDX components inherit the type scale and color tokens
- Google Fonts: Space Grotesk (300, 400, 500, 600, 700), DM Sans (300, 400, 500), JetBrains Mono (300, 400)
