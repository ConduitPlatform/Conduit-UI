import type { Realm, RealmMembershipType } from '@/lib/models/Realm';
import type { User } from '@/lib/models/User';

/**
 * Pure helpers for the realm-aware parts of the Members tab and the Users page
 * (picker eligibility, filter mapping, slug lookups). No React, no I/O.
 */

/** Role the backend assigns when a member is added without one. */
export const DEFAULT_MEMBER_ROLE = 'member';

export const HOME_USER_REMOVAL_TOOLTIP =
  'Home users cannot be removed from their realm. Block or move them instead.';

/* -------------------------------------------------------------------------- */
/* Members tab                                                                */
/* -------------------------------------------------------------------------- */

/** A home user cannot be removed from the realm team itself (sub-teams are fine). */
export function isRemovalBlocked(
  membershipType: RealmMembershipType | undefined,
  isRealmTeam: boolean
): boolean {
  return isRealmTeam && membershipType === 'home';
}

export type GuestPolicy = {
  allowed: boolean;
  /** Realm team ids. `[]` = any home realm, including global. */
  allowedHomeRealms: string[];
};

export type PickerContext = {
  /** Set when the picker adds to a realm team (guest semantics). */
  realmTeamId?: string;
  /** The realm's `policies.guests`. Unknown (not loaded) behaves as "allowed". */
  guestPolicy?: GuestPolicy;
  /** Users already in the team (so they cannot be picked twice). */
  memberIds?: ReadonlySet<string>;
};

export type PickerEligibility = {
  selectable: boolean;
  /** Shown as a badge next to the user. */
  hint?: 'guest';
  /** Why the row is disabled. */
  reason?: string;
};

/**
 * Whether `user` can be picked in the add-member sheet.
 *
 * Realm teams that disallow guests only accept users without a home realm. When guests
 * are allowed, everybody is selectable (unless the realm trusts specific home realms,
 * which the backend enforces too) and users homed elsewhere are hinted as guests.
 */
export function getPickerEligibility(
  user: Pick<User, '_id' | 'homeRealm'>,
  { realmTeamId, guestPolicy, memberIds }: PickerContext = {}
): PickerEligibility {
  if (memberIds?.has(user._id)) {
    return { selectable: false, reason: 'Already a member' };
  }
  if (!realmTeamId) return { selectable: true };

  const homeRealm = user.homeRealm || undefined;
  if (homeRealm === realmTeamId) {
    return { selectable: false, reason: 'Home user of this realm' };
  }
  if (!guestPolicy) {
    return {
      selectable: true,
      ...(homeRealm ? { hint: 'guest' as const } : {}),
    };
  }
  if (!guestPolicy.allowed) {
    return homeRealm
      ? { selectable: false, reason: 'Belongs to another realm' }
      : { selectable: true };
  }
  const trusted = guestPolicy.allowedHomeRealms;
  if (trusted.length > 0 && (!homeRealm || !trusted.includes(homeRealm))) {
    return {
      selectable: false,
      reason: 'Home realm is not trusted by this realm',
    };
  }
  return { selectable: true, ...(homeRealm ? { hint: 'guest' as const } : {}) };
}

/* -------------------------------------------------------------------------- */
/* Users page                                                                 */
/* -------------------------------------------------------------------------- */

export const HOME_REALM_ALL = 'all';
export const HOME_REALM_GLOBAL = 'global';

/** `teamId -> slug` for every realm, to label ids that come back on users. */
export function buildRealmSlugMap(
  realms: readonly Realm[]
): Map<string, string> {
  const map = new Map<string, string>();
  for (const realm of realms) {
    const slug = realm.team.realm?.slug;
    if (slug) map.set(realm.team._id, slug);
  }
  return map;
}

/** Slug for a realm team id, falling back to the raw id when the realm is unknown. */
export function realmLabel(
  teamId: string,
  slugs: ReadonlyMap<string, string> | undefined
): string {
  return slugs?.get(teamId) ?? teamId;
}

/** Select value -> `homeRealm` query param (`'global'` or a team id). `all` = no filter. */
export function homeRealmFilterToParam(value: string): string | undefined {
  return value === HOME_REALM_ALL || value === '' ? undefined : value;
}

/** `homeRealm` query param -> Select value. */
export function homeRealmParamToFilter(
  param: string | null | undefined
): string {
  return param ? param : HOME_REALM_ALL;
}

/** Next URL search params after the filter changed; the page restarts from the first. */
export function withHomeRealmFilter(
  current: URLSearchParams | string,
  value: string
): URLSearchParams {
  const params = new URLSearchParams(current.toString());
  const param = homeRealmFilterToParam(value);
  if (param) params.set('homeRealm', param);
  else params.delete('homeRealm');
  params.delete('skip');
  return params;
}

/** Create/move target: the Select value `'global'` means "no home realm". */
export function homeRealmSelectionToTeamId(value: string): string | null {
  return value === HOME_REALM_GLOBAL || value === '' ? null : value;
}
