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

/** Mirrors the backend's `normalizeIdList`: trimmed, non-empty strings only. */
export function normalizeIdList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(entry => entry !== null && entry !== undefined)
    .map(entry => String(entry).trim())
    .filter(Boolean);
}

/** Realm `policies.guests` as the picker needs it. */
export function toGuestPolicy(
  guests: { allowed?: boolean; allowedHomeRealms?: unknown } | undefined | null
): GuestPolicy | undefined {
  if (!guests) return undefined;
  return {
    allowed: guests.allowed === true,
    allowedHomeRealms: normalizeIdList(guests.allowedHomeRealms),
  };
}

/**
 * What the backend makes of a user added to a team of `realmTeamId`: no home realm or
 * this realm as home -> a home user; a home realm elsewhere -> a guest.
 */
export function classifyCandidate(
  user: Pick<User, 'homeRealm'>,
  realmTeamId: string
): RealmMembershipType {
  const home = user.homeRealm ? String(user.homeRealm) : null;
  if (!home || home === String(realmTeamId)) return 'home';
  return 'guest';
}

export type CandidateContext = {
  /** The realm the team belongs to (the team itself or its top-most ancestor). */
  realmTeamId?: string;
  /** The realm's `policies.guests`. Unknown (not loaded) leaves the decision to the backend. */
  guests?: GuestPolicy;
  /** Users already in the team. */
  existingMemberIds?: ReadonlySet<string> | readonly string[];
};

function hasId(
  ids: ReadonlySet<string> | readonly string[] | undefined,
  id: string
): boolean {
  if (!ids) return false;
  return Array.isArray(ids)
    ? ids.includes(id)
    : (ids as ReadonlySet<string>).has(id);
}

/** Why a candidate cannot be added, or `undefined` when it can. */
export function candidateIneligibility(
  user: Pick<User, '_id' | 'homeRealm'>,
  { realmTeamId, guests, existingMemberIds }: CandidateContext = {}
): string | undefined {
  if (hasId(existingMemberIds, user._id)) return 'Already a member';
  if (!realmTeamId || !guests) return undefined;
  if (classifyCandidate(user, realmTeamId) !== 'guest') return undefined;
  if (!guests.allowed) return 'Guests are not allowed';
  const trusted = normalizeIdList(guests.allowedHomeRealms);
  if (trusted.length > 0 && !trusted.includes(String(user.homeRealm))) {
    return 'Home realm is not trusted by this realm';
  }
  return undefined;
}

/**
 * Whether the backend would accept `user` into the team: not a member yet and, when
 * classified as a guest, allowed by `policies.guests`. Global users are always
 * eligible (they become home users of the realm).
 */
export function isCandidateEligible(
  user: Pick<User, '_id' | 'homeRealm'>,
  context: CandidateContext = {}
): boolean {
  return candidateIneligibility(user, context) === undefined;
}

export type PickerEligibility = {
  selectable: boolean;
  /** `guest`: shown as a "Will join as guest" badge. */
  hint?: 'guest';
  /** Why the row is disabled. */
  reason?: string;
};

/** Eligibility plus the picker hint for one row. */
export function getPickerEligibility(
  user: Pick<User, '_id' | 'homeRealm'>,
  context: CandidateContext = {}
): PickerEligibility {
  const reason = candidateIneligibility(user, context);
  if (reason) return { selectable: false, reason };
  if (
    context.realmTeamId &&
    classifyCandidate(user, context.realmTeamId) === 'guest'
  ) {
    return { selectable: true, hint: 'guest' };
  }
  return { selectable: true };
}

/** The members search matches users by id only for 24-hex ids (`AuthUtils.fetchMembers`). */
const SEARCHABLE_MEMBER_ID = /^[a-fA-F0-9]{24}$/;

export function isSearchableMemberId(id: string): boolean {
  return SEARCHABLE_MEMBER_ID.test(id);
}

export type MembershipLookup = 'new' | 'existing' | 'unknown';

/**
 * Reads the result of a members search for `id` (`getTeamMembers(..., { search: id })`).
 * A search that matched the user means they are a member already; an empty result only
 * proves they are not when the backend can search that id (24-hex). Anything else
 * (other id formats, a failed lookup) is `unknown` and never treated as new.
 */
export function interpretMembershipLookup(
  id: string,
  result: { members: readonly { _id: string }[] } | undefined
): MembershipLookup {
  if (!result) return 'unknown';
  if (result.members.some(member => member._id === id)) return 'existing';
  return isSearchableMemberId(id) ? 'new' : 'unknown';
}

/* -------------------------------------------------------------------------- */
/* Users page                                                                 */
/* -------------------------------------------------------------------------- */

/** How many realms the Users page loads for its filter and selects. */
export const MAX_REALMS_IN_FILTERS = 100;

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
