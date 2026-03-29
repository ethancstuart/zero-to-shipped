import { describe, it, expect, beforeAll } from 'vitest';
import {
  generateUnsubscribeToken,
  verifyUnsubscribeToken,
  generateEmailUnsubscribeToken,
  verifyEmailUnsubscribeToken,
} from '@/lib/email/tokens';

beforeAll(() => {
  process.env.CRON_SECRET = 'test-secret-key';
});

describe('generateUnsubscribeToken', () => {
  it('produces a token with two colon-separated parts', () => {
    const token = generateUnsubscribeToken('user-123');
    const parts = token.split(':');
    expect(parts).toHaveLength(2);
    expect(parts[0].length).toBeGreaterThan(0);
    expect(parts[1].length).toBeGreaterThan(0);
  });
});

describe('verifyUnsubscribeToken', () => {
  it('correctly verifies a valid token', () => {
    const token = generateUnsubscribeToken('user-456');
    const result = verifyUnsubscribeToken(token);
    expect(result).toBe('user-456');
  });

  it('returns null for tampered tokens', () => {
    const token = generateUnsubscribeToken('user-789');
    const tampered = token + 'x';
    expect(verifyUnsubscribeToken(tampered)).toBeNull();
  });

  it('returns null for malformed tokens', () => {
    expect(verifyUnsubscribeToken('not-a-valid-token')).toBeNull();
    expect(verifyUnsubscribeToken('')).toBeNull();
    expect(verifyUnsubscribeToken('a:b:c')).toBeNull();
  });
});

describe('generateEmailUnsubscribeToken', () => {
  it('works for email-based tokens', () => {
    const token = generateEmailUnsubscribeToken('test@example.com');
    const parts = token.split(':');
    expect(parts).toHaveLength(2);
  });
});

describe('verifyEmailUnsubscribeToken', () => {
  it('correctly verifies email tokens', () => {
    const token = generateEmailUnsubscribeToken('hello@test.com');
    const result = verifyEmailUnsubscribeToken(token);
    expect(result).toBe('hello@test.com');
  });
});

describe('round-trip', () => {
  it('generate then verify returns original userId', () => {
    const userId = 'abc-def-ghi';
    const token = generateUnsubscribeToken(userId);
    expect(verifyUnsubscribeToken(token)).toBe(userId);
  });

  it('generate then verify returns original email', () => {
    const email = 'roundtrip@example.com';
    const token = generateEmailUnsubscribeToken(email);
    expect(verifyEmailUnsubscribeToken(token)).toBe(email);
  });
});
