import { z } from 'zod';
import { oauthDefaultConfig } from '@/components/authentication/strategies/settingsConfig/oAuth/oauthDefaultConfig.schema';
import type { AuthenticationConfig } from '@/lib/models/authentication';
import type { RealmIdentityMode } from '@/lib/models/authentication/teams.config';
import {
  OAUTH_CREDENTIAL_FIELDS,
  OAUTH_PROVIDER_KEYS,
  type DeepPartial,
  type OAuthProviderKey,
  type RealmCounts,
  type RealmLinking,
  type RealmPolicies,
  type RealmRegistration,
  type PromoteRealmBody,
  type Realm,
  type RealmOAuthStrategy,
  type RealmSettings,
  type RealmSettingsPayload,
  type RealmStrategies,
  type RealmStrategiesPatch,
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

/**
 * The identity mode the UI should present. Isolated mode is only visible while realms are
 * enabled: with the flag off every caller gets `shared`, so the UI is the same as before
 * isolated mode existed. An absent value (backends that predate isolated mode) is `shared`.
 */
export function realmIdentityMode(
  config: AuthenticationConfig | null | undefined
): RealmIdentityMode {
  return realmsEnabled(config) &&
    config?.teams?.realms?.identityMode === 'isolated'
    ? 'isolated'
    : 'shared';
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

/** Linked guests of a realm can sign in there with their own credentials. */
export const DEFAULT_GUEST_DIRECT_SIGN_IN = true;

/** Inbound off (other realms cannot connect in), outbound on (this realm's accounts can connect out). */
export const DEFAULT_REALM_LINKING: RealmLinking = {
  inbound: false,
  outbound: true,
};

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
    // Absent on backends that predate account linking. No default: the key is only
    // read from, and sent for, a realm whose read reports it.
    directSignIn: z.boolean().optional(),
  }),
});

