import { z } from 'zod';

export const EMAIL_MAX = 254;

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(EMAIL_MAX, 'Enter an email address up to 254 characters')
  .email('Enter a valid email address');

export function changeEmailSchema(currentEmail: string) {
  const current = currentEmail.trim().toLowerCase();
  return z.object({
    email: emailSchema.refine(
      value => value !== current,
      'Enter a different email address'
    ),
    verified: z.boolean(),
  });
}

/** E.164 after spaces, dashes, and parentheses are removed. Syntactic only. */
export const E164 = /^\+[1-9]\d{6,14}$/;

export function normalizePhone(value: string): string {
  return value.trim().replace(/[\s\-()]/g, '');
}

export const phoneSchema = z
  .string()
  .transform(normalizePhone)
  .refine(
    value => E164.test(value),
    'Use international format, e.g. +306912345678'
  );

const PASSWORD_MAX = 128;
const PASSWORD_MIN = 8;

/**
 * The admin API's only password rule is a minimum length.
 * TODO: pass local password policy from getAuthenticationSettings when the backend adds one.
 */
export function adminPasswordSchema(config?: { minLength?: number }) {
  const min = config?.minLength ?? PASSWORD_MIN;
  return z
    .string()
    .min(min, `Password must be at least ${min} characters long`)
    .max(PASSWORD_MAX, `Password must be at most ${PASSWORD_MAX} characters`);
}

export function adminPasswordFormSchema(config?: { minLength?: number }) {
  return z
    .object({
      password: adminPasswordSchema(config),
      confirm: z.string(),
      revokeSessions: z.boolean(),
    })
    .refine(value => value.password === value.confirm, {
      message: 'Passwords do not match',
      path: ['confirm'],
    });
}

export function passwordByteLength(password: string): number {
  return new TextEncoder().encode(password).length;
}

export function emailChangeError(failure: {
  code: string;
  message: string;
}): string | undefined {
  if (
    failure.code === 'INVALID_ARGUMENT' &&
    /already exists/i.test(failure.message)
  ) {
    return 'Another account in this scope already uses this email';
  }
  if (
    failure.code === 'EMAIL_NOT_ALLOWED' ||
    /not allowed/i.test(failure.message)
  ) {
    return failure.message;
  }
  if (failure.code === 'INVALID_ARGUMENT' && /email/i.test(failure.message)) {
    return failure.message;
  }
  return undefined;
}
