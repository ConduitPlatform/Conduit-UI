/** Body keys `PATCH /authentication/users/:id` is allowed to carry. */
export type UserAuthPatch = {
  email?: string;
  isVerified?: boolean;
  hasTwoFA?: boolean;
  phoneNumber?: string;
};

export type UserPatchSource = {
  email?: string;
  isVerified?: boolean;
  hasTwoFA?: boolean;
  phoneNumber?: string;
};

export type UserPatchChanges = {
  email?: string;
  isVerified?: boolean;
  hasTwoFA?: boolean;
  phoneNumber?: string;
};

export type UserPatchOptions = {
  /**
   * Send only `changes`. For backends that patch just the fields they are sent:
   * a resent `hasTwoFA` or `phoneNumber` there is re-validated and rewrites the
   * 2FA method, which fails or alters accounts the change never touched.
   */
  changesOnly?: boolean;
};

function changesOnlyPatch(changes: UserPatchChanges): UserAuthPatch {
  const body: UserAuthPatch = {};
  if (typeof changes.email === 'string') {
    const normalized = changes.email.trim().toLowerCase();
    if (normalized) body.email = normalized;
  }
  if (typeof changes.isVerified === 'boolean') {
    body.isVerified = changes.isVerified;
  }
  if (typeof changes.hasTwoFA === 'boolean') body.hasTwoFA = changes.hasTwoFA;
  if (typeof changes.phoneNumber === 'string') {
    body.phoneNumber = changes.phoneNumber;
  }
  return body;
}

/**
 * Explicit allow-list for an admin user patch.
 * Email is resent when the account has one, because older handlers read
 * `email.toLowerCase()` on every patch. `hasTwoFA` is resent so the handler
 * does not clear `twoFaMethod`. Custom fields on the user object are ignored.
 * Pass `phoneNumber: ''` to clear it.
 */
export function userPatch(
  user: UserPatchSource,
  changes: UserPatchChanges = {},
  options: UserPatchOptions = {}
): UserAuthPatch {
  if (options.changesOnly) return changesOnlyPatch(changes);
  const body: UserAuthPatch = {};
  const email = changes.email !== undefined ? changes.email : user.email;
  if (typeof email === 'string') {
    const normalized = email.trim().toLowerCase();
    if (normalized) body.email = normalized;
  }
  if (typeof changes.isVerified === 'boolean') {
    body.isVerified = changes.isVerified;
  }
  const hasTwoFA =
    typeof changes.hasTwoFA === 'boolean' ? changes.hasTwoFA : user.hasTwoFA;
  if (typeof hasTwoFA === 'boolean') body.hasTwoFA = hasTwoFA;
  if (Object.prototype.hasOwnProperty.call(changes, 'phoneNumber')) {
    if (typeof changes.phoneNumber === 'string') {
      body.phoneNumber = changes.phoneNumber;
    }
  } else if (typeof user.phoneNumber === 'string' && user.phoneNumber !== '') {
    body.phoneNumber = user.phoneNumber;
  }
  return body;
}
