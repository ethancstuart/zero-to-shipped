# Prototype Studio — Visual Design Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Prototype Studio from generic dark Tailwind into a high-craft, light-first editorial site with full kinetic motion (GSAP), generative hero, scroll-pinned sections, bento grid, and branded identity — across all 30+ pages, both themes.

**Architecture:** Design system tokens in globals.css → reusable motion utilities via GSAP ScrollTrigger → component library (cards, pills, nav, footer) → page-by-page rebuild starting with homepage → dark mode pass → OG images → responsive + accessibility polish.

**Tech Stack:** Next.js 16 / React 19 / Tailwind v4 / GSAP + ScrollTrigger / Canvas API / shadcn/ui (restyled) / Google Fonts (Space Grotesk, DM Sans, JetBrains Mono)

**Spec:** `docs/superpowers/specs/2026-05-25-prototype-studio-visual-design.md`

**Repo:** `~/Projects/zero-to-shipped`

---

## File Structure

### New files to create:
```
src/
  lib/
    gsap.ts                          # GSAP registration + ScrollTrigger setup
    use-gsap.ts                      # React hook for scroll-triggered animations
    use-counter.ts                   # Number theater counting hook
  components/
    motion/
      scroll-reveal.tsx              # Reusable scroll-triggered reveal wrapper
      stagger-grid.tsx               # Staggered grid entrance wrapper
      scroll-progress.tsx            # Reading progress bar
      grain-overlay.tsx              # SVG noise grain overlay
    hero/
      generative-mesh.tsx            # Canvas-based dot mesh background
      word-reveal.tsx                # Hero word-by-word mask reveal
      cursor-spotlight.tsx           # Mouse-following spotlight
      hero-section.tsx               # Assembled hero (replaces old hero-section.tsx)
    homepage/
      start-here-row.tsx             # "Start here" 3-card curated row
      pinned-pillars.tsx             # Scroll-pinned 4-pillar section
      number-theater.tsx             # Stats bar with scramble animation
      bento-grid.tsx                 # Feature bento grid
      gradient-break.tsx             # Full-bleed gradient interstitial
      horizontal-showcase.tsx        # Drag-scroll showcase cards
      first-visit-banner.tsx         # "New here? Start with Learn" banner
    content/
      toc-sidebar.tsx                # Sticky table of contents sidebar
      mobile-toc.tsx                 # Collapsible mobile ToC bar
      content-card.tsx               # REDESIGNED content card
      pillar-card.tsx                # New pillar card (3D tilt)
      tool-card.tsx                  # Redesigned tool card
    shared/
      section-divider.tsx            # Numbered section divider
      pill.tsx                       # Unified pill/badge component
      magnetic-button.tsx            # Primary button with magnetic pull
    layout/
      marketing-nav.tsx              # REDESIGNED nav
      footer.tsx                     # REDESIGNED footer
  app/
    (marketing)/
      page.tsx                       # REWRITTEN homepage
      pulse/page.tsx                 # REDESIGNED hub
      build/page.tsx                 # REDESIGNED hub
      learn/page.tsx                 # REDESIGNED hub
      system/page.tsx                # REDESIGNED hub
      pulse/[slug]/page.tsx          # REDESIGNED content detail
      build/[slug]/page.tsx          # REDESIGNED content detail
      learn/[slug]/page.tsx          # REDESIGNED content detail
      system/[slug]/page.tsx         # REDESIGNED content detail
      tools/page.tsx                 # REDESIGNED tools directory
      tools/[slug]/page.tsx          # REDESIGNED tool detail
      showcase/page.tsx              # REDESIGNED showcase
      build/arena/page.tsx           # REDESIGNED arena
    api/
      og/route.tsx                   # REWRITTEN OG image templates
    globals.css                      # REWRITTEN design tokens
```

### Files to delete after migration:
```
src/components/marketing/hero-section.tsx         # Replaced by hero/ components
src/components/marketing/curriculum-section.tsx    # No longer needed
src/components/marketing/founding-counter.tsx      # No longer needed
src/components/marketing/pricing-section.tsx       # Replaced inline
src/components/marketing/role-tracks-section.tsx   # Replaced by /for/[slug]
src/components/marketing/what-you-build-strip.tsx  # Replaced by showcase
src/components/marketing/free-content-hub.tsx      # No longer needed
```

---

## Task 1: Design System Foundation

**Files:**
- Modify: `src/app/globals.css` (full rewrite)
- Modify: `src/app/layout.tsx` (font imports)
- Modify: `package.json` (add GSAP)
- Create: `src/lib/gsap.ts`

- [ ] **Step 1: Install GSAP + ScrollTrigger**

```bash
npm install gsap
```

- [ ] **Step 2: Create GSAP registration module**

Create `src/lib/gsap.ts`:

```typescript
'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export { gsap, ScrollTrigger }
```

- [ ] **Step 3: Add Google Fonts to root layout**

Modify `src/app/layout.tsx` — replace the current font setup with:

```typescript
import { Space_Grotesk, DM_Sans, JetBrains_Mono } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '600', '700'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400'],
})
```

Apply all three to the `<body>` className: `${spaceGrotesk.variable} ${dmSans.variable} ${jetbrainsMono.variable}`.

- [ ] **Step 4: Rewrite globals.css with new design tokens**

Replace the entire `src/app/globals.css` with the new token system. Key sections:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@plugin "@tailwindcss/typography";

@theme {
  --font-sans: var(--font-body), 'DM Sans', system-ui, sans-serif;
  --font-display: var(--font-display), 'Space Grotesk', system-ui, sans-serif;
  --font-mono: var(--font-mono), 'JetBrains Mono', monospace;
  --radius: 0.625rem;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}

