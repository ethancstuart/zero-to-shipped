import { describe, it, expect, beforeAll } from 'vitest'
import {
  generateUnsubscribeToken,
  verifyUnsubscribeToken,
  generateEmailUnsubscribeToken,
  verifyEmailUnsubscribeToken,
} from '@/lib/email/tokens'

/**
 * Extended token tests beyond the basics covered in tokens.test.ts.
 * Focuses on determinism, cross-type isolation, and edge cases.
 */

beforeAll(() => {
  process.env.CRON_SECRET = 'extended-test-secret-key'
})

describe('token determinism', () => {
  it('generates the same token for the same userId', () => {
    const token1 = generateUnsubscribeToken('user-deterministic')
    const token2 = generateUnsubscribeToken('user-deterministic')
    expect(token1).toBe(token2)
  })

  it('generates the same token for the same email', () => {
    const token1 = generateEmailUnsubscribeToken('same@test.com')
    const token2 = generateEmailUnsubscribeToken('same@test.com')
    expect(token1).toBe(token2)
  })

  it('generates different tokens for different userIds', () => {
    const token1 = generateUnsubscribeToken('user-a')
    const token2 = generateUnsubscribeToken('user-b')
    expect(token1).not.toBe(token2)
  })

  it('generates different tokens for different emails', () => {
    const token1 = generateEmailUnsubscribeToken('a@test.com')
    const token2 = generateEmailUnsubscribeToken('b@test.com')
    expect(token1).not.toBe(token2)
  })
})

describe('cross-type isolation', () => {
  it('user token cannot be verified as email token', () => {
    const token = generateUnsubscribeToken('cross-test-id')
    const result = verifyEmailUnsubscribeToken(token)
    expect(result).toBeNull()
  })

  it('email token cannot be verified as user token', () => {
    const token = generateEmailUnsubscribeToken('cross@test.com')
    const result = verifyUnsubscribeToken(token)
    // The signatures differ because email tokens use "email:" prefix
    expect(result).toBeNull()
  })
})

describe('edge case inputs', () => {
  it('handles userId with special characters', () => {
    const userId = 'user-with-special/chars+and=stuff'
    const token = generateUnsubscribeToken(userId)
    expect(verifyUnsubscribeToken(token)).toBe(userId)
  })

  it('handles email with plus addressing', () => {
    const email = 'user+tag@example.com'
    const token = generateEmailUnsubscribeToken(email)
    expect(verifyEmailUnsubscribeToken(token)).toBe(email)
  })

  it('handles very long userId', () => {
    const userId = 'a'.repeat(500)
    const token = generateUnsubscribeToken(userId)
    expect(verifyUnsubscribeToken(token)).toBe(userId)
  })

  it('handles UUID-format userId', () => {
    const userId = '550e8400-e29b-41d4-a716-446655440000'
    const token = generateUnsubscribeToken(userId)
    expect(verifyUnsubscribeToken(token)).toBe(userId)
  })

  it('handles unicode in email', () => {
    const email = 'ünïcödë@example.com'
    const token = generateEmailUnsubscribeToken(email)
    expect(verifyEmailUnsubscribeToken(token)).toBe(email)
  })
})

describe('tamper detection', () => {
  it('detects modification of the payload portion', () => {
    const token = generateUnsubscribeToken('original-user')
    const [, sig] = token.split(':')
    const tampered = `${Buffer.from('tampered-user').toString('base64url')}:${sig}`
    expect(verifyUnsubscribeToken(tampered)).toBeNull()
  })

  it('detects modification of the signature portion', () => {
    const token = generateUnsubscribeToken('original-user')
    const [payload] = token.split(':')
    const tampered = `${payload}:${Buffer.from('bad-sig').toString('base64url')}`
    expect(verifyUnsubscribeToken(tampered)).toBeNull()
  })

  it('detects swapping payload and signature', () => {
    const token = generateUnsubscribeToken('swap-test')
    const [payload, sig] = token.split(':')
    const swapped = `${sig}:${payload}`
    expect(verifyUnsubscribeToken(swapped)).toBeNull()
  })
})
