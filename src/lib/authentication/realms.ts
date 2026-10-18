import { z } from 'zod';
import { oauthDefaultConfig } from '@/components/authentication/strategies/settingsConfig/oAuth/oauthDefaultConfig';
import type { AuthenticationConfig } from '@/lib/models/authentication';
import {
  OAUTH_PROVIDER_KEYS,
  type DeepPartial,
  type OAuthProviderKey,
  type RealmCounts,
  type RealmPolicies,
  type RealmRegistration,
  type PromoteRealmBody,
  type RealmSettingsPayload,
  type RealmStrategies,
} from '@/lib/models/Realm';

/**
 * Pure realm logic (gating, validation, request-body shaping). No React, no I/O,
 * so it can be unit tested directly.
 */

/** All realm UI renders only when the backend reports `teams.realms.enabled`. */
export function realmsEnabled(
  config: AuthenticationConfig | null | undefined
): boolean {
  return config?.teams?.realms?.enabled === true;
}

/* -------------------------------------------------------------------------- */
/* Slug                                                                       */
/* -------------------------------------------------------------------------- */

/** Mirrors the backend: `^[a-z0-9][a-z0-9-]{1,62}$`. */
export const REALM_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,62}$/;

export const REALM_SLUG_MESSAGE =
  '2-63 characters: lowercase letters, digits and hyphens, starting with a letter or digit.';

export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .regex(REALM_SLUG_PATTERN, REALM_SLUG_MESSAGE);

export function isValidRealmSlug(value: string): boolean {
  return REALM_SLUG_PATTERN.test(value);
}

/* -------------------------------------------------------------------------- */
/* Schemas                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * One OAuth row of a realm. Composed from the global provider schema so both stay in
 * step. Credentials are optional: an empty string means "inherit the global provider
 * config" and is dropped by `normalizeRealmSettingsForSave`.
 */
export const realmOAuthStrategySchema = oauthDefaultConfig.extend({
  enabled: z.boolean(),
  // Absent means "inherit", so no default here (the global schema defaults to true).
  accountLinking: z.boolean().optional(),
  // Apple only.
  privateKey: z.string().optional(),
  teamId: z.string().optional(),
  keyId: z.string().optional(),
});

const enabledOnly = z.object({ enabled: z.boolean() });

export const realmStrategiesSchema = z.object({
  local: z.object({
    enabled: z.boolean(),
    verificationRequired: z.boolean().optional(),
  }),
  username: enabledOnly,
  magicLink: enabledOnly,
  phone: enabledOnly,
  metamask: enabledOnly,
  biometric: enabledOnly,
  oauth: z.partialRecord(z.enum(OAUTH_PROVIDER_KEYS), realmOAuthStrategySchema),
});

export const realmPoliciesSchema = z.object({
  requireTwoFa: z.boolean(),
  requireVerifiedEmail: z.boolean(),
  allowedClientIds: z.array(z.string().min(1)),
  guests: z.object({
    allowed: z.boolean(),
    allowedHomeRealms: z.array(z.string().min(1)),
  }),
});

export const realmRegistrationSchema = z.object({
  allowWithoutInvite: z.boolean(),
});

/** Server defaults applied on promotion when a field is omitted. */
export const DEFAULT_REALM_STRATEGIES: z.output<typeof realmStrategiesSchema> =
  {
    local: { enabled: true },
    username: { enabled: false },
    magicLink: { enabled: false },
    phone: { enabled: false },
    metamask: { enabled: false },
    biometric: { enabled: false },
    oauth: {},
  };

export const DEFAULT_REALM_POLICIES: RealmPolicies = {
  requireTwoFa: false,
  requireVerifiedEmail: false,
  allowedClientIds: [],
  guests: { allowed: true, allowedHomeRealms: [] },
};

export const DEFAULT_REALM_REGISTRATION: RealmRegistration = {
  allowWithoutInvite: false,
};

/** Settings shared by promote and edit. `parse({})` yields the server defaults. */
export const realmSettingsSchema = z.object({
  active: z.boolean().default(true),
  strategies: realmStrategiesSchema.default(DEFAULT_REALM_STRATEGIES),
  registration: realmRegistrationSchema.default(DEFAULT_REALM_REGISTRATION),
  policies: realmPoliciesSchema.default(DEFAULT_REALM_POLICIES),
});

/** Promotion form: the shared settings plus the slug. */
export const promoteRealmSchema = realmSettingsSchema.extend({
  slug: slugSchema,
});