@layer base {
  :root {
    /* Core surfaces */
    --bg: 0 0% 100%;
    --bg-subtle: 40 11% 97%;
    --bg-muted: 40 7% 96%;
    --fg: 0 0% 10%;
    --fg-secondary: 0 0% 40%;
    --fg-muted: 0 0% 60%;
    --fg-faint: 0 0% 80%;
    --border: 0 0% 94%;
    --border-hover: 0 0% 87%;
    --accent: 217 91% 60%;

    /* Pillar colors */
    --pillar-pulse: 217 91% 60%;
    --pillar-pulse-surface: 217 100% 97%;
    --pillar-pulse-border: 217 100% 90%;
    --pillar-build: 32 95% 44%;
    --pillar-build-surface: 36 100% 97%;
    --pillar-build-border: 40 78% 90%;
    --pillar-learn: 160 84% 39%;
    --pillar-learn-surface: 145 100% 97%;
    --pillar-learn-border: 152 81% 90%;
    --pillar-system: 263 70% 50%;
    --pillar-system-surface: 270 100% 98%;
    --pillar-system-border: 268 68% 92%;

    /* Shadows */
    --shadow-sm: 0 2px 8px rgba(0,0,0,0.03);
    --shadow-md: 0 8px 24px rgba(0,0,0,0.04);
    --shadow-lg: 0 16px 48px rgba(0,0,0,0.06);

    /* shadcn overrides */
    --background: var(--bg);
    --foreground: var(--fg);
    --card: var(--bg);
    --card-foreground: var(--fg);
    --primary: var(--fg);
    --primary-foreground: var(--bg);
    --secondary: var(--bg-subtle);
    --secondary-foreground: var(--fg);
    --muted: var(--bg-muted);
    --muted-foreground: var(--fg-muted);
    --accent: var(--bg-subtle);
    --accent-foreground: var(--fg);
    --border: var(--border);
    --input: var(--border);
    --ring: var(--accent);
  }

  .dark {
    --bg: 0 0% 4%;
    --bg-subtle: 0 0% 7%;
    --bg-muted: 0 0% 10%;
    --fg: 0 0% 98%;
    --fg-secondary: 0 0% 60%;
    --fg-muted: 0 0% 40%;
    --fg-faint: 0 0% 20%;
    --border: 0 0% 12%;
    --border-hover: 0 0% 20%;
    --accent: 217 91% 67%;

    --pillar-pulse-surface: 213 60% 8%;
    --pillar-pulse-border: 213 50% 23%;
    --pillar-build-surface: 40 50% 6%;
    --pillar-build-border: 38 60% 15%;
    --pillar-learn-surface: 155 40% 6%;
    --pillar-learn-border: 155 50% 14%;
    --pillar-system-surface: 270 40% 8%;
    --pillar-system-border: 270 50% 19%;

    --shadow-sm: none;
    --shadow-md: none;
    --shadow-lg: none;
  }
}
```

Also add typography utility classes:

```css
@layer utilities {
  .text-display {
    font-family: var(--font-display);
    font-size: clamp(3.5rem, 9vw, 6.25rem);
    line-height: 1.05;
    letter-spacing: -3px;
  }
  .text-h1 {
    font-family: var(--font-display);
    font-size: 2.25rem;
    font-weight: 600;
    letter-spacing: -1px;
  }
  .text-h2 {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: 300;
    letter-spacing: -0.5px;
  }
  .text-h3 {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 500;
    letter-spacing: -0.3px;
  }
  .font-display { font-family: var(--font-display); }
  .font-mono-data { font-family: var(--font-mono); }
}
```

Preserve the existing prose, shiki, and stagger animation styles. Remove any old brand token definitions that conflict.

- [ ] **Step 5: Verify build passes**

```bash
cd ~/Projects/zero-to-shipped && npm run build
```

Fix any CSS or font import errors. The site will look broken at this point — that's expected. Tokens are in place.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: design system foundation — GSAP, fonts, new token system"
```

---

## Task 2: Motion Utilities + Grain Overlay

**Files:**
- Create: `src/lib/use-gsap.ts`
- Create: `src/lib/use-counter.ts`
- Create: `src/components/motion/scroll-reveal.tsx`
- Create: `src/components/motion/stagger-grid.tsx`
- Create: `src/components/motion/scroll-progress.tsx`
- Create: `src/components/motion/grain-overlay.tsx`

- [ ] **Step 1: Create useGsapReveal hook**

Create `src/lib/use-gsap.ts`:

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from './gsap'

export function useGsapReveal(
  options: {
    y?: number
    opacity?: number
    duration?: number
    delay?: number
    stagger?: number
    start?: string
  } = {}
) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const {
      y = 30,
      opacity = 0,
      duration = 0.8,
      delay = 0,
      stagger = 0,
      start = 'top 85%',
    } = options

    const children = stagger > 0 ? ref.current.children : [ref.current]

    gsap.set(children, { y, opacity })

    ScrollTrigger.create({
      trigger: ref.current,
      start,
      once: true,
      onEnter: () => {
        gsap.to(children, {
          y: 0,
          opacity: 1,
          duration,
          delay,
          stagger,
          ease: 'power3.out',
        })
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.trigger === ref.current) t.kill()
      })
    }
  }, [])

  return ref
}
```

- [ ] **Step 2: Create useCounter hook for number theater**

Create `src/lib/use-counter.ts`:

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'

export function useCounter(target: number, duration = 1200) {
  const [display, setDisplay] = useState('0')
  const ref = useRef<HTMLDivElement>(null)
  const hasRun = useRef(false)

  useEffect(() => {
    if (!ref.current || hasRun.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasRun.current) return
        hasRun.current = true
        observer.disconnect()

        const start = performance.now()
        const digits = String(target).length

        function step(now: number) {
          const elapsed = now - start
          const progress = Math.min(1, elapsed / duration)

          if (progress < 0.4) {
            let scrambled = ''
            for (let i = 0; i < digits; i++) {
              scrambled += Math.floor(Math.random() * 10)
            }
            setDisplay(scrambled)
          } else {
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplay(String(Math.round(target * eased)))
          }

          if (progress < 1) requestAnimationFrame(step)
          else setDisplay(String(target))
        }

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (prefersReduced) {
          setDisplay(String(target))
        } else {
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return { ref, display }
}
```

- [ ] **Step 3: Create ScrollReveal wrapper component**

Create `src/components/motion/scroll-reveal.tsx`:

