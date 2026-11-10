import type { User } from '@/lib/models/User';
import { userPatch, type UserAuthPatch } from '@/lib/authentication/userPatch';

/** Fields the verify action needs from a user row. */
export type UserVerificationTarget = Pick<
  User,
  '_id' | 'email' | 'hasTwoFA' | 'phoneNumber'
>;

/**
 * Body for `PATCH /authentication/users/:id` when only verification changes.
 * Built by `userPatch` so the allow-list stays in one place.
 */
export function userVerificationPatch(
  user: Pick<User, 'email' | 'hasTwoFA' | 'phoneNumber'>,
  isVerified: boolean
): UserAuthPatch {
  return userPatch(user, { isVerified });
}
