import type { User } from '@/lib/models/User';

/** Fields the verify action needs from a user row. */
export type UserVerificationTarget = Pick<
  User,
  '_id' | 'email' | 'hasTwoFA' | 'phoneNumber'
>;

/**
 * Body for `PATCH /authentication/users/:id` when only verification changes.
 * The admin handler reads `email.toLowerCase()`, so email is always sent.
 * `hasTwoFA` is included when the row has it: the handler writes `twoFaMethod`
 * only when `hasTwoFA` is true, and omits it otherwise.
 */
export function userVerificationPatch(
  user: Pick<User, 'email' | 'hasTwoFA' | 'phoneNumber'>,
  isVerified: boolean
): {
  email: string;
  isVerified: boolean;
  hasTwoFA?: boolean;
  phoneNumber?: string;
} {
  return {
    email: user.email,
    isVerified,
    ...(typeof user.hasTwoFA === 'boolean' ? { hasTwoFA: user.hasTwoFA } : {}),
    ...(user.phoneNumber ? { phoneNumber: user.phoneNumber } : {}),
  };
}