```typescript
'use client'

import { useGsapReveal } from '@/lib/use-gsap'
import { cn } from '@/lib/utils'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  y?: number
  delay?: number
  duration?: number
}

export function ScrollReveal({
  children,
  className,
  y = 30,
  delay = 0,
  duration = 0.8,
}: ScrollRevealProps) {
  const ref = useGsapReveal({ y, delay, duration })
  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Create StaggerGrid wrapper component**

Create `src/components/motion/stagger-grid.tsx`:

```typescript
'use client'

import { useGsapReveal } from '@/lib/use-gsap'
import { cn } from '@/lib/utils'

interface StaggerGridProps {
  children: React.ReactNode
  className?: string
  stagger?: number
  y?: number
}

export function StaggerGrid({
  children,
  className,
  stagger = 0.1,
  y = 40,
}: StaggerGridProps) {
  const ref = useGsapReveal({ y, stagger })
  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  )
}
```

- [ ] **Step 5: Create ScrollProgress bar**

Create `src/components/motion/scroll-progress.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'

export function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      setProgress(total > 0 ? scrolled / total : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5">
      <div
        className="h-full bg-[hsl(var(--accent))] transition-[width] duration-100"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  )
}
```

- [ ] **Step 6: Create GrainOverlay**

Create `src/components/motion/grain-overlay.tsx`:

```typescript
export function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9998] opacity-[0.022] dark:opacity-[0.03]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
    />
  )
}
```

- [ ] **Step 7: Add GrainOverlay to root layout**

Modify `src/app/layout.tsx` — add `<GrainOverlay />` as the first child inside `<body>`.

- [ ] **Step 8: Verify build**

```bash
npm run build
```

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: motion utilities — GSAP hooks, scroll reveal, counter, grain overlay"
```

---

## Task 3: Shared Components — Pills, Buttons, Section Dividers

**Files:**
- Create: `src/components/shared/section-divider.tsx`
- Create: `src/components/shared/pill.tsx`
- Create: `src/components/shared/magnetic-button.tsx`

- [ ] **Step 1: Create Pill component**

Create `src/components/shared/pill.tsx`:

```typescript
import { cn } from '@/lib/utils'

type PillarName = 'pulse' | 'build' | 'learn' | 'system'

const pillarStyles: Record<PillarName, string> = {
  pulse: 'bg-[hsl(var(--pillar-pulse-surface))] text-[hsl(var(--pillar-pulse))] border-[hsl(var(--pillar-pulse-border))]',
  build: 'bg-[hsl(var(--pillar-build-surface))] text-[hsl(var(--pillar-build))] border-[hsl(var(--pillar-build-border))]',
  learn: 'bg-[hsl(var(--pillar-learn-surface))] text-[hsl(var(--pillar-learn))] border-[hsl(var(--pillar-learn-border))]',
  system: 'bg-[hsl(var(--pillar-system-surface))] text-[hsl(var(--pillar-system))] border-[hsl(var(--pillar-system-border))]',
}

interface PillProps {
  children: React.ReactNode
  pillar?: PillarName
  className?: string
}

export function Pill({ children, pillar, className }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wide border',
        pillar ? pillarStyles[pillar] : 'bg-[hsl(var(--bg-muted))] text-[hsl(var(--fg-muted))] border-[hsl(var(--border))]',
        className
      )}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 2: Create SectionDivider component**

Create `src/components/shared/section-divider.tsx`:

```typescript
'use client'

import { ScrollReveal } from '@/components/motion/scroll-reveal'

interface SectionDividerProps {
  number: string
  label: string
}

export function SectionDivider({ number, label }: SectionDividerProps) {
  return (
    <ScrollReveal className="flex items-center gap-4 mb-16 lg:mb-20">
      <span className="font-mono-data text-[10px] text-[hsl(var(--fg-faint))] tracking-wider">
        {number}
      </span>
      <span className="flex-1 h-px bg-gradient-to-r from-[hsl(var(--border))] to-transparent" />
      <span className="text-[10px] tracking-[2px] uppercase text-[hsl(var(--fg-muted))] font-medium">
        {label}
      </span>
    </ScrollReveal>
  )
}
```

- [ ] **Step 3: Create MagneticButton component**

Create `src/components/shared/magnetic-button.tsx`:

```typescript
'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface MagneticButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: React.ReactNode
}

