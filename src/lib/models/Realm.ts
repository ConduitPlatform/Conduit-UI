import type { Team } from '@/lib/models/Team';

/**
 * Authentication realms: shapes of the admin API (see the realms admin API contract).
 * A realm is a top-level team that owns an identity (home strategies) and policies.
 */

export const OAUTH_PROVIDER_KEYS = [
  'apple',
  'bitbucket',
  'facebook',
  'figma',
  'github',
  'gitlab',
  'google',
  'linkedin',
  'microsoft',
  'reddit',
  'slack',
  'twitch',
  'twitter',
] as const;

export type OAuthProviderKey = (typeof OAUTH_PROVIDER_KEYS)[number];

export type RealmMembershipType = 'home' | 'guest';

export type RealmOAuthStrategy = {
  enabled: boolean;
  /** Credentials are optional: empty/absent means "inherit the global provider config". */
  clientId?: string;
  /** Write-only. Reads return `hasClientSecret` instead. */
  clientSecret?: string;
  /** Read-only. */
  hasClientSecret?: boolean;
  redirect_uri?: string;
  accountLinking?: boolean;
  /** Apple only. Write-only. Reads return `hasPrivateKey`. */
  privateKey?: string;
  /** Read-only. */
  hasPrivateKey?: boolean;
  /** Apple only. */
  teamId?: string;
  /** Apple only. */
  keyId?: string;
};

export type RealmStrategies = {
  local: { enabled: boolean; verificationRequired?: boolean };
  username: { enabled: boolean };
  magicLink: { enabled: boolean };
  phone: { enabled: boolean };
  metamask: { enabled: boolean };
  biometric: { enabled: boolean };
  oauth: Partial<Record<OAuthProviderKey, RealmOAuthStrategy>>;
};

export type RealmPolicies = {
  requireTwoFa: boolean;
  requireVerifiedEmail: boolean;
  /** `[]` = any client. */
  allowedClientIds: string[];
  guests: {
    allowed: boolean;
    /** Realm team ids. `[]` = any home realm, including global. */
    allowedHomeRealms: string[];
  };
};

export type RealmRegistration = {
  allowWithoutInvite: boolean;
};

export type RealmSettings = {
  _id: string;
  /** Team _id. */
  team: string;
  active: boolean;
  strategies: RealmStrategies;
  registration: RealmRegistration;
  policies: RealmPolicies;
  createdAt: string;
  updatedAt: string;
};

export type RealmCounts = {
  home: number;
  guest: number;
};

/** Admin list/detail item. Secrets inside `settings` are masked (`has*` flags). */
export type Realm = {
  /** Team with `realm.enabled === true`. */
  team: Team;
  settings: RealmSettings;
  counts: RealmCounts;
};

export type RealmMembership = {
  _id: string;
  user: string;
  /** Realm team id. */
  realm: string;
  type: RealmMembershipType;
  createdAt: string;
};

export type DeepPartial<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

/** Settings fields shared by the promote (POST) and update (PATCH) request bodies. */
export type RealmSettingsPayload = {
  slug?: string;
  active?: boolean;
  strategies?: DeepPartial<RealmStrategies>;
  policies?: DeepPartial<RealmPolicies>;
  registration?: Partial<RealmRegistration>;
};

/** Body of `POST /authentication/teams/:teamId/realm`. The server fills anything omitted. */
export type PromoteRealmBody = Omit<RealmSettingsPayload, 'slug'> & {
  slug: string;
};

/** Body of `PATCH /authentication/teams/:teamId/realm` (deep merge, arrays replace). */
export type UpdateRealmBody = RealmSettingsPayload & {
  /** Changing the slug requires `force: true`. */
  force?: boolean;
};

/** Raw `DELETE /authentication/teams/:teamId/realm` response. */
export type DemoteRealmResponse = {
  message: string;
  blockedUsers: number;
};

/**
 * Result of `demoteRealm`. The `REALM_HAS_HOME_USERS` (HTTP 412) refusal is returned
 * rather than thrown, because errors thrown from server actions lose their status and
 * body in production builds and the UI must react to this case specifically.
 */
export type DemoteRealmResult =
  | ({ ok: true } & DemoteRealmResponse)
  | { ok: false; code: 'REALM_HAS_HOME_USERS'; message: string };
