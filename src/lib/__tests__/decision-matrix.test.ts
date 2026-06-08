import { describe, it, expect } from 'vitest'
import {
  recommendQuick,
  recommendDeep,
  type DeepAnswers,
  type QuickAnswers,
} from '../decision-matrix'

describe('decision matrix — quick mode', () => {
  it('routes terminal-scary users to Cursor regardless of preference', () => {
    const result = recommendQuick({
      building: 'web-app',
      comfort: 'terminal-scary',
      preference: 'just-done',
    })
    expect(result.primary.slug).toBe('cursor')
    expect(result.primary.reasoning).toMatch(/VS Code/)
  })

  it('routes terminal-scary craft-seekers to Cursor too', () => {
    const result = recommendQuick({
      building: 'web-app',
      comfort: 'terminal-scary',
      preference: 'learn-craft',
    })
    expect(result.primary.slug).toBe('cursor')
  })

  it('routes terminal-native craft-seekers to Claude Code', () => {
    const result = recommendQuick({
      building: 'web-app',
      comfort: 'terminal-native',
      preference: 'learn-craft',
    })
    expect(result.primary.slug).toBe('claude-code')
    expect(result.primary.reasoning).toMatch(/Claude Code/)
  })

  it('routes terminal-native + just-done to Codex (leading edge)', () => {
    const result = recommendQuick({
      building: 'web-app',
      comfort: 'terminal-native',
      preference: 'just-done',
    })
    expect(result.primary.slug).toBe('codex')
    expect(result.primary.reasoning).toMatch(/leading edge/i)
  })

  it('routes prototype + can-install to Lovable', () => {
    const result = recommendQuick({
      building: 'prototype',
      comfort: 'can-install',
      preference: 'just-done',
    })
    expect(result.primary.slug).toBe('lovable')
  })

  it('routes doc-spec + can-install to Lovable', () => {
    const result = recommendQuick({
      building: 'doc-spec',
      comfort: 'can-install',
      preference: 'just-done',
    })
    expect(result.primary.slug).toBe('lovable')
  })

  it('routes web-app + can-install to Cursor', () => {
    const result = recommendQuick({
      building: 'web-app',
      comfort: 'can-install',
      preference: 'just-done',
    })
    expect(result.primary.slug).toBe('cursor')
  })

  it('always returns 1-2 alternates', () => {
    const cases: QuickAnswers[] = [
      { building: 'web-app', comfort: 'terminal-scary', preference: 'just-done' },
      { building: 'web-app', comfort: 'terminal-native', preference: 'learn-craft' },
      { building: 'web-app', comfort: 'terminal-native', preference: 'just-done' },
      { building: 'prototype', comfort: 'can-install', preference: 'just-done' },
      { building: 'web-app', comfort: 'can-install', preference: 'just-done' },
    ]
    for (const c of cases) {
      const r = recommendQuick(c)
      expect(r.alternates.length).toBeGreaterThanOrEqual(1)
      expect(r.alternates.length).toBeLessThanOrEqual(2)
      // alternates should not include the primary
      for (const alt of r.alternates) {
        expect(alt.slug).not.toBe(r.primary.slug)
      }
    }
  })

  it('includes company slug on every recommendation', () => {
    const r = recommendQuick({
      building: 'web-app',
      comfort: 'terminal-native',
      preference: 'learn-craft',
    })
    expect(r.primary.company).toBe('anthropic')
    expect(r.primary.slug).toBe('claude-code')
  })
})

describe('decision matrix — deep mode', () => {
  it('respects quick-mode routing when no deep signal pushes against it', () => {
    const result = recommendDeep({
      building: 'web-app',
      comfort: 'terminal-native',
      preference: 'learn-craft',
      output: 'code-i-read',
      size: 'long-term',
      budget: 'subscription-ok',
      team: 'solo',
    })
    expect(result.primary.slug).toBe('claude-code')
  })

  it('boosts visual-ui tools when user wants visual UI', () => {
    const answers: DeepAnswers = {
      building: 'prototype',
      comfort: 'can-install',
      preference: 'just-done',
      output: 'visual-ui',
      size: 'quick-prototype',
      budget: 'free-only',
      team: 'solo',
    }
    const result = recommendDeep(answers)
    // Should land on a visual-builder
    expect(['lovable', 'v0', 'bolt', 'replit']).toContain(result.primary.slug)
  })

  it('de-emphasizes Codex when budget is free-only', () => {
    const result = recommendDeep({
      building: 'web-app',
      comfort: 'terminal-native',
      preference: 'just-done',
      output: 'code-i-read',
      size: 'production-app',
      budget: 'free-only',
      team: 'solo',
    })
    expect(result.primary.slug).not.toBe('codex')
  })

  it('prefers reviewable-diff tools when team includes engineers', () => {
    const result = recommendDeep({
      building: 'web-app',
      comfort: 'terminal-native',
      preference: 'just-done',
      output: 'code-i-read',
      size: 'production-app',
      budget: 'subscription-ok',
      team: 'with-engineers',
    })
    // Should prefer Claude Code, Codex, or Cursor — not visual builders.
    expect(['claude-code', 'codex', 'cursor']).toContain(result.primary.slug)
  })

  it('always returns 1-2 alternates in deep mode', () => {
    const result = recommendDeep({
      building: 'web-app',
      comfort: 'terminal-native',
      preference: 'learn-craft',
      output: 'code-i-read',
      size: 'long-term',
      budget: 'subscription-ok',
      team: 'with-engineers',
    })
    expect(result.alternates.length).toBeGreaterThanOrEqual(1)
    expect(result.alternates.length).toBeLessThanOrEqual(2)
  })
})