export type RealmSettingsFormValues = z.infer<typeof realmSettingsSchema>;
export type PromoteRealmFormValues = z.infer<typeof promoteRealmSchema>;

/* -------------------------------------------------------------------------- */
/* Request body shaping                                                       */
/* -------------------------------------------------------------------------- */

const OAUTH_CREDENTIAL_FIELDS = [
  'clientId',
  'clientSecret',
  'redirect_uri',
  'privateKey',
  'teamId',
  'keyId',
] as const;

export const REALM_SIMPLE_STRATEGY_KEYS = [
  'local',
  'username',
  'magicLink',
  'phone',
  'metamask',
  'biometric',
] as const;

export type RealmSimpleStrategyKey =
  (typeof REALM_SIMPLE_STRATEGY_KEYS)[number];

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isBlank = (value: unknown): boolean =>
  typeof value !== 'string' || value.trim() === '';

function cleanStringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (trimmed !== '') seen.add(trimmed);
  }
  return [...seen];
}

function normalizeOAuthRow(row: unknown): UnknownRecord | undefined {
  if (!isRecord(row)) return undefined;
  const out: UnknownRecord = {};
  if (typeof row.enabled === 'boolean') out.enabled = row.enabled;
  if (typeof row.accountLinking === 'boolean') {
    out.accountLinking = row.accountLinking;
  }
  // Empty credentials are omitted so the provider inherits the global config.
  // Read-only `has*` flags are never copied: only whitelisted fields get through.
  for (const field of OAUTH_CREDENTIAL_FIELDS) {
    const value = row[field];
    if (!isBlank(value)) out[field] = value;
  }
  return out;
}

function normalizeStrategies(
  strategies: unknown
): DeepPartial<RealmStrategies> | undefined {
  if (!isRecord(strategies)) return undefined;
  const out: UnknownRecord = {};

  for (const key of REALM_SIMPLE_STRATEGY_KEYS) {
    const row = strategies[key];
    if (!isRecord(row)) continue;
    const next: UnknownRecord = {};
    if (typeof row.enabled === 'boolean') next.enabled = row.enabled;
    if (key === 'local' && typeof row.verificationRequired === 'boolean') {
      next.verificationRequired = row.verificationRequired;
    }
    out[key] = next;
  }

  if (isRecord(strategies.oauth)) {
    const oauth: UnknownRecord = {};
    for (const provider of OAUTH_PROVIDER_KEYS) {
      const row = normalizeOAuthRow(strategies.oauth[provider]);
      if (row) oauth[provider] = row;
    }
    out.oauth = oauth;
  }

  return out as DeepPartial<RealmStrategies>;
}

function normalizePolicies(
  policies: unknown
): DeepPartial<RealmPolicies> | undefined {
  if (!isRecord(policies)) return undefined;
  const out: UnknownRecord = {};
  if (typeof policies.requireTwoFa === 'boolean') {
    out.requireTwoFa = policies.requireTwoFa;
  }
  if (typeof policies.requireVerifiedEmail === 'boolean') {
    out.requireVerifiedEmail = policies.requireVerifiedEmail;
  }
  const clientIds = cleanStringList(policies.allowedClientIds);
  if (clientIds) out.allowedClientIds = clientIds;
  if (isRecord(policies.guests)) {
    const guests: UnknownRecord = {};
    if (typeof policies.guests.allowed === 'boolean') {
      guests.allowed = policies.guests.allowed;
    }
    const homeRealms = cleanStringList(policies.guests.allowedHomeRealms);
    if (homeRealms) guests.allowedHomeRealms = homeRealms;
    out.guests = guests;
  }
  return out as DeepPartial<RealmPolicies>;
}

/**
 * Shapes realm settings (form values or a masked server read) into a request body:
 * - empty-string credential fields are dropped so the provider inherits the global config;
 * - read-only `has*` flags and any unknown keys are never sent;
 * - string lists are trimmed and de-duplicated (an empty list is kept: it means "any").
 * Sections that are absent from the input stay absent from the output, so callers can
 * pass a partial object and get a partial PATCH body.
 */
