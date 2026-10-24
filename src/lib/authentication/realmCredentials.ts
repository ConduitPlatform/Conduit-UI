import { z } from 'zod';
import {
  buildStrategiesPatch,
  hasOwnOverrides,
  normalizeRealmSettingsForSave,
  type RealmIdentityValues,
} from '@/lib/authentication/realms';
import {
  OAUTH_PROVIDER_KEYS,
  type OAuthProviderKey,
  type RealmOAuthStrategy,
  type RealmStrategies,
  type RealmStrategiesPatch,
} from '@/lib/models/Realm';

/**
 * Per-realm OAuth credentials: the editable draft of one provider row, its validation
 * and the PATCH shaping. Pure (no React, no I/O).
 *
 * Secrets are write-only. A draft never holds a secret read from the server and never
 * carries the read-only `has*` flags; those are passed in separately from the masked read.
 */

export type OAuthCredentialMode = 'inherit' | 'own';

export type OAuthCredentialDraft = {
  mode: OAuthCredentialMode;
  clientId: string;
  /** Write-only. Empty means "keep the stored secret". */
  clientSecret: string;
  redirect_uri: string;
  /** `undefined` = inherit the global provider setting; a boolean overrides it. */
  accountLinking?: boolean;
  /** Apple only. */
  teamId: string;
  /** Apple only. */
  keyId: string;
  /** Apple only. Write-only. Empty means "keep the stored key". */
  privateKey: string;
};

export type OAuthCredentialDrafts = Record<
  OAuthProviderKey,
  OAuthCredentialDraft
>;

export type OAuthCredentialErrors = Partial<
  Record<Exclude<keyof OAuthCredentialDraft, 'mode' | 'accountLinking'>, string>
>;

/** Non-secret credential fields: sent as `null` when an existing value is emptied. */
const PLAIN_FIELDS = ['clientId', 'redirect_uri', 'teamId', 'keyId'] as const;
/** Write-only credential fields: only ever sent when something was typed. */
const SECRET_FIELDS = ['clientSecret', 'privateKey'] as const;

const trimmed = (value: string | undefined) => (value ?? '').trim();

/** Team ID and key ID both empty and no private key typed: the global Apple key applies. */
const isAppleKeyCleared = (draft: OAuthCredentialDraft) =>
  trimmed(draft.teamId) === '' &&
  trimmed(draft.keyId) === '' &&
  trimmed(draft.privateKey) === '';

/** Draft for one row, from the masked server read (`undefined` = no row yet). */
export function credentialDraftFromStrategy(
  strategy: RealmOAuthStrategy | undefined
): OAuthCredentialDraft {
  return {
    mode: hasOwnOverrides(strategy) ? 'own' : 'inherit',
    clientId: strategy?.clientId ?? '',
    clientSecret: '',
    redirect_uri: strategy?.redirect_uri ?? '',
    // Absent means "inherit": the card shows the global value as the baseline.
    accountLinking:
      typeof strategy?.accountLinking === 'boolean'
        ? strategy.accountLinking
        : undefined,
    teamId: strategy?.teamId ?? '',
    keyId: strategy?.keyId ?? '',
    privateKey: '',
  };
}

