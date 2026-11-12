import { describe, expect, it } from 'vitest';
import {
  adminPasswordFormSchema,
  changeEmailSchema,
  emailChangeError,
  emailSchema,
  phoneSchema,
} from '@/lib/authentication/userValidation';

describe('emailSchema', () => {
  it('trims and lowercases a valid address', () => {
    expect(emailSchema.parse('  Ann@Acme.TEST ')).toBe('ann@acme.test');
  });

  it('rejects an invalid or oversized address', () => {
    expect(emailSchema.safeParse('not-an-email').success).toBe(false);
    expect(emailSchema.safeParse(`${'a'.repeat(250)}@b.com`).success).toBe(
      false
    );
  });

  it('requires a different address than the current one', () => {
    const schema = changeEmailSchema(' Ann@Acme.TEST ');
    expect(
      schema.safeParse({ email: 'ann@acme.test', verified: true }).success
    ).toBe(false);
    expect(
      schema.safeParse({ email: 'new@acme.test', verified: true }).success
    ).toBe(true);
  });
});

describe('phoneSchema', () => {
  it('normalizes separators and accepts the E.164 bounds', () => {
    expect(phoneSchema.parse('+30 691-234-5678')).toBe('+306912345678');
    expect(phoneSchema.parse('+(30) 691-234-5678')).toBe('+306912345678');
    expect(phoneSchema.parse('+1234567')).toBe('+1234567');
    expect(phoneSchema.parse('+123456789012345')).toBe('+123456789012345');
  });

  it('rejects numbers outside E.164', () => {
    for (const value of [
      '+123456',
      '+01234567',
      '306912345678',
      '+1234567890123456',
      '',
    ]) {
      const parsed = phoneSchema.safeParse(value);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues[0]?.message).toBe(
          'Use international format, e.g. +306912345678'
        );
      }
    }
  });
});

describe('adminPasswordFormSchema', () => {
  const schema = adminPasswordFormSchema();

  it('accepts a matching password inside the length bounds', () => {
    expect(
      schema.safeParse({
        password: 'secret123',
        confirm: 'secret123',
        revokeSessions: true,
      }).success
    ).toBe(true);
    expect(
      schema.safeParse({
        password: 'a'.repeat(128),
        confirm: 'a'.repeat(128),
        revokeSessions: false,
      }).success
    ).toBe(true);
  });

  it('rejects a short, a long, or a mismatched password', () => {
    expect(
      schema.safeParse({
        password: 'short',
        confirm: 'short',
        revokeSessions: true,
      }).success
    ).toBe(false);
    expect(
      schema.safeParse({
        password: 'a'.repeat(129),
        confirm: 'a'.repeat(129),
        revokeSessions: true,
      }).success
    ).toBe(false);
    const mismatch = schema.safeParse({
      password: 'secret123',
      confirm: 'secret124',
      revokeSessions: true,
    });
    expect(mismatch.success).toBe(false);
    if (!mismatch.success) {
      expect(
        mismatch.error.issues.some(issue => issue.path[0] === 'confirm')
      ).toBe(true);
    }
  });
});

describe('emailChangeError', () => {
  it('maps a duplicate to a scope-specific field error and keeps allow-list text', () => {
    expect(
      emailChangeError({
        code: 'INVALID_ARGUMENT',
        message: 'Email already exists',
      })
    ).toBe('Another account in this scope already uses this email');
    expect(
      emailChangeError({
        code: 'EMAIL_NOT_ALLOWED',
        message: 'Address is not allowed',
      })
    ).toBe('Address is not allowed');
    expect(
      emailChangeError({ code: 'INTERNAL', message: 'Email already exists' })
    ).toBeUndefined();
  });
});