export function MagneticButton({
  variant = 'primary',
  children,
  className,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null)

  const onMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    ref.current.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`
  }

  const onMouseLeave = () => {
    if (ref.current) ref.current.style.transform = ''
  }

  const styles = {
    primary:
      'bg-[hsl(var(--fg))] text-[hsl(var(--bg))] hover:shadow-[var(--shadow-md)]',
    secondary:
      'border border-[hsl(var(--border))] text-[hsl(var(--fg-secondary))] hover:border-[hsl(var(--fg))] hover:text-[hsl(var(--fg))]',
    ghost:
      'text-[hsl(var(--fg-secondary))] hover:text-[hsl(var(--fg))]',
  }

  return (
    <a
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-7 py-3.5 text-sm font-medium transition-all duration-300',
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: shared components — pill, section divider, magnetic button"
```

---

## Task 4: Card Components — Pillar Card, Content Card, Tool Card

**Files:**
- Create: `src/components/content/pillar-card.tsx`
- Modify: `src/components/content/content-card.tsx` (redesign)
- Create: `src/components/content/tool-card.tsx`

- [ ] **Step 1: Create PillarCard with 3D tilt**

Create `src/components/content/pillar-card.tsx`:

```typescript
'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type PillarName = 'pulse' | 'build' | 'learn' | 'system'

const pillarConfig: Record<PillarName, { surface: string; border: string; text: string; href: string }> = {
  pulse: { surface: 'bg-[hsl(var(--pillar-pulse-surface))]', border: 'border-[hsl(var(--pillar-pulse-border))]', text: 'text-[hsl(var(--pillar-pulse))]', href: '/pulse' },
  build: { surface: 'bg-[hsl(var(--pillar-build-surface))]', border: 'border-[hsl(var(--pillar-build-border))]', text: 'text-[hsl(var(--pillar-build))]', href: '/build' },
  learn: { surface: 'bg-[hsl(var(--pillar-learn-surface))]', border: 'border-[hsl(var(--pillar-learn-border))]', text: 'text-[hsl(var(--pillar-learn))]', href: '/learn' },
  system: { surface: 'bg-[hsl(var(--pillar-system-surface))]', border: 'border-[hsl(var(--pillar-system-border))]', text: 'text-[hsl(var(--pillar-system))]', href: '/system' },
}

interface PillarCardProps {
  pillar: PillarName
  title: string
  description: string
  count: string
}

export function PillarCard({ pillar, title, description, count }: PillarCardProps) {
  const config = pillarConfig[pillar]
  const ref = useRef<HTMLAnchorElement>(null)

  const onMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    ref.current.style.transform = `perspective(800px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateY(-4px)`
  }

  const onMouseLeave = () => {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <Link
      ref={ref}
      href={config.href}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn(
        'block rounded-xl border p-7 transition-all duration-400',
        config.surface,
        config.border,
        'hover:shadow-[var(--shadow-md)]'
      )}
    >
      <div className={cn('text-[10px] tracking-wider font-medium uppercase mb-5', config.text)}>
        {pillar}
      </div>
      <div className="text-h3 mb-2">{title}</div>
      <div className="text-sm text-[hsl(var(--fg-secondary))] leading-relaxed">{description}</div>
      <div className="font-mono-data text-[11px] text-[hsl(var(--fg-muted))] mt-5">{count}</div>
    </Link>
  )
}
```

- [ ] **Step 2: Redesign ContentCard**

Rewrite `src/components/content/content-card.tsx`:

```typescript
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Pill } from '@/components/shared/pill'
import type { ContentListItem } from '@/types/content'

interface ContentCardProps {
  item: ContentListItem
}

export function ContentCard({ item }: ContentCardProps) {
  const href = `/${item.pillar}/${item.slug}`

  return (
    <Link
      href={href}
      className="block rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-subtle))] p-6 transition-all duration-300 hover:border-[hsl(var(--border-hover))] hover:bg-[hsl(var(--bg))] hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]"
    >
      <div className="flex gap-2 mb-3">
        <Pill pillar={item.pillar}>{item.pillar}</Pill>
        <Pill>{item.type}</Pill>
      </div>
      <div className="text-h3 mb-1.5">{item.title}</div>
      {item.description && (
        <div className="text-sm text-[hsl(var(--fg-secondary))] leading-relaxed line-clamp-2">
          {item.description}
        </div>
      )}
      <div className="font-mono-data text-[11px] text-[hsl(var(--fg-muted))] mt-4 flex gap-3">
        {item.estimatedMinutes && <span>{item.estimatedMinutes} min</span>}
        {item.difficulty && <span>{item.difficulty}</span>}
      </div>
    </Link>
  )
}
```

- [ ] **Step 3: Create ToolCard**

Create `src/components/content/tool-card.tsx`:

```typescript
import Link from 'next/link'
import Image from 'next/image'
import { Pill } from '@/components/shared/pill'

interface ToolCardProps {
  slug: string
  name: string
  category: string
  description: string | null
  currentVersion: string | null
  logoUrl: string | null
}

export function ToolCard({ slug, name, category, description, currentVersion, logoUrl }: ToolCardProps) {
  return (
    <Link
      href={`/tools/${slug}`}
      className="block rounded-xl border border-[hsl(var(--border))] p-6 transition-all duration-300 hover:border-[hsl(var(--border-hover))] hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]"
    >
      <div className="flex items-center gap-3 mb-4">
        {logoUrl && (
          <Image src={logoUrl} alt={name} width={32} height={32} className="rounded-lg" />
        )}
        <div className="flex-1">
          <div className="text-h3">{name}</div>
        </div>
        {currentVersion && (
          <span className="font-mono-data text-[10px] text-[hsl(var(--fg-muted))] border border-[hsl(var(--border))] rounded-full px-2 py-0.5">
            {currentVersion}
          </span>
        )}
      </div>
      <Pill className="mb-3">{category}</Pill>
      {description && (
        <div className="text-sm text-[hsl(var(--fg-secondary))] leading-relaxed line-clamp-2">
          {description}
        </div>
      )}
    </Link>
  )
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: card components — pillar card, content card, tool card"
```

---

## Task 5: Navigation + Footer Redesign

**Files:**
- Modify: `src/components/layout/marketing-nav.tsx` (redesign)
- Modify: `src/components/layout/footer.tsx` (redesign)

- [ ] **Step 1: Redesign marketing-nav**

Rewrite `src/components/layout/marketing-nav.tsx`:

White background with blur, DM Sans nav links with letter-spacing hover, monospace data-only logo (`prototype studio` in tracking-wider), dark pill CTA. Keep existing auth logic (LoginButtonOutline / Dashboard button).

Key changes:
- Remove Rocket icon import
- Logo: `<span className="text-xs tracking-[2px] uppercase text-[hsl(var(--fg-muted))]">prototype studio</span>` (DM Sans with tracking, NOT monospace — per review amendment)
- Nav links: `text-sm text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg))] transition-all duration-300 hover:tracking-wider`
- CTA pill: `bg-[hsl(var(--fg))] text-[hsl(var(--bg))] rounded-full px-5 py-2 text-xs`
- Container: `fixed top-0 inset-x-0 z-50 bg-[hsl(var(--bg))]/88 backdrop-blur-xl border-b border-[hsl(var(--border))]`
- Padding: `px-6 lg:px-12 py-5`

- [ ] **Step 2: Redesign footer**

Rewrite `src/components/layout/footer.tsx`:

3-column layout (Platform / Resources / About) with DM Sans headings using letter-spacing (not monospace). Logo + tagline left. Generous padding (80px top).

Key structure:
- Container: `border-t border-[hsl(var(--border))] py-20 px-6 lg:px-12`
- Max width: `max-w-[1300px] mx-auto`
- Column headings: `text-[10px] tracking-[1.5px] uppercase text-[hsl(var(--fg-muted))] font-medium mb-4`
- Links: `text-sm text-[hsl(var(--fg-secondary))] hover:text-[hsl(var(--fg))] transition-colors`
- Logo: `text-xs tracking-[1px] uppercase text-[hsl(var(--fg-muted))]`
- Tagline: `text-xs text-[hsl(var(--fg-faint))]`

- [ ] **Step 3: Verify dev server**

```bash
npm run dev
```

Check the nav and footer render correctly on any page.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: redesign navigation + footer"
```

---

## Task 6: Generative Mesh + Hero Section

**Files:**
- Create: `src/components/hero/generative-mesh.tsx`
- Create: `src/components/hero/word-reveal.tsx`
- Create: `src/components/hero/cursor-spotlight.tsx`
- Create: `src/components/hero/hero-section.tsx`

- [ ] **Step 1: Create GenerativeMesh canvas component**

Create `src/components/hero/generative-mesh.tsx`:

Client component. Canvas that renders a 20x14 dot grid with 60px spacing. Lines connect adjacent dots. Mouse proximity warps points. Fades to 0 opacity as scrollY exceeds 600px. Hidden on screens < 1024px via CSS. Respects prefers-reduced-motion (renders static grid, no mouse tracking).

Key implementation:
- `useEffect` for RAF loop
- `mousemove` listener on document
- `scroll` listener for fade-out (opacity = Math.max(0, 1 - scrollY/600))
- Dots: `rgba(59,130,246, alpha)` where alpha is distance-based (0.03–0.25)
- Lines: `rgba(200,210,230, 0.15)`
- Canvas: `fixed top-0 left-0 w-full h-full pointer-events-none` at z-index 0

- [ ] **Step 2: Create WordReveal headline component**

Create `src/components/hero/word-reveal.tsx`:

Client component using GSAP timeline. Each word wrapped in overflow-hidden container, inner span starts at translateY(105%) and animates up with stagger. Falls back to static rendering if prefers-reduced-motion.

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

interface WordRevealProps {
  lines: { words: string[]; className?: string }[]
}

export function WordReveal({ lines }: WordRevealProps) {
  const containerRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const inners = containerRef.current.querySelectorAll('.word-inner')

    if (prefersReduced) {
      gsap.set(inners, { y: 0 })
      return
    }

    gsap.set(inners, { y: '105%' })
    gsap.to(inners, {
      y: 0,
      duration: 0.9,
      stagger: 0.08,
      delay: 0.4,
      ease: 'power3.out',
    })
  }, [])

  return (
    <h1 ref={containerRef} className="text-display font-light">
      {lines.map((line, li) => (
        <span key={li} className="block">
          {line.words.map((word, wi) => (
            <span key={wi} className="inline-block overflow-hidden align-bottom">
              <span className={`word-inner inline-block ${line.className || ''}`}>
                {word}
                {wi < line.words.length - 1 ? ' ' : ''}
              </span>
            </span>
          ))}
        </span>
      ))}
    </h1>
  )
}
```

- [ ] **Step 3: Create CursorSpotlight**

Create `src/components/hero/cursor-spotlight.tsx`:

Client component. Div with radial gradient that follows mouse. Hidden on mobile and when prefers-reduced-motion.

```typescript
'use client'

import { useEffect, useRef } from 'react'

export function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = ref.current
    if (!el) return

    const onMove = (e: MouseEvent) => {
      el.style.left = `${e.clientX}px`
      el.style.top = `${e.clientY}px`
    }
    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed w-[600px] h-[600px] rounded-full -translate-x-1/2 -translate-y-1/2 z-[1] hidden lg:block"
      style={{
        background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)',
      }}
    />
  )
}
```

- [ ] **Step 4: Assemble HeroSection**

Create `src/components/hero/hero-section.tsx`:

Assembles all hero sub-components. Includes: GenerativeMesh, CursorSpotlight, `// prototype.studio` comment, WordReveal headline, subtitle (DM Sans), primary + secondary CTAs (MagneticButton), bottom meta with pulsing dots, scroll indicator.

The hero config:
```typescript
const heroLines = [
  { words: ['Build', 'Real'] },
  { words: ['Products.'], className: 'font-semibold' },
  { words: ['With', 'AI.'], className: 'text-[hsl(var(--fg-faint))]' },
]
```

The blue period accent on "Products." is added via a `<span className="text-[hsl(var(--accent))]">.</span>` — handle this in the word rendering by checking if word ends with "." and splitting.

- [ ] **Step 5: Verify hero renders on dev server**

```bash
npm run dev
```

Temporarily import HeroSection into the homepage to verify it renders. Check: mesh moves with mouse, words animate in, spotlight follows cursor, scroll indicator animates.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: hero section — generative mesh, word reveal, cursor spotlight"
```

---

## Task 7: Homepage — All Sections

**Files:**
- Create: `src/components/homepage/start-here-row.tsx`
- Create: `src/components/homepage/first-visit-banner.tsx`
- Create: `src/components/homepage/pinned-pillars.tsx`
- Create: `src/components/homepage/number-theater.tsx`
- Create: `src/components/homepage/bento-grid.tsx`
- Create: `src/components/homepage/gradient-break.tsx`
- Create: `src/components/homepage/horizontal-showcase.tsx`
- Modify: `src/app/(marketing)/page.tsx` (full rewrite)

- [ ] **Step 1: Create FirstVisitBanner**

Create `src/components/homepage/first-visit-banner.tsx`:

Client component. Checks `localStorage` for `ps-visited` key. If not set, shows a subtle dismissible banner: "New here? Start with Learn →" linking to `/learn`. On dismiss, sets `ps-visited = true`. Renders nothing if visited before or if user is authenticated.

- [ ] **Step 2: Create StartHereRow**

Create `src/components/homepage/start-here-row.tsx`:

Server component. Queries the 3 most beginner-friendly content items (filter: difficulty='beginner', isFeatured=true, limit 3). Renders as a ScrollReveal-wrapped row of ContentCards with a "Start here" header.

- [ ] **Step 3: Create PinnedPillars**

Create `src/components/homepage/pinned-pillars.tsx`:

Client component. Uses GSAP ScrollTrigger to pin a section for 400vh. As scroll progresses 0→1, cycles through 4 pillar states. Left side: 4 tab labels with active state (border-left + pillar color). Right side: detail card with pillar surface bg, title, description, 3 stat counters (useCounter). Progress dots on right edge: 4 small circles, active one filled with pillar color.

Key GSAP setup:
```typescript
ScrollTrigger.create({
  trigger: sectionRef.current,
  start: 'top top',
  end: 'bottom bottom',
  pin: innerRef.current,
  onUpdate: (self) => {
    const newIndex = Math.min(3, Math.floor(self.progress * 4))
    if (newIndex !== activeIndex) setActiveIndex(newIndex)
  },
})
```

Pass pillar data as props from the homepage (server component fetches content counts from Supabase).

- [ ] **Step 4: Create NumberTheater**

Create `src/components/homepage/number-theater.tsx`:

Uses useCounter for each stat. 5-column flex layout with top/bottom borders. Stats: tools tracked, resources, capabilities mapped, pillars, "Free" (text, not number).

- [ ] **Step 5: Create BentoGrid**

Create `src/components/homepage/bento-grid.tsx`:

Client component. 4-column CSS grid with mixed-size tiles:
- Large (span 2 cols, 2 rows): Agent Replay — animated step list with staggered reveal
- Medium (span 2 cols): Tool Intelligence — capability heatmap cells with pulse animation
- Small (span 1): Transparency cost ticker
- Small (span 1): Open API endpoint count
- Medium (span 2 cols): Live Feed — auto-scrolling ticker populated from `tool_releases` table

Pass the `recentReleases` as a prop from the server-side homepage (query `tool_releases` table, order by `release_date` desc, limit 10).

- [ ] **Step 6: Create GradientBreak**

Create `src/components/homepage/gradient-break.tsx`:

Full-width div with pillar gradient background. Large centered Space Grotesk text with ScrollReveal. Content: "One platform. **Every AI tool.** Zero noise."

- [ ] **Step 7: Create HorizontalShowcase**

Create `src/components/homepage/horizontal-showcase.tsx`:

Client component. Horizontal scroll track with CSS scroll-snap + drag handler + left/right arrow buttons. Cards show: placeholder image area, title, description, tool pill, build time pill.

Seeded with Ethan's own projects: Meridian, RidgeCap, NexusWatch, LongTable. Pass as static data initially — will connect to `showcase_projects` table when community submissions exist.

- [ ] **Step 8: Rewrite homepage**

Rewrite `src/app/(marketing)/page.tsx`:

Server component that:
1. Queries content counts per pillar from Supabase
2. Queries 3 beginner content items for StartHereRow
3. Queries 10 recent tool releases for BentoGrid ticker
4. Renders all sections in order: HeroSection → FirstVisitBanner → StartHereRow → SectionDivider("01", "Platform") → PinnedPillars → NumberTheater → SectionDivider("02", "Features") → BentoGrid → GradientBreak → SectionDivider("03", "Showcase") → HorizontalShowcase

- [ ] **Step 9: Delete old marketing components**

Remove the files that are no longer used:
```bash
rm src/components/marketing/hero-section.tsx
rm src/components/marketing/curriculum-section.tsx
rm src/components/marketing/founding-counter.tsx
rm src/components/marketing/pricing-section.tsx
rm src/components/marketing/role-tracks-section.tsx
rm src/components/marketing/what-you-build-strip.tsx
rm src/components/marketing/free-content-hub.tsx
```

Check for any remaining imports of these files and remove them.

- [ ] **Step 10: Verify homepage on dev server**

```bash
npm run dev
```

Full scroll-through: hero animates → start here cards → pinned pillars cycle → stats count → bento tiles stagger → gradient break fades in → showcase scrolls horizontally. Check all GSAP animations fire.

- [ ] **Step 11: Commit**

```bash
git add -A && git commit -m "feat: homepage — all 8 sections with full kinetic motion"
```

---

## Task 8: Pillar Hub Pages

**Files:**
- Modify: `src/app/(marketing)/pulse/page.tsx`
- Modify: `src/app/(marketing)/build/page.tsx`
- Modify: `src/app/(marketing)/learn/page.tsx`
- Modify: `src/app/(marketing)/system/page.tsx`
- Modify: `src/components/marketing/pillar-section.tsx` (redesign or delete)

- [ ] **Step 1: Create a shared pillar hub template**

All 4 hubs follow the same pattern. Create a shared component or rewrite each page with:
1. Pillar-tinted hero header: full-width bg in pillar surface color, large Space Grotesk title, DM Sans description
2. Filter pills row (client-side filter): "All" + type-specific pills (e.g., briefs / comparisons / releases for Pulse)
3. StaggerGrid of ContentCards (3 cols on lg, 2 on sm, 1 on mobile)
4. Empty state: dashed border div with "Coming soon" in monospace

Each page is a server component that fetches content via `listContentByPillar()` and passes to a client FilterableContentGrid.

- [ ] **Step 2: Rewrite pulse/page.tsx**

Pillar: pulse, types: brief | comparison | release

- [ ] **Step 3: Rewrite build/page.tsx**

Pillar: build, types: session | challenge | walkthrough

- [ ] **Step 4: Rewrite learn/page.tsx**

Pillar: learn, types: lesson | guide | resource | pattern

- [ ] **Step 5: Rewrite system/page.tsx**

Pillar: system, types: playbook | persona | starter

- [ ] **Step 6: Remove old pillar-section.tsx if no longer imported**

Check if `pillar-section.tsx` is still used anywhere. If not, delete it.

- [ ] **Step 7: Verify all 4 hubs on dev server**

Navigate to /pulse, /build, /learn, /system. Check: tinted headers, filter pills work, cards render with new design, stagger animations fire.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: redesign all 4 pillar hub pages"
```

---

## Task 9: Content Detail Pages

**Files:**
- Create: `src/components/content/toc-sidebar.tsx`
- Create: `src/components/content/mobile-toc.tsx`
- Modify: `src/app/(marketing)/pulse/[slug]/page.tsx`
- Modify: `src/app/(marketing)/build/[slug]/page.tsx`
- Modify: `src/app/(marketing)/learn/[slug]/page.tsx`
- Modify: `src/app/(marketing)/system/[slug]/page.tsx`

- [ ] **Step 1: Create TocSidebar**

Create `src/components/content/toc-sidebar.tsx`:

Client component. Extracts headings from the rendered MDX content (querySelectorAll h2, h3). Renders as a sticky sidebar with:
- "On this page" heading (DM Sans with tracking, not monospace)
- List of heading links with left border active state (accent-colored)
- Active state updates on scroll via IntersectionObserver on headings
- BookmarkButton below the ToC
- Hidden below lg breakpoint

- [ ] **Step 2: Create MobileToc**

Create `src/components/content/mobile-toc.tsx`:

Client component. Collapsible bar below metadata. Shows "On this page ▾" label. Expands on tap to show heading links. Collapses after selection. Visible only below lg breakpoint.

- [ ] **Step 3: Create shared content detail layout**

Since all 4 pillar [slug] pages follow the same pattern, either:
- Create a shared `ContentDetailLayout` component used by all 4, or
- Update each page individually

Layout structure:
1. ScrollProgress bar at top
2. Max-width container (1300px), padding
3. Metadata row: Pill(pillar) + Pill(type) + Pill(time) + Pill(difficulty)
4. Title (text-h1)
5. Description (text-body, fg-secondary)
6. Divider (hairline)
7. Two-column grid: prose column (max-w-[720px]) + TocSidebar
8. MobileToc (visible below lg)
9. Bottom: related content cards row

- [ ] **Step 4: Update all 4 [slug]/page.tsx files**

Apply the new layout to pulse/[slug], build/[slug], learn/[slug], system/[slug]. Keep existing data fetching logic (generateStaticParams, MDX loading, etc.).

- [ ] **Step 5: Verify on dev server**

Navigate to any content page. Check: progress bar tracks scroll, ToC highlights active heading, sidebar sticks, mobile ToC collapses/expands, pills render correctly, prose styling is clean.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: content detail pages — ToC sidebar, progress bar, new layout"
```

---

## Task 10: Tools, Showcase, Arena Pages

**Files:**
- Modify: `src/app/(marketing)/tools/page.tsx`
- Modify: `src/app/(marketing)/tools/[slug]/page.tsx`
- Modify: `src/app/(marketing)/showcase/page.tsx`
- Modify: `src/app/(marketing)/build/arena/page.tsx`

- [ ] **Step 1: Redesign tools directory**

Rewrite `/tools/page.tsx`:
- Section header with count badge
- Category filter pills (client-side, same pattern as pillar hubs)
- StaggerGrid of ToolCards (3 cols lg, 2 sm, 1 mobile)
- SectionDivider at top

- [ ] **Step 2: Redesign tool detail**

Rewrite `/tools/[slug]/page.tsx`:
- Tool header: logo + name + version pill + status pill
- Tabs (shadcn Tabs): Overview / Releases / Capabilities / Related
- Release timeline: vertical line with monospace dates, ScrollReveal per item
- Capability matrix: grouped by category, colored quality indicators

- [ ] **Step 3: Redesign showcase**

Rewrite `/showcase/page.tsx`:
- Header with "Submit your build" CTA (MagneticButton)
- Tool filter pills
- StaggerGrid of project cards: placeholder image, title, description, tool pills, build time
- Seed initial content with Ethan's projects (Meridian, RidgeCap, NexusWatch, LongTable) as static data or `showcase_projects` inserts

- [ ] **Step 4: Redesign arena**

Rewrite `/build/arena/page.tsx`:
- Section header with challenge count
- Challenge cards: split layout, tool labels, entry count, time limit
- Empty state with "No active challenges" message

- [ ] **Step 5: Verify all pages on dev server**

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: redesign tools, showcase, and arena pages"
```

---

## Task 11: Dark Mode Pass

**Files:**
- Modify: `src/app/globals.css` (dark token refinements)
- Modify: multiple components (dark-specific tweaks)

- [ ] **Step 1: Verify all dark tokens are defined**

Check that every CSS variable used in components has a `.dark` override in globals.css. The tokens from Task 1 cover the basics, but verify:
- Pillar surfaces are deep tints (not just inverted)
- Shadows are `none` in dark mode (replaced by border glow where needed)
- Grain overlay opacity increases to 3% (already handled in GrainOverlay component)

- [ ] **Step 2: Test every page in dark mode**

Toggle to dark mode and navigate through: homepage, all 4 pillar hubs, a content detail page, tools directory, tool detail, showcase, arena. Fix any:
- Unreadable text (contrast too low)
- Missing dark surface colors on cards
- Borders that disappear
- Generative mesh that's too bright or invisible

- [ ] **Step 3: Dark mode for generative mesh**

Update `generative-mesh.tsx` to detect dark mode (via `document.documentElement.classList.contains('dark')`) and adjust:
- Dot color: `rgba(96, 165, 250, alpha)` (lighter blue)
- Line color: `rgba(40, 50, 70, 0.2)`

- [ ] **Step 4: Dark mode for bento grid**

Ensure bento tile backgrounds use `bg-subtle` or `bg-muted` tokens (not hardcoded whites). The live ticker and agent replay areas should use darker tinted surfaces.

- [ ] **Step 5: Verify both themes end-to-end**

Full scroll-through of homepage + one content page in both light and dark. Everything should look intentionally designed in both themes.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: full dark mode pass — all pages, mesh, bento, cards"
```

---

## Task 12: OG Images

**Files:**
- Modify: `src/app/api/og/route.tsx` (rewrite templates)

- [ ] **Step 1: Redesign OG image template**

Rewrite the OG route with a branded template system:
- White background
- Left edge: 6px pillar color band (full height)
- Title in Space Grotesk (loaded via Google Fonts URL fetch)
- `// prototype.studio` in bottom-right corner (monospace, light gray)
- Per-type variants:
  - Content pages: pillar color band + title + pillar name pill
  - Tool pages: tool logo (if available) + name + version
  - Homepage/default: gradient band + "Build Real Products. With AI."

Edge runtime stays. Keep rate limiting logic.

- [ ] **Step 2: Test OG images**

```bash
curl "http://localhost:3000/api/og?title=Claude+Code+v2.1.149&pillar=pulse&type=brief" -o /tmp/og-test.png
open /tmp/og-test.png
```

Verify: white bg, blue band on left, title renders in Space Grotesk, comment mark in corner.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: branded OG image templates — pillar colors, Space Grotesk"
```

---

## Task 13: Responsive + Accessibility Polish

**Files:**
- Modify: multiple component files
- Modify: `src/components/layout/marketing-nav.tsx` (mobile menu)

- [ ] **Step 1: Mobile navigation**

Add hamburger menu to marketing-nav for mobile:
- Hidden on lg+, visible below lg
- Tap opens full-screen overlay with staggered link reveal (GSAP or CSS animation)
- Overlay: white bg, centered links, close button top-right
- Links animate in with stagger on open, out on close

- [ ] **Step 2: Responsive grid breakpoints**

Verify all grid layouts follow:
- Mobile (<640px): 1 column
- sm (640px): 2 columns
- lg (1024px): 3-4 columns

Check: pillar cards (4→2→1), content cards (3→2→1), bento grid (4→2→1), tool cards (3→2→1).

- [ ] **Step 3: Scroll-pinned section mobile fallback**

On mobile, the PinnedPillars section should NOT pin. Instead, render as a static stack of 4 pillar cards (same design as PillarCard). Detect screen width on mount and skip GSAP ScrollTrigger setup if < 1024px.

- [ ] **Step 4: Horizontal showcase mobile**

Ensure HorizontalShowcase works with touch drag on mobile. Arrow buttons hidden on mobile (touch is native). Cards should be narrower on mobile (280px instead of 380px).

- [ ] **Step 5: prefers-reduced-motion audit**

Check every animation component:
- GenerativeMesh: renders static grid, no mouse tracking ✓
- WordReveal: words render in final position ✓
- CursorSpotlight: hidden ✓
- ScrollReveal: elements visible immediately ✓
- StaggerGrid: elements visible immediately ✓
- PinnedPillars: renders static card stack ✓
- NumberTheater: shows final numbers immediately ✓
- BentoGrid: tiles visible immediately ✓
- MagneticButton: no magnetic effect ✓
- PillarCard: no tilt effect ✓

- [ ] **Step 6: Verify on mobile viewport**

Use browser devtools to test at 375px (iPhone) and 768px (iPad). Full homepage scroll, a pillar hub, and a content detail page. Fix any overflow, text truncation, or spacing issues.

- [ ] **Step 7: Run build + lint + typecheck**

```bash
npm run lint && npx tsc --noEmit && npm run build
```

Fix any errors.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: responsive + accessibility — mobile nav, breakpoints, reduced motion"
```

---

## Task 14: Final Integration + Cleanup

**Files:**
- Modify: `src/app/(marketing)/layout.tsx` (if needed)
- Delete: any remaining dead imports/files
- Modify: `CLAUDE.md` (update conventions)

- [ ] **Step 1: Dead code cleanup**

Search for any remaining imports of deleted components:

```bash
grep -r "hero-section\|curriculum-section\|founding-counter\|pricing-section\|role-tracks\|what-you-build\|free-content-hub" src/ --include="*.tsx" --include="*.ts"
```

Remove any dead imports or references.

- [ ] **Step 2: Update CLAUDE.md conventions**

Update the Conventions section in CLAUDE.md:
- Change "Dark theme default" → "Light theme default, dark equally supported"
- Add: "Typography: Space Grotesk (display), DM Sans (body), JetBrains Mono (data/code only)"
- Add: "Animation: GSAP + ScrollTrigger for scroll-driven motion. All motion respects prefers-reduced-motion."
- Add: "Monospace for data only — never for brand identity, nav, or labels"

- [ ] **Step 3: Full end-to-end test**

Run through EVERY page in both themes:
- [ ] Homepage (light + dark)
- [ ] /pulse hub
- [ ] /build hub
- [ ] /learn hub
- [ ] /system hub
- [ ] A content detail page
- [ ] /tools directory
- [ ] /tools/[slug] detail
- [ ] /showcase
- [ ] /build/arena
- [ ] Mobile viewport (375px)

- [ ] **Step 4: Run full test suite**

```bash
npx vitest run
```

Fix any broken tests (likely snapshot tests or component render tests that reference old markup).

- [ ] **Step 5: Production build**

```bash
npm run build
```

Verify 0 errors, check build output for page count.

- [ ] **Step 6: Final commit**

```bash
git add -A && git commit -m "feat: visual design overhaul complete — cleanup + conventions update"
```

- [ ] **Step 7: Push**

```bash
git push origin main
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Design system foundation | globals.css, layout.tsx, gsap.ts |
| 2 | Motion utilities + grain | use-gsap.ts, scroll-reveal, grain-overlay |
| 3 | Shared components | pill, section-divider, magnetic-button |
| 4 | Card components | pillar-card, content-card, tool-card |
| 5 | Nav + footer redesign | marketing-nav, footer |
| 6 | Hero section | generative-mesh, word-reveal, cursor-spotlight |
| 7 | Homepage all sections | pinned-pillars, bento, showcase, stats |
| 8 | Pillar hub pages | pulse, build, learn, system hubs |
| 9 | Content detail pages | toc-sidebar, mobile-toc, [slug] pages |
| 10 | Tools, showcase, arena | tools, tool detail, showcase, arena |
| 11 | Dark mode pass | All components dark adjustments |
| 12 | OG images | api/og route rewrite |
| 13 | Responsive + a11y | Mobile nav, breakpoints, reduced motion |
| 14 | Final integration | Cleanup, CLAUDE.md, full test |

**Estimated total: 14 tasks, ~90 steps**