export function credentialDraftsFromStrategies(
  strategies: Partial<RealmStrategies> | undefined
): OAuthCredentialDrafts {
  const drafts = {} as OAuthCredentialDrafts;
  for (const provider of OAUTH_PROVIDER_KEYS) {
    drafts[provider] = credentialDraftFromStrategy(
      strategies?.oauth?.[provider]
    );
  }
  return drafts;
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

export const APPLE_KEY_FIELDS_MESSAGE =
  'Provide the team ID, key ID and private key together, or leave all three empty to use the global Apple key.';

const urlSchema = z.url();

/** What the masked server row says about its write-only secrets. */
type ServerSecrets = Pick<
  RealmOAuthStrategy,
  'hasPrivateKey' | 'hasClientSecret'
>;

/**
 * Own mode requires a client ID; `redirect_uri` must be a URL when present; Apple's
 * team ID / key ID / private key are all set (a stored private key counts) or all empty
 * (the global Apple key is used). Emptying the team ID and key ID without typing a key
 * drops back to the global Apple key, so a stored private key does not make that a
 * partial set. Every other provider needs a client secret (typed, or already stored);
 * Apple never uses one. Inherit mode has nothing to validate.
 */
function credentialDraftSchema(
  provider: OAuthProviderKey,
  server: ServerSecrets | undefined
) {
  return z
    .object({
      mode: z.enum(['inherit', 'own']),
      clientId: z.string(),
      clientSecret: z.string(),
      redirect_uri: z.string(),
      accountLinking: z.boolean().optional(),
      teamId: z.string(),
      keyId: z.string(),
      privateKey: z.string(),
    })
    .superRefine((draft, ctx) => {
      if (draft.mode !== 'own') return;
      const issue = (path: keyof OAuthCredentialDraft, message: string) =>
        ctx.addIssue({ code: 'custom', path: [path], message });

      if (trimmed(draft.clientId) === '')
        issue('clientId', 'Client ID is required');

      const redirect = trimmed(draft.redirect_uri);
      if (redirect !== '' && !urlSchema.safeParse(redirect).success) {
        issue('redirect_uri', 'Must be a valid URL');
      }

      if (provider !== 'apple') {
        if (
          trimmed(draft.clientSecret) === '' &&
          server?.hasClientSecret !== true
        ) {
          issue('clientSecret', 'Client secret is required');
        }
      } else if (!isAppleKeyCleared(draft)) {
        // (A cleared set means the global Apple key: nothing to check.)
        const present = {
          teamId: trimmed(draft.teamId) !== '',
          keyId: trimmed(draft.keyId) !== '',
          privateKey:
            trimmed(draft.privateKey) !== '' || server?.hasPrivateKey === true,
        };
        const count = Object.values(present).filter(Boolean).length;
        if (count !== 0 && count !== 3) {
          for (const [field, isPresent] of Object.entries(present)) {
            if (!isPresent) {
              issue(
                field as keyof OAuthCredentialDraft,
                APPLE_KEY_FIELDS_MESSAGE
              );
            }
          }
        }
      }
    });
}

/** Field -> message for an invalid draft; `{}` when valid. */
export function validateCredentialDraft(
  provider: OAuthProviderKey,
  draft: OAuthCredentialDraft,
  server?: ServerSecrets
): OAuthCredentialErrors {
  const result = credentialDraftSchema(provider, server).safeParse(draft);
  if (result.success) return {};
  const errors: OAuthCredentialErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof OAuthCredentialErrors;
    errors[field] ??= issue.message;
  }
  return errors;
}

/** Own mode without a client ID or secret, or with a partial Apple key set. */
export function isCredentialDraftIncomplete(
  provider: OAuthProviderKey,
  draft: OAuthCredentialDraft,
  server?: ServerSecrets
): boolean {
  if (draft.mode !== 'own') return false;
  const errors = validateCredentialDraft(provider, draft, server);
  return (
    errors.clientId !== undefined ||
    errors.clientSecret !== undefined ||
    errors.teamId !== undefined ||
    errors.keyId !== undefined ||
    errors.privateKey !== undefined
  );
}

const sameDraft = (a: OAuthCredentialDraft, b: OAuthCredentialDraft) =>
  (Object.keys(a) as Array<keyof OAuthCredentialDraft>).every(
    key => a[key] === b[key]
  );

/**
 * Validation errors of the enabled providers' drafts, keyed by provider. Providers that
 * are switched off are ignored (their credentials are never sent), and so are rows the
 * user did not touch: an incomplete row that is already stored must not block saving
 * something else.
 */