export const realmLinkingSchema = z.object({
  inbound: z.boolean().default(DEFAULT_REALM_LINKING.inbound),
  outbound: z.boolean().default(DEFAULT_REALM_LINKING.outbound),
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

export const DEFAULT_REALM_POLICIES: z.output<typeof realmPoliciesSchema> = {
  requireTwoFa: false,
  requireVerifiedEmail: false,
  allowedClientIds: [],
  guests: {
    allowed: true,
    allowedHomeRealms: [],
    directSignIn: DEFAULT_GUEST_DIRECT_SIGN_IN,
  },
};

export const DEFAULT_REALM_REGISTRATION: RealmRegistration = {
  allowWithoutInvite: false,
};

/** Helper text of the sign-up switch, shared by the Policies card and the promote sheet. */
export const REALM_SIGN_UP_DESCRIPTION =
  'When off, people need an invite to create an account here or to connect an existing one.';

/**
 * Settings shared by promote and edit. `linking` has no default: a key is only in the
 * output when the caller supplied it, so backends that predate linking never receive it.
 */
export const realmSettingsSchema = z.object({
  active: z.boolean().default(true),
  strategies: realmStrategiesSchema.default(DEFAULT_REALM_STRATEGIES),
  registration: realmRegistrationSchema.default(DEFAULT_REALM_REGISTRATION),
  policies: realmPoliciesSchema.default(DEFAULT_REALM_POLICIES),
  linking: realmLinkingSchema.optional(),
});

/**
 * Policies card form: the policies, the sign-up switch and the account linking switches
 * (all PATCHed together). `linking` is present only when the realm read reports it.
 */
export const realmPoliciesFormSchema = realmPoliciesSchema.extend({
  registration: realmRegistrationSchema.default(DEFAULT_REALM_REGISTRATION),
  linking: realmLinkingSchema.optional(),
});

export type RealmPoliciesFormValues = z.output<typeof realmPoliciesFormSchema>;

/** Promotion form: the shared settings plus the slug. */
export const promoteRealmSchema = realmSettingsSchema.extend({
  slug: slugSchema,
});

export type RealmSettingsFormValues = z.infer<typeof realmSettingsSchema>;
export type PromoteRealmFormValues = z.infer<typeof promoteRealmSchema>;

/* -------------------------------------------------------------------------- */
/* Request body shaping                                                       */
/* -------------------------------------------------------------------------- */

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

/** Every credential field set to `null`: the provider inherits the global config. */
function clearedCredentials(): UnknownRecord {
  return Object.fromEntries(
    OAUTH_CREDENTIAL_FIELDS.map(field => [field, null])
  );
}

/**
 * Credential semantics (PATCH deep-merges; see "Credential clearing semantics" in the
 * realms API contract):
 * - `credentials: 'inherit'` -> every credential field is sent as `null` (clears them);
 *   `accountLinking: null` likewise drops that override;
 * - `credentials: 'own'`     -> only non-blank typed values, trimmed;
 * - no `credentials` key     -> non-blank strings are trimmed and sent, blank strings
 *   are dropped (keep stored), an explicit `null` is passed through (clear).
 * Blank strings are never sent. Read-only `has*` flags and unknown keys never get through.
 */
function normalizeOAuthRow(row: unknown): UnknownRecord | undefined {
  if (!isRecord(row)) return undefined;
  const out: UnknownRecord = {};
  if (typeof row.enabled === 'boolean') out.enabled = row.enabled;
  // A boolean overrides the global setting; `null` drops the override (inherit again).
  if (typeof row.accountLinking === 'boolean' || row.accountLinking === null) {
    out.accountLinking = row.accountLinking;
  }
  if (row.credentials === 'inherit') {
    return { ...out, ...clearedCredentials() };
  }
  const keepNull = row.credentials !== 'own';
  for (const field of OAUTH_CREDENTIAL_FIELDS) {
    const value = row[field];
    if (value === null) {
      if (keepNull) out[field] = null;
    } else if (!isBlank(value)) {
      out[field] = (value as string).trim();
    }
  }
  return out;
}

function normalizeStrategies(
  strategies: unknown
): RealmStrategiesPatch | undefined {
  if (!isRecord(strategies)) return undefined;
  const out: UnknownRecord = {};

  for (const key of REALM_SIMPLE_STRATEGY_KEYS) {
    const row = strategies[key];
    if (!isRecord(row)) continue;
    const next: UnknownRecord = {};
    if (typeof row.enabled === 'boolean') next.enabled = row.enabled;
    if (
      key === 'local' &&
      (typeof row.verificationRequired === 'boolean' ||
        row.verificationRequired === null)
    ) {
      // `null` drops the override: the global setting applies again.
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

  return out as RealmStrategiesPatch;
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
    if (typeof policies.guests.directSignIn === 'boolean') {
      guests.directSignIn = policies.guests.directSignIn;
    }
    out.guests = guests;
  }
  return out as DeepPartial<RealmPolicies>;
}

function normalizeLinking(linking: unknown): Partial<RealmLinking> | undefined {
  if (!isRecord(linking)) return undefined;
  const out: Partial<RealmLinking> = {};
  if (typeof linking.inbound === 'boolean') out.inbound = linking.inbound;
  if (typeof linking.outbound === 'boolean') out.outbound = linking.outbound;
  return out;
}

/**
 * Shapes realm settings (form values or a masked server read) into a request body:
 * - blank credential strings are dropped (the stored value is kept); `null` clears a
 *   credential and `credentials: 'inherit'` on an OAuth row clears all of them;
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

  const linking = normalizeLinking(source.linking);
  if (linking) out.linking = linking;

  return out;
}

/**
 * Policies card body: the policies, the sign-up switch and the linking switches in one
 * payload, so one PATCH carries them all (they are sibling sections of the realm settings).
 */
export function buildRealmPoliciesPatch(
  values: RealmPoliciesFormValues
): Omit<RealmSettingsPayload, 'slug'> {
  const { registration, linking, ...policies } = values;
  const { slug: _slug, ...body } = normalizeRealmSettingsForSave({
    policies,
    registration,
    linking,
  });
  return body;
}

/**
 * Form values for the Policies card, filled from a realm's settings. The sign-up switch is
 * always set (false when the read does not report it). A linking field the read does not
 * report stays `undefined`: its switch is not rendered and its key is not sent, so a backend
 * that predates it never receives it.
 */
export function toRealmPoliciesFormValues(
  settings: Pick<RealmSettings, 'policies' | 'linking'> &
    Partial<Pick<RealmSettings, 'registration'>>
): RealmPoliciesFormValues {
  const { policies, registration, linking } = settings;
  return {
    requireTwoFa: policies.requireTwoFa,
    requireVerifiedEmail: policies.requireVerifiedEmail,
    allowedClientIds: policies.allowedClientIds,
    guests: {
      allowed: policies.guests.allowed,
      allowedHomeRealms: policies.guests.allowedHomeRealms,
      directSignIn: policies.guests.directSignIn,
    },
    registration: {
      allowWithoutInvite: registration?.allowWithoutInvite === true,
    },
    linking: linking
      ? {
          inbound: linking.inbound ?? DEFAULT_REALM_LINKING.inbound,
          outbound: linking.outbound ?? DEFAULT_REALM_LINKING.outbound,
        }
      : undefined,
  };
}

/**
 * Promotion defaults for the linking keys. A backend that predates account linking would
 * reject them as unknown, so they are only included when the authentication config reports
 * `teams.realms.identityMode`.
 */
export function promoteLinkingDefaults(
  supportsLinking: boolean
): Pick<PromoteRealmFormValues, 'policies' | 'linking'> {
  if (supportsLinking) {
    return { policies: DEFAULT_REALM_POLICIES, linking: DEFAULT_REALM_LINKING };
  }
  const { directSignIn: _directSignIn, ...guests } =
    DEFAULT_REALM_POLICIES.guests;
  return { policies: { ...DEFAULT_REALM_POLICIES, guests } };
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
  /** `verificationRequired` undefined = inherit the global `local.verification.required`. */
  local: { enabled: boolean; verificationRequired: boolean | undefined };
  username: { enabled: boolean };
  magicLink: { enabled: boolean };
  phone: { enabled: boolean };
  metamask: { enabled: boolean };
  biometric: { enabled: boolean };
  /**
   * `credentials` is the Inherit/Own choice of a provider row. It is not derived from
   * the server read; the Identity card leaves it unset (so only `enabled` is patched)
   * until the credentials UI sets it. `'inherit'` clears the realm's own credentials.
   */
  oauth: Record<
    OAuthProviderKey,
    { enabled: boolean; credentials?: 'inherit' | 'own' }
  >;
};

/** True when the (masked) server row carries credentials of its own. */
export function hasOwnCredentials(
  strategy: RealmOAuthStrategy | undefined
): boolean {
  if (!strategy) return false;
  return Boolean(
    strategy.clientId?.trim() ||
    strategy.redirect_uri?.trim() ||
    strategy.teamId?.trim() ||
    strategy.keyId?.trim() ||
    strategy.hasClientSecret ||
    strategy.hasPrivateKey
  );
}

/**
 * True when the (masked) server row overrides anything of the global provider config:
 * credentials, or an explicit `accountLinking`. Drives the Inherit/Own mode.
 */
export function hasOwnOverrides(
  strategy: RealmOAuthStrategy | undefined
): boolean {
  return (
    hasOwnCredentials(strategy) || typeof strategy?.accountLinking === 'boolean'
  );
}

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
      verificationRequired:
        typeof strategies?.local?.verificationRequired === 'boolean'
          ? strategies.local.verificationRequired
          : undefined,
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
 * current server state. OAuth rows carry `enabled` when it changed. Credentials stay
 * untouched (PATCH deep-merges) unless the row says `credentials: 'inherit'` while the
 * server row still has overrides of its own: then all six credential fields are sent as
 * `null` (when it has credentials) and `accountLinking: null` (when it has that override). Typed credential values for `'own'` are not handled here; callers merge
 * them in through `normalizeRealmSettingsForSave`.
 */
export function buildStrategiesPatch(
  current: Partial<RealmStrategies> | undefined,
  next: RealmIdentityValues
): RealmStrategiesPatch {
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
      // Back to inherit (undefined) is sent as `null`, which clears the override.
      row.verificationRequired = next.local.verificationRequired ?? null;
    }
    if (Object.keys(row).length > 0) patch[key] = row;
  }

  const oauth: UnknownRecord = {};
  for (const provider of OAUTH_PROVIDER_KEYS) {
    const row: UnknownRecord = {};
    if (before.oauth[provider].enabled !== next.oauth[provider].enabled) {
      row.enabled = next.oauth[provider].enabled;
    }
    if (next.oauth[provider].credentials === 'inherit') {
      const stored = current?.oauth?.[provider];
      if (hasOwnCredentials(stored)) Object.assign(row, clearedCredentials());
      // The account linking override goes with the credentials: back to the global value.
      if (typeof stored?.accountLinking === 'boolean') {
        row.accountLinking = null;
      }
    }
    if (Object.keys(row).length > 0) oauth[provider] = row;
  }
  if (Object.keys(oauth).length > 0) patch.oauth = oauth;

  return patch as RealmStrategiesPatch;
}

/* -------------------------------------------------------------------------- */
/* Global strategies page: how many realms use each strategy                  */
/* -------------------------------------------------------------------------- */

/** Global strategy key (see `stategyMap.config.ts`) -> realm simple strategy key. */
const GLOBAL_TO_REALM_STRATEGY: Record<string, RealmSimpleStrategyKey> = {
  local: 'local',
  magic_link: 'magicLink',
  phoneAuthentication: 'phone',
  biometricAuthentication: 'biometric',
};

/** Realms the strategies page asks for; counts beyond it are shown as "N+". */
export const REALM_COUNT_CAP = 100;

/**
 * For each global strategy key, how many of the given realms enable it. OAuth providers
 * use the same key globally and per realm. Strategies no realm enables are left out.
 * Inactive realms do not count: the backend only considers active realms when it
 * decides whether a strategy is in use.
 */
export function countRealmsEnablingStrategy(
  realms: ReadonlyArray<Pick<Realm, 'settings'>>
): Map<string, number> {
  const counts = new Map<string, number>();
  const bump = (key: string) => counts.set(key, (counts.get(key) ?? 0) + 1);
  for (const { settings } of realms) {
    if (settings?.active === false) continue;
    const strategies = settings?.strategies;
    if (!strategies) continue;
    for (const [globalKey, realmKey] of Object.entries(
      GLOBAL_TO_REALM_STRATEGY
    )) {
      if (strategies[realmKey]?.enabled === true) bump(globalKey);
    }
    for (const provider of OAUTH_PROVIDER_KEYS) {
      if (strategies.oauth?.[provider]?.enabled === true) bump(provider);
    }
  }
  return counts;
}

/**
 * "3 realms" / "1 realm". `capped` means the count is a lower bound (more realms exist
 * than were loaded), shown as "100+".
 */
export function formatRealmStrategyCount(
  count: number,
  capped = false
): string {
  if (capped) return `${count}+ realms`;
  return `${count} ${count === 1 ? 'realm' : 'realms'}`;
}

/**
 * The global `accountLinking` of each OAuth provider: what a realm inherits while it has
 * no override. The backend defaults an absent value to on.
 */
export function globalAccountLinkingDefaults(
  config: AuthenticationConfig | null | undefined
): Partial<Record<OAuthProviderKey, boolean>> {
  const out: Partial<Record<OAuthProviderKey, boolean>> = {};
  const source = config as unknown as
    | Record<string, { accountLinking?: boolean } | undefined>
    | null
    | undefined;
  for (const provider of OAUTH_PROVIDER_KEYS) {
    out[provider] = source?.[provider]?.accountLinking ?? true;
  }
  return out;
}

/**
 * The global `local.verification.required`: what a realm inherits while it has no
 * `local.verificationRequired` of its own. The backend treats an absent value as off.
 */
export function globalVerificationRequired(
  config: AuthenticationConfig | null | undefined
): boolean {
  return config?.local?.verification?.required === true;
}

/** The value in force for a realm: its own override, else the global setting. */
export function effectiveVerificationRequired(
  override: boolean | undefined,
  global: boolean
): boolean {
  return override ?? global;
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