export function normalizeRealmSettingsForSave(
  input: DeepPartial<RealmSettingsPayload> | UnknownRecord
): RealmSettingsPayload {
  const source = input as UnknownRecord;
  const out: RealmSettingsPayload = {};

  if (typeof source.slug === 'string' && source.slug.trim() !== '') {
    out.slug = source.slug.trim();
  }
  if (typeof source.active === 'boolean') out.active = source.active;

  const strategies = normalizeStrategies(source.strategies);
  if (strategies) out.strategies = strategies;

  if (
    isRecord(source.registration) &&
    typeof source.registration.allowWithoutInvite === 'boolean'
  ) {
    out.registration = {
      allowWithoutInvite: source.registration.allowWithoutInvite,
    };
  }

  const policies = normalizePolicies(source.policies);
  if (policies) out.policies = policies;

  return out;
}

/**
 * Promotion body from the promote form: normalised, and OAuth providers that were not
 * switched on are left out entirely (they inherit nothing and need no row).
 */
export function buildPromoteBody(
  values: DeepPartial<PromoteRealmFormValues>
): PromoteRealmBody {
  const body = normalizeRealmSettingsForSave(values);
  const oauth = body.strategies?.oauth;
  if (body.strategies && oauth) {
    body.strategies.oauth = Object.fromEntries(
      Object.entries(oauth).filter(([, row]) => row?.enabled === true)
    );
  }
  return { ...body, slug: body.slug ?? '' };
}

/** Best-effort slug suggestion from a team name; may still be invalid (e.g. too short). */
export function suggestRealmSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63)
    .replace(/-+$/g, '');
}

/* -------------------------------------------------------------------------- */
/* Identity card helpers (switch-only editing of strategies)                  */
/* -------------------------------------------------------------------------- */

export type RealmIdentityValues = {
  local: { enabled: boolean; verificationRequired: boolean };
  username: { enabled: boolean };
  magicLink: { enabled: boolean };
  phone: { enabled: boolean };
  metamask: { enabled: boolean };
  biometric: { enabled: boolean };
  oauth: Record<OAuthProviderKey, { enabled: boolean }>;
};

export function strategiesToIdentityValues(
  strategies: Partial<RealmStrategies> | undefined
): RealmIdentityValues {
  const oauth = {} as RealmIdentityValues['oauth'];
  for (const provider of OAUTH_PROVIDER_KEYS) {
    oauth[provider] = {
      enabled: strategies?.oauth?.[provider]?.enabled === true,
    };
  }
  return {
    local: {
      enabled: strategies?.local?.enabled === true,
      verificationRequired: strategies?.local?.verificationRequired === true,
    },
    username: { enabled: strategies?.username?.enabled === true },
    magicLink: { enabled: strategies?.magicLink?.enabled === true },
    phone: { enabled: strategies?.phone?.enabled === true },
    metamask: { enabled: strategies?.metamask?.enabled === true },
    biometric: { enabled: strategies?.biometric?.enabled === true },
    oauth,
  };
}

/**
 * Builds the PATCH `strategies` fragment containing only what changed relative to the
 * current server state. OAuth rows carry `enabled` only, so credentials stay untouched
 * (PATCH deep-merges).
 */
export function buildStrategiesPatch(
  current: Partial<RealmStrategies> | undefined,
  next: RealmIdentityValues
): DeepPartial<RealmStrategies> {
  const before = strategiesToIdentityValues(current);
  const patch: UnknownRecord = {};

  for (const key of REALM_SIMPLE_STRATEGY_KEYS) {
    const row: UnknownRecord = {};
    if (before[key].enabled !== next[key].enabled) {
      row.enabled = next[key].enabled;
    }
    if (
      key === 'local' &&
      before.local.verificationRequired !== next.local.verificationRequired
    ) {
      row.verificationRequired = next.local.verificationRequired;
    }
    if (Object.keys(row).length > 0) patch[key] = row;
  }

  const oauth: UnknownRecord = {};
  for (const provider of OAUTH_PROVIDER_KEYS) {
    if (before.oauth[provider].enabled !== next.oauth[provider].enabled) {
      oauth[provider] = { enabled: next.oauth[provider].enabled };
    }
  }
  if (Object.keys(oauth).length > 0) patch.oauth = oauth;

  return patch as DeepPartial<RealmStrategies>;
}

/* -------------------------------------------------------------------------- */
/* Presentation helpers                                                       */
/* -------------------------------------------------------------------------- */

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

/** "12 home users, 3 guests": the effect a realm change has on people. */
export function formatRealmCounts(counts: RealmCounts): string {
  return `${plural(counts.home, 'home user', 'home users')}, ${plural(
    counts.guest,
    'guest',
    'guests'
  )}`;
}