export function validateIdentityCredentials(
  current: Partial<RealmStrategies> | undefined,
  values: Pick<RealmIdentityValues, 'oauth'>,
  drafts: OAuthCredentialDrafts
): Partial<Record<OAuthProviderKey, OAuthCredentialErrors>> {
  const out: Partial<Record<OAuthProviderKey, OAuthCredentialErrors>> = {};
  for (const provider of OAUTH_PROVIDER_KEYS) {
    if (!values.oauth[provider].enabled) continue;
    const baseline = credentialDraftFromStrategy(current?.oauth?.[provider]);
    if (sameDraft(baseline, drafts[provider])) continue;
    const errors = validateCredentialDraft(
      provider,
      drafts[provider],
      current?.oauth?.[provider]
    );
    if (Object.keys(errors).length > 0) out[provider] = errors;
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* PATCH shaping                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Raw (un-normalised) row of the fields an own-mode draft changed relative to the
 * server read: typed values as strings, an emptied non-secret field as `null`. Secrets
 * are only ever included when something was typed; an empty secret field means "keep".
 */
function changedOwnFields(
  provider: OAuthProviderKey,
  baseline: OAuthCredentialDraft,
  draft: OAuthCredentialDraft
): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const field of PLAIN_FIELDS) {
    const before = trimmed(baseline[field]);
    const after = trimmed(draft[field]);
    if (before !== after) row[field] = after === '' ? null : after;
  }
  for (const field of SECRET_FIELDS) {
    if (trimmed(draft[field]) !== '') row[field] = draft[field];
  }
  if (
    provider === 'apple' &&
    isAppleKeyCleared(draft) &&
    (trimmed(baseline.teamId) !== '' || trimmed(baseline.keyId) !== '')
  ) {
    // The key set goes as a whole: the stored private key is cleared with its ids.
    row.teamId = null;
    row.keyId = null;
    row.privateKey = null;
  }
  if (baseline.accountLinking !== draft.accountLinking) {
    // `null` drops the override ("Use global").
    row.accountLinking = draft.accountLinking ?? null;
  }
  return row;
}

/**
 * The PATCH `strategies` fragment of the Identity card: enablement changes and the six
 * `null`s (and `accountLinking: null`) for rows switched to "inherit" (both from
 * `buildStrategiesPatch`), plus the
 * credential fields an "own" row changed (through `normalizeRealmSettingsForSave`, so
 * values are trimmed and blanks are dropped). Rows that did not change contribute
 * nothing, and disabled providers' credentials are never touched.
 */
export function buildIdentityPatch(
  current: Partial<RealmStrategies> | undefined,
  values: RealmIdentityValues,
  drafts: OAuthCredentialDrafts
): RealmStrategiesPatch {
  const withModes: RealmIdentityValues = {
    ...values,
    oauth: Object.fromEntries(
      OAUTH_PROVIDER_KEYS.map(provider => [
        provider,
        {
          enabled: values.oauth[provider].enabled,
          credentials: values.oauth[provider].enabled
            ? drafts[provider].mode
            : undefined,
        },
      ])
    ) as RealmIdentityValues['oauth'],
  };
  const patch = buildStrategiesPatch(current, withModes);

  const ownRows: Record<string, unknown> = {};
  for (const provider of OAUTH_PROVIDER_KEYS) {
    const draft = drafts[provider];
    if (!values.oauth[provider].enabled || draft.mode !== 'own') continue;
    const row = changedOwnFields(
      provider,
      credentialDraftFromStrategy(current?.oauth?.[provider]),
      draft
    );
    if (Object.keys(row).length > 0) ownRows[provider] = row;
  }
  if (Object.keys(ownRows).length === 0) return patch;

  const normalized = normalizeRealmSettingsForSave({
    strategies: { oauth: ownRows },
  }).strategies?.oauth;
  for (const provider of OAUTH_PROVIDER_KEYS) {
    const row = normalized?.[provider];
    if (!row || Object.keys(row).length === 0) continue;
    patch.oauth = {
      ...patch.oauth,
      [provider]: { ...patch.oauth?.[provider], ...row },
    };
  }
  return patch;
}
