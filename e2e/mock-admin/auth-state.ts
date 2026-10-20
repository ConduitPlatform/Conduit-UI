import {
  FIXED_NOW,
  REALM_ACME_ID,
  REALM_ACME_NAME,
  REALM_ACME_SLUG,
  REALM_STRICT_ID,
  REALM_STRICT_NAME,
  REALM_STRICT_SLUG,
  TEAM_ACME_ENGINEERING_ID,
  TEAM_ACME_ENGINEERING_NAME,
  TEAM_PLATFORM_ID,
  TEAM_PLATFORM_NAME,
  USER_ALICE_ID,
  USER_BOB_ID,
  USER_CAROL_ID,
  USER_DAVE_ID,
  USER_ERIN_ID,
  USER_FRANK_ID,
  USER_GINA_ID,
  USER_SAM_ACME_ID,
  USER_SAM_STRICT_ID,
  SHARED_EMAIL_USER,
} from './constants.ts';
import type {
  MockAuthState,
  MockIdentityMode,
  MockRealmMembership,
  MockRealmMembershipType,
  MockRealmOAuthSecrets,
  MockRealmSettings,
  MockTeam,
  MockUser,
} from './types.ts';

/**
 * In-memory model of the authentication module's realms, following the frozen admin
 * API contract (realms-admin-api.md) and the backend's observable behaviour. Pure:
 * nothing here touches HTTP, so the handlers stay thin.
 */

type Json = Record<string, unknown>;

function isJson(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/* -------------------------------------------------------------------------- */
/* Errors                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * `conduitCode` travels in the body. Hermes maps ALREADY_EXISTS and
 * FAILED_PRECONDITION to HTTP 500, so the codes the contract lists as 409/412 are
 * served as 500 here: clients must key on the body, never on the status.
 */
const CONDUIT_ERRORS = {
  REALM_NOT_FOUND: { status: 404, message: 'Realm not found' },
  REALM_SLUG_TAKEN: { status: 500, message: 'Realm slug is already in use' },
  REALM_HAS_HOME_USERS: {
    status: 500,
    message: 'Realm still has home users',
  },
  REALM_NESTED: { status: 400, message: 'Realms cannot be nested' },
  GUESTS_NOT_ALLOWED: {
    status: 403,
    message: "This realm does not allow guests from this user's home realm",
  },
  HOME_USER_REMOVAL: {
    status: 500,
    message: 'Home users cannot be removed from their home realm',
  },
  REALMS_DISABLED: { status: 500, message: 'Realms are disabled' },
  FAILED_PRECONDITION: {
    status: 500,
    message: 'Precondition failed',
  },
} as const;

export type MockConduitCode = keyof typeof CONDUIT_ERRORS;

export class MockHttpError extends Error {
  readonly status: number;
  readonly conduitCode?: string;

  constructor(status: number, message: string, conduitCode?: string) {
    super(message);
    this.status = status;
    this.conduitCode = conduitCode;
  }
}

function conduitError(code: MockConduitCode, message?: string): MockHttpError {
  const definition = CONDUIT_ERRORS[code];
  return new MockHttpError(
    definition.status,
    message ?? definition.message,
    code
  );
}

const invalid = (message: string) => new MockHttpError(400, message);
const notFound = (message: string) => new MockHttpError(404, message);

/* -------------------------------------------------------------------------- */
/* Seed                                                                       */
/* -------------------------------------------------------------------------- */

function seedTeam(
  id: string,
  name: string,
  extra: Partial<MockTeam> = {}
): MockTeam {
  return {
    _id: id,
    name,
    parentTeam: null,
    isDefault: false,
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW,
    ...extra,
  };
}

function seedUser(
  id: string,
  email: string,
  homeRealm: string | null
): MockUser {
  return {
    _id: id,
    email,
    active: true,
    isVerified: true,
    hasTwoFA: false,
    twoFaMethod: 'sms',
    homeRealm,
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW,
  };
}

export function defaultRealmSettings() {
  return {
    active: true,
    strategies: {
      local: { enabled: true },
      username: { enabled: false },
      magicLink: { enabled: false },
      phone: { enabled: false },
      metamask: { enabled: false },
      biometric: { enabled: false },
      oauth: {},
    } as MockRealmSettings['strategies'],
    registration: { allowWithoutInvite: false },
    policies: {
      requireTwoFa: false,
      requireVerifiedEmail: false,
      allowedClientIds: [] as string[],
      guests: {
        allowed: true,
        allowedHomeRealms: [] as string[],
        directSignIn: true,
      },
    },
    linking: { inbound: false, outbound: true },
  };
}

function seedSettings(
  id: string,
  team: string,
  overrides: Partial<MockRealmSettings>
): MockRealmSettings {
  return {
    _id: id,
    team,
    ...defaultRealmSettings(),
    oauthSecrets: {},
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW,
    ...overrides,
  };
}

function membership(
  id: string,
  user: string,
  realm: string,
  type: MockRealmMembershipType
): MockRealmMembership {
  return { _id: id, user, realm, type, createdAt: FIXED_NOW };
}

function baseAuthenticationConfig(): Record<string, unknown> {
  const cookieOptions = {
    httpOnly: true,
    secure: false,
    signed: false,
    domain: '',
    path: '',
    sameSite: 'Lax',
  };
  return {
    active: true,
    twoFa: {
      enabled: true,
      methods: { sms: true, authenticator: true },
      backUpCodes: { enabled: false },
    },
    phoneAuthentication: { enabled: false },
    biometricAuthentication: { enabled: false },
    captcha: {
      enabled: false,
      routes: { login: false, register: false, oAuth2: false },
      acceptablePlatform: { android: false, web: true },
    },
    redirectUris: { allowAny: true, whitelistedUris: [] },
    anonymousUsers: { enabled: false },
    clients: { multipleUserSessions: false, multipleClientLogins: true },
    accessTokens: {
      jwtSecret: '[REDACTED]',
      expiryPeriod: 3600000,
      setCookie: false,
      cookieOptions,
    },
    refreshTokens: {
      enabled: true,
      expiryPeriod: 604800000,
      setCookie: false,
      cookieOptions,
    },
    local: {
      enabled: true,
      verification: { required: false, send_email: false, redirect_uri: '' },
      forgot_password_redirect_uri: '',
    },
    teams: {
      enabled: true,
      enableDefaultTeam: false,
      allowAddWithoutInvite: false,
      allowRegistrationWithoutInvite: true,
      allowEmailMismatchForInvites: false,
      invites: {
        enabled: false,
        sendEmail: false,
        inviteUrl: 'https://mydomain.conduit/invite',
      },
    },
  };
}

/** `GET /config/authentication`: `teams.realms` follows the scenario flag. */
export function authenticationConfig(auth: MockAuthState) {
  const config = JSON.parse(JSON.stringify(auth.config)) as {
    teams: Record<string, unknown>;
  };
  if (auth.realmsFlag !== 'absent') {
    config.teams.realms = {
      enabled: auth.realmsFlag === 'enabled',
      cacheTtlMs: 5000,
      allowEmailDiscovery: false,
      identityMode: auth.identityMode,
      discoveryLogin: auth.discoveryLogin,
    };
  }
  return config;
}

/**
 * Identifiers held by more than one account (emails, case-insensitive). Isolated mode
 * allows these, so switching back to shared must be refused while any exist.
 */
export function duplicatedIdentifierCount(auth: MockAuthState): number {
  const counts = new Map<string, number>();
  for (const user of auth.users) {
    const key = user.email.toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.values()].filter(count => count > 1).length;
}

/**
 * `PATCH /config/authentication`: deep merge. `teams.realms` moves the realm flag, the
 * identity mode and the discovery switch. Isolated -> shared is refused with
 * FAILED_PRECONDITION while an identifier is held by more than one account; the refusal
 * is checked before anything is written.
 */
export function patchAuthenticationConfig(auth: MockAuthState, body: unknown) {
  const patch = isJson(body) && isJson(body.config) ? body.config : {};
  const { teams, ...rest } = patch;
  let nextTeams: Json | undefined;
  let realmsPatch: Json | undefined;
  if (isJson(teams)) {
    const { realms, ...teamsRest } = teams;
    nextTeams = teamsRest;
    if (isJson(realms)) realmsPatch = realms;
  }
  if (
    realmsPatch?.identityMode === 'shared' &&
    auth.identityMode === 'isolated'
  ) {
    const held = duplicatedIdentifierCount(auth);
    if (held > 0) {
      // A gRPC refusal: served as a 500 with no conduitCode, and the status name travels
      // in the message, as the backend's FAILED_PRECONDITION errors do.
      throw new MockHttpError(
        500,
        `9 FAILED_PRECONDITION: ${held} identifier(s) are held by more than one account; identity mode cannot return to shared`
      );
    }
  }
  if (realmsPatch) {
    if (typeof realmsPatch.enabled === 'boolean') {
      auth.realmsFlag = realmsPatch.enabled ? 'enabled' : 'disabled';
    }
    if (
      realmsPatch.identityMode === 'shared' ||
      realmsPatch.identityMode === 'isolated'
    ) {
      auth.identityMode = realmsPatch.identityMode;
    }
    if (typeof realmsPatch.discoveryLogin === 'boolean') {
      auth.discoveryLogin = realmsPatch.discoveryLogin;
    }
  }
  auth.config = deepMergeClearing(auth.config as Json, {
    ...rest,
    ...(nextTeams ? { teams: nextTeams } : {}),
  });
  return authenticationConfig(auth);
}

/**
 * Seed:
 *  - `acme` (guests allowed): home users alice and bob, guest carol (home `strict`),
 *    a sub-team "Acme Engineering". Google inherits the global credentials, GitHub
 *    and Apple carry their own.
 *  - `strict` (no guests, requires 2FA): home users carol and dave.
 *  - "Platform Team", a plain team with the global users erin and frank.
 *  - gina, a global user who belongs nowhere.
 */
export function createAuthState(
  realmsFlag: MockAuthState['realmsFlag'],
  identityMode: MockIdentityMode = 'shared'
): MockAuthState {
  const acmeSettings = seedSettings('65f000000000000000000c01', REALM_ACME_ID, {
    strategies: {
      local: { enabled: true },
      username: { enabled: false },
      magicLink: { enabled: false },
      phone: { enabled: false },
      metamask: { enabled: false },
      biometric: { enabled: false },
      oauth: {
        google: { enabled: true },
        github: {
          enabled: true,
          clientId: 'acme-github-client',
          redirect_uri: 'https://acme.example.com/callback',
        },
        apple: {
          enabled: true,
          clientId: 'com.acme.signin',
          teamId: 'ACMETEAM01',
          keyId: 'ACMEKEY001',
        },
      },
    },
    oauthSecrets: {
      github: { clientSecret: 'gh-secret-acme' },
      apple: { clientSecret: 'apple-secret-acme', privateKey: 'apple-pem' },
    },
  });
  const strictSettings = seedSettings(
    '65f000000000000000000c02',
    REALM_STRICT_ID,
    {
      policies: {
        requireTwoFa: true,
        requireVerifiedEmail: false,
        allowedClientIds: [],
        guests: { allowed: false, allowedHomeRealms: [], directSignIn: true },
      },
    }
  );
  const isolated = identityMode === 'isolated';
  return {
    realmsFlag,
    identityMode,
    discoveryLogin: false,
    config: baseAuthenticationConfig(),
    teams: [
      seedTeam(REALM_ACME_ID, REALM_ACME_NAME, {
        realm: { enabled: true, slug: REALM_ACME_SLUG },
      }),
      seedTeam(REALM_STRICT_ID, REALM_STRICT_NAME, {
        realm: { enabled: true, slug: REALM_STRICT_SLUG },
      }),
      seedTeam(TEAM_ACME_ENGINEERING_ID, TEAM_ACME_ENGINEERING_NAME, {
        parentTeam: REALM_ACME_ID,
      }),
      seedTeam(TEAM_PLATFORM_ID, TEAM_PLATFORM_NAME),
    ],
    realmSettings: [acmeSettings, strictSettings],
    users: [
      seedUser(USER_ALICE_ID, 'alice@acme.test', REALM_ACME_ID),
      seedUser(USER_BOB_ID, 'bob@acme.test', REALM_ACME_ID),
      seedUser(USER_CAROL_ID, 'carol@strict.test', REALM_STRICT_ID),
      seedUser(USER_DAVE_ID, 'dave@strict.test', REALM_STRICT_ID),
      seedUser(USER_ERIN_ID, 'erin@global.test', null),
      seedUser(USER_FRANK_ID, 'frank@global.test', null),
      seedUser(USER_GINA_ID, 'gina@global.test', null),
      // Isolated only: one email, two home accounts, one per realm.
      ...(isolated
        ? [
            seedUser(USER_SAM_ACME_ID, SHARED_EMAIL_USER, REALM_ACME_ID),
            seedUser(USER_SAM_STRICT_ID, SHARED_EMAIL_USER, REALM_STRICT_ID),
          ]
        : []),
    ],
    teamMembers: [
      { team: REALM_ACME_ID, user: USER_ALICE_ID, role: 'admin' },
      { team: REALM_ACME_ID, user: USER_BOB_ID, role: 'member' },
      { team: REALM_ACME_ID, user: USER_CAROL_ID, role: 'member' },
      { team: TEAM_ACME_ENGINEERING_ID, user: USER_ALICE_ID, role: 'member' },
      { team: REALM_STRICT_ID, user: USER_CAROL_ID, role: 'admin' },
      { team: REALM_STRICT_ID, user: USER_DAVE_ID, role: 'member' },
      { team: TEAM_PLATFORM_ID, user: USER_ERIN_ID, role: 'member' },
      { team: TEAM_PLATFORM_ID, user: USER_FRANK_ID, role: 'member' },
      ...(isolated
        ? [
            { team: REALM_ACME_ID, user: USER_SAM_ACME_ID, role: 'member' },
            { team: REALM_STRICT_ID, user: USER_SAM_STRICT_ID, role: 'member' },
          ]
        : []),
    ],
    memberships: [
      membership(
        '65f000000000000000000d01',
        USER_ALICE_ID,
        REALM_ACME_ID,
        'home'
      ),
      membership(
        '65f000000000000000000d02',
        USER_BOB_ID,
        REALM_ACME_ID,
        'home'
      ),
      membership(
        '65f000000000000000000d03',
        USER_CAROL_ID,
        REALM_ACME_ID,
        'guest'
      ),
      membership(
        '65f000000000000000000d04',
        USER_CAROL_ID,
        REALM_STRICT_ID,
        'home'
      ),
      membership(
        '65f000000000000000000d05',
        USER_DAVE_ID,
        REALM_STRICT_ID,
        'home'
      ),
      ...(isolated
        ? [
            membership(
              '65f000000000000000000d06',
              USER_SAM_ACME_ID,
              REALM_ACME_ID,
              'home'
            ),
            membership(
              '65f000000000000000000d07',
              USER_SAM_STRICT_ID,
              REALM_STRICT_ID,
              'home'
            ),
          ]
        : []),
    ],
    signedOutUserIds: [],
    seq: 0,
  };
}

/* -------------------------------------------------------------------------- */
/* Lookups                                                                    */
/* -------------------------------------------------------------------------- */

export function realmsActive(auth: MockAuthState): boolean {
  return auth.realmsFlag === 'enabled';
}

export function assertEnabled(auth: MockAuthState): void {
  if (!realmsActive(auth)) throw conduitError('REALMS_DISABLED');
}

function nextId(auth: MockAuthState): string {
  auth.seq += 1;
  return `65f0000000000000000${auth.seq.toString(16).padStart(5, '0')}`;
}

export function findTeam(auth: MockAuthState, id: string): MockTeam {
  const team = auth.teams.find(item => item._id === id);
  if (!team) throw notFound('Team does not exist');
  return team;
}

export function findUser(auth: MockAuthState, id: string): MockUser {
  const user = auth.users.find(item => item._id === id);
  if (!user) throw notFound('User does not exist');
  return user;
}

function findRealmTeam(auth: MockAuthState, id: string): MockTeam {
  const team = auth.teams.find(item => item._id === id);
  if (!team || team.realm?.enabled !== true)
    throw conduitError('REALM_NOT_FOUND');
  return team;
}

function settingsOf(auth: MockAuthState, teamId: string): MockRealmSettings {
  const settings = auth.realmSettings.find(item => item.team === teamId);
  if (!settings) throw conduitError('REALM_NOT_FOUND');
  return settings;
}

function topAncestor(auth: MockAuthState, team: MockTeam): MockTeam {
  let top = team;
  for (let depth = 0; top.parentTeam && depth < 20; depth++) {
    const parent = auth.teams.find(item => item._id === top.parentTeam);
    if (!parent) break;
    top = parent;
  }
  return top;
}

/** The realm a team belongs to: itself or its top-most ancestor, when that is a realm. */
function realmOfTeam(
  auth: MockAuthState,
  team: MockTeam
): MockTeam | undefined {
  const top = topAncestor(auth, team);
  return top.realm?.enabled === true ? top : undefined;
}

function subtreeIds(auth: MockAuthState, rootId: string): string[] {
  const ids = [rootId];
  for (let i = 0; i < ids.length; i++) {
    for (const team of auth.teams) {
      if (team.parentTeam === ids[i] && !ids.includes(team._id)) {
        ids.push(team._id);
      }
    }
  }
  return ids;
}

function membershipOf(
  auth: MockAuthState,
  userId: string,
  realmId: string
): MockRealmMembership | undefined {
  return auth.memberships.find(
    item => item.user === userId && item.realm === realmId
  );
}

/* -------------------------------------------------------------------------- */
/* Paging helpers                                                             */
/* -------------------------------------------------------------------------- */

export type Paging = { skip: number; limit: number; sort?: string };

export function sortAndPage<T>(
  items: T[],
  { skip, limit, sort }: Paging,
  value: (item: T, field: string) => unknown
): T[] {
  let result = items;
  if (sort) {
    const descending = sort.startsWith('-');
    const field = descending ? sort.slice(1) : sort;
    result = [...items].sort((a, b) => {
      const left = String(value(a, field) ?? '');
      const right = String(value(b, field) ?? '');
      return descending ? right.localeCompare(left) : left.localeCompare(right);
    });
  }
  return result.slice(skip, skip + limit);
}

const OBJECT_ID = /^[a-fA-F0-9]{24}$/;

function matchesUserSearch(
  user: MockUser,
  search: string | undefined
): boolean {
  if (!search) return true;
  if (OBJECT_ID.test(search)) return user._id === search;
  return user.email.toLowerCase().includes(search.toLowerCase());
}

/* -------------------------------------------------------------------------- */
/* Realm settings: merge, masking, secrets                                    */
/* -------------------------------------------------------------------------- */

const REALM_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,62}$/;
const SIMPLE_STRATEGIES = [
  'local',
  'username',
  'magicLink',
  'phone',
  'metamask',
  'biometric',
] as const;
const OAUTH_PROVIDERS = [
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
const PLAIN_CREDENTIALS = ['clientId', 'redirect_uri'] as const;
const APPLE_CREDENTIALS = ['teamId', 'keyId'] as const;
const SECRET_FIELDS = ['clientSecret', 'privateKey'] as const;

function assertValidSlug(value: unknown): string {
  const slug = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (!REALM_SLUG_PATTERN.test(slug)) {
    throw invalid(`Realm slug must match ${REALM_SLUG_PATTERN.source}`);
  }
  return slug;
}

function readBool(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') throw invalid(`${path} must be a boolean`);
  return value;
}

function readStringList(value: unknown, path: string): string[] {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) {
    throw invalid(`${path} must be an array of strings`);
  }
  return (value as string[]).map(item => item.trim()).filter(Boolean);
}

/** `null` and blank strings clear a credential. */
function readCredential(value: unknown, path: string): string | null {
  if (value === null) return null;
  if (typeof value !== 'string')
    throw invalid(`${path} must be a string or null`);
  return value.trim() === '' ? null : value;
}

type SanitizedInput = {
  settings: Json;
  secrets: MockRealmOAuthSecrets;
};

/** Whitelists the write body; unknown keys and read-only `has*` flags are dropped. */
function sanitizeInput(body: unknown): SanitizedInput {
  const settings: Json = {};
  const secrets: MockRealmOAuthSecrets = {};
  if (body === undefined || body === null) return { settings, secrets };
  if (!isJson(body)) throw invalid('body must be an object');
  if (body.active !== undefined)
    settings.active = readBool(body.active, 'active');
  if (body.registration !== undefined) {
    if (!isJson(body.registration))
      throw invalid('registration must be an object');
    const registration: Json = {};
    if (body.registration.allowWithoutInvite !== undefined) {
      registration.allowWithoutInvite = readBool(
        body.registration.allowWithoutInvite,
        'registration.allowWithoutInvite'
      );
    }
    settings.registration = registration;
  }
  if (body.policies !== undefined) {
    if (!isJson(body.policies)) throw invalid('policies must be an object');
    const policies: Json = {};
    for (const flag of ['requireTwoFa', 'requireVerifiedEmail'] as const) {
      if (body.policies[flag] !== undefined) {
        policies[flag] = readBool(body.policies[flag], `policies.${flag}`);
      }
    }
    if (body.policies.allowedClientIds !== undefined) {
      policies.allowedClientIds = readStringList(
        body.policies.allowedClientIds,
        'policies.allowedClientIds'
      );
    }
    if (body.policies.guests !== undefined) {
      if (!isJson(body.policies.guests)) {
        throw invalid('policies.guests must be an object');
      }
      const guests: Json = {};
      if (body.policies.guests.allowed !== undefined) {
        guests.allowed = readBool(
          body.policies.guests.allowed,
          'policies.guests.allowed'
        );
      }
      if (body.policies.guests.allowedHomeRealms !== undefined) {
        guests.allowedHomeRealms = readStringList(
          body.policies.guests.allowedHomeRealms,
          'policies.guests.allowedHomeRealms'
        );
      }
      if (body.policies.guests.directSignIn !== undefined) {
        guests.directSignIn = readBool(
          body.policies.guests.directSignIn,
          'policies.guests.directSignIn'
        );
      }
      policies.guests = guests;
    }
    settings.policies = policies;
  }
  if (body.linking !== undefined) {
    if (!isJson(body.linking)) throw invalid('linking must be an object');
    const linking: Json = {};
    for (const flag of ['inbound', 'outbound'] as const) {
      if (body.linking[flag] !== undefined) {
        linking[flag] = readBool(body.linking[flag], `linking.${flag}`);
      }
    }
    settings.linking = linking;
  }
  if (body.strategies !== undefined) {
    if (!isJson(body.strategies)) throw invalid('strategies must be an object');
    const strategies: Json = {};
    for (const key of SIMPLE_STRATEGIES) {
      const entry = body.strategies[key];
      if (entry === undefined) continue;
      if (!isJson(entry)) throw invalid(`strategies.${key} must be an object`);
      const clean: Json = {};
      if (entry.enabled !== undefined) {
        clean.enabled = readBool(entry.enabled, `strategies.${key}.enabled`);
      }
      if (key === 'local' && entry.verificationRequired !== undefined) {
        clean.verificationRequired =
          entry.verificationRequired === null
            ? null
            : readBool(
                entry.verificationRequired,
                'strategies.local.verificationRequired'
              );
      }
      strategies[key] = clean;
    }
    if (body.strategies.oauth !== undefined) {
      if (!isJson(body.strategies.oauth)) {
        throw invalid('strategies.oauth must be an object');
      }
      const oauth: Json = {};
      for (const [provider, raw] of Object.entries(body.strategies.oauth)) {
        const path = `strategies.oauth.${provider}`;
        if (!(OAUTH_PROVIDERS as readonly string[]).includes(provider)) {
          throw invalid(`${path} is not a supported OAuth provider`);
        }
        if (!isJson(raw)) throw invalid(`${path} must be an object`);
        const clean: Json = {};
        if (raw.enabled !== undefined) {
          clean.enabled = readBool(raw.enabled, `${path}.enabled`);
        }
        if (raw.accountLinking !== undefined) {
          clean.accountLinking =
            raw.accountLinking === null
              ? null
              : readBool(raw.accountLinking, `${path}.accountLinking`);
        }
        for (const field of PLAIN_CREDENTIALS) {
          if (raw[field] !== undefined) {
            clean[field] = readCredential(raw[field], `${path}.${field}`);
          }
        }
        if (provider === 'apple') {
          for (const field of APPLE_CREDENTIALS) {
            if (raw[field] !== undefined) {
              clean[field] = readCredential(raw[field], `${path}.${field}`);
            }
          }
        }
        for (const field of SECRET_FIELDS) {
          if (raw[field] === undefined) continue;
          if (field === 'privateKey' && provider !== 'apple') continue;
          // '' clears a stored secret
          secrets[provider] = {
            ...secrets[provider],
            [field]: readCredential(raw[field], `${path}.${field}`) ?? '',
          };
        }
        oauth[provider] = clean;
      }
      strategies.oauth = oauth;
    }
    settings.strategies = strategies;
  }
  return { settings, secrets };
}

/** Objects merge, arrays and scalars replace, `null` deletes the key. */
function deepMergeClearing(base: Json, patch: Json): Json {
  const result: Json = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    if (value === null) {
      delete result[key];
    } else if (isJson(value)) {
      result[key] = deepMergeClearing(
        isJson(result[key]) ? (result[key] as Json) : {},
        value
      );
    } else if (Array.isArray(value)) {
      result[key] = [...value];
    } else {
      result[key] = value;
    }
  }
  return result;
}

function applySecrets(
  existing: MockRealmOAuthSecrets,
  update: MockRealmOAuthSecrets
): MockRealmOAuthSecrets {
  const result: MockRealmOAuthSecrets = {};
  for (const [provider, value] of Object.entries(existing)) {
    result[provider] = { ...value };
  }
  for (const [provider, fields] of Object.entries(update)) {
    const next: Record<string, string> = { ...result[provider] };
    for (const [field, value] of Object.entries(fields)) {
      if (value === '') delete next[field];
      else next[field] = value as string;
    }
    result[provider] = next;
  }
  for (const provider of Object.keys(result)) {
    if (Object.keys(result[provider]).length === 0) delete result[provider];
  }
  return result;
}

type SettingsFields = Pick<
  MockRealmSettings,
  'active' | 'strategies' | 'registration' | 'policies' | 'linking'
>;

function pickFields(source: SettingsFields): SettingsFields {
  return JSON.parse(
    JSON.stringify({
      active: source.active,
      strategies: source.strategies,
      registration: source.registration,
      policies: source.policies,
      linking: source.linking,
    })
  ) as SettingsFields;
}

function applyWrite(
  base: SettingsFields,
  baseSecrets: MockRealmOAuthSecrets,
  body: unknown
): { fields: SettingsFields; secrets: MockRealmOAuthSecrets } {
  const { settings, secrets } = sanitizeInput(body);
  const merged = deepMergeClearing(
    pickFields(base) as unknown as Json,
    settings
  ) as unknown as SettingsFields;
  merged.strategies.oauth = merged.strategies.oauth ?? {};
  return { fields: merged, secrets: applySecrets(baseSecrets, secrets) };
}

/** Contract read shape: `has*` flags instead of secrets, no `oauthSecrets` key. */
function maskSettings(settings: MockRealmSettings) {
  const { oauthSecrets, strategies, ...rest } = settings;
  const oauth: Record<string, unknown> = {};
  const providers = new Set([
    ...Object.keys(strategies.oauth),
    ...Object.keys(oauthSecrets),
  ]);
  for (const provider of providers) {
    const entry: Json = isJson(strategies.oauth[provider])
      ? { ...(strategies.oauth[provider] as Json) }
      : { enabled: false };
    delete entry.clientSecret;
    delete entry.privateKey;
    delete entry.hasClientSecret;
    delete entry.hasPrivateKey;
    const masked: Json = {
      ...entry,
      hasClientSecret: Boolean(oauthSecrets[provider]?.clientSecret),
    };
    if (provider === 'apple') {
      masked.hasPrivateKey = Boolean(oauthSecrets[provider]?.privateKey);
    }
    oauth[provider] = masked;
  }
  return { ...rest, strategies: { ...strategies, oauth } };
}

/* -------------------------------------------------------------------------- */
/* Guest policy and classification                                            */
/* -------------------------------------------------------------------------- */

function guestAllowed(
  policies: MockRealmSettings['policies'],
  homeRealm: string | null
): boolean {
  if (!policies.guests.allowed) return false;
  const trusted = policies.guests.allowedHomeRealms;
  if (trusted.length === 0) return true;
  return homeRealm !== null && trusted.includes(homeRealm);
}

function describeUsers(users: MockUser[]): string {
  return users.map(user => `${user._id} (${user.email})`).join(', ');
}

function guestsNotAllowed(
  users: MockUser[],
  context: 'promote' | 'add'
): MockHttpError {
  const prefix =
    context === 'promote'
      ? 'This realm does not allow guests from the home realms of these existing team members: '
      : 'This realm does not allow guests from the home realms of these users: ';
  return conduitError('GUESTS_NOT_ALLOWED', prefix + describeUsers(users));
}

function grantMembership(
  auth: MockAuthState,
  userId: string,
  realmId: string,
  type: MockRealmMembershipType
): void {
  if (membershipOf(auth, userId, realmId)) return;
  auth.memberships.push({
    _id: nextId(auth),
    user: userId,
    realm: realmId,
    type,
    createdAt: FIXED_NOW,
  });
}

function grantTeamRole(
  auth: MockAuthState,
  teamId: string,
  userId: string,
  role: string
): void {
  if (auth.teamMembers.some(m => m.team === teamId && m.user === userId))
    return;
  auth.teamMembers.push({ team: teamId, user: userId, role });
}

/* -------------------------------------------------------------------------- */
/* Realms                                                                     */
/* -------------------------------------------------------------------------- */

export function countsOf(auth: MockAuthState, realmId: string) {
  const inRealm = auth.memberships.filter(item => item.realm === realmId);
  return {
    home: inRealm.filter(item => item.type === 'home').length,
    guest: inRealm.filter(item => item.type === 'guest').length,
  };
}

export function buildRealm(auth: MockAuthState, teamId: string) {
  const team = findRealmTeam(auth, teamId);
  return {
    team,
    settings: maskSettings(settingsOf(auth, teamId)),
    counts: countsOf(auth, teamId),
  };
}

export function listRealms(
  auth: MockAuthState,
  paging: Paging,
  search: string | undefined
) {
  let teams = auth.teams.filter(
    team =>
      team.realm?.enabled === true &&
      auth.realmSettings.some(item => item.team === team._id)
  );
  if (search) {
    const needle = search.toLowerCase();
    teams = teams.filter(
      team =>
        team.name.toLowerCase().includes(needle) ||
        (team.realm?.slug ?? '').includes(needle)
    );
  }
  const page = sortAndPage(teams, paging, (team, field) =>
    field === 'slug' ? team.realm?.slug : (team as unknown as Json)[field]
  );
  return {
    realms: page.map(team => buildRealm(auth, team._id)),
    count: teams.length,
  };
}

export function promoteTeam(
  auth: MockAuthState,
  teamId: string,
  body: unknown
) {
  assertEnabled(auth);
  const team = findTeam(auth, teamId);
  if (team.realm?.enabled) {
    throw new MockHttpError(500, 'Team is already a realm');
  }
  const ids = subtreeIds(auth, teamId);
  const nested =
    team.parentTeam !== null ||
    ids.some(id => id !== teamId && findTeam(auth, id).realm?.enabled === true);
  if (nested) throw conduitError('REALM_NESTED');
  const requested = isJson(body) ? body.slug : undefined;
  const slug = assertValidSlug(requested);
  if (
    auth.teams.some(item => item.realm?.slug === slug && item._id !== teamId)
  ) {
    throw conduitError('REALM_SLUG_TAKEN');
  }
  const base = defaultRealmSettings();
  const { fields, secrets } = applyWrite(base, {}, body);

  // existing members, from the team and its sub-teams
  const memberIds = [
    ...new Set(
      auth.teamMembers.filter(m => ids.includes(m.team)).map(m => m.user)
    ),
  ];
  const members = memberIds.map(id => findUser(auth, id));
  const rejected = members.filter(
    user =>
      user.homeRealm !== null &&
      user.homeRealm !== teamId &&
      !guestAllowed(fields.policies, user.homeRealm)
  );
  if (rejected.length > 0) throw guestsNotAllowed(rejected, 'promote');

  auth.realmSettings = auth.realmSettings.filter(item => item.team !== teamId);
  auth.realmSettings.push({
    _id: nextId(auth),
    team: teamId,
    ...fields,
    oauthSecrets: secrets,
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW,
  });
  team.realm = { enabled: true, slug };
  for (const user of members) {
    if (user.homeRealm === null || user.homeRealm === teamId) {
      user.homeRealm = teamId;
      grantMembership(auth, user._id, teamId, 'home');
    } else {
      grantMembership(auth, user._id, teamId, 'guest');
    }
  }
  return buildRealm(auth, teamId);
}

export function updateRealm(
  auth: MockAuthState,
  teamId: string,
  body: unknown
) {
  assertEnabled(auth);
  const team = findRealmTeam(auth, teamId);
  const stored = settingsOf(auth, teamId);
  const input = isJson(body) ? body : {};
  let newSlug: string | undefined;
  if (input.slug !== undefined && input.slug !== null) {
    if (typeof input.slug !== 'string') throw invalid('slug must be a string');
    const normalized = input.slug.trim().toLowerCase();
    if (normalized !== (team.realm?.slug ?? '')) {
      if (input.force !== true) {
        throw invalid(
          'Changing the realm slug breaks clients that use it; send force: true to confirm'
        );
      }
      newSlug = normalized;
    }
  }
  const { fields, secrets } = applyWrite(stored, stored.oauthSecrets, body);
  if (newSlug !== undefined) {
    assertValidSlug(newSlug);
    if (
      auth.teams.some(
        item => item.realm?.slug === newSlug && item._id !== teamId
      )
    ) {
      throw conduitError('REALM_SLUG_TAKEN');
    }
    team.realm = { enabled: true, slug: newSlug };
  }
  Object.assign(stored, fields, { oauthSecrets: secrets });
  stored.updatedAt = FIXED_NOW;
  return buildRealm(auth, teamId);
}

export function demoteRealm(
  auth: MockAuthState,
  teamId: string,
  force: boolean
) {
  const team = findRealmTeam(auth, teamId);
  const homeUsers = auth.users.filter(user => user.homeRealm === teamId);
  const homeMemberships = auth.memberships.filter(
    item => item.realm === teamId && item.type === 'home'
  );
  if (Math.max(homeUsers.length, homeMemberships.length) > 0 && !force) {
    throw conduitError('REALM_HAS_HOME_USERS');
  }
  for (const user of homeUsers) {
    user.active = false;
    auth.signedOutUserIds.push(user._id);
  }
  auth.memberships = auth.memberships.filter(item => item.realm !== teamId);
  auth.realmSettings = auth.realmSettings.filter(item => item.team !== teamId);
  team.realm = { enabled: false };
  return { message: 'Realm removed', blockedUsers: homeUsers.length };
}

/* -------------------------------------------------------------------------- */
/* Members                                                                    */
/* -------------------------------------------------------------------------- */

function toMember(
  auth: MockAuthState,
  user: MockUser,
  role: string | undefined,
  realmId: string | undefined
) {
  const type = realmId
    ? membershipOf(auth, user._id, realmId)?.type
    : undefined;
  return {
    ...user,
    ...(role ? { role } : {}),
    ...(type ? { membershipType: type } : {}),
  };
}

export function listTeamMembers(
  auth: MockAuthState,
  teamId: string,
  paging: Paging,
  search: string | undefined
) {
  const team = findTeam(auth, teamId);
  const realm = realmsActive(auth) ? realmOfTeam(auth, team) : undefined;
  const rows = auth.teamMembers
    .filter(item => item.team === teamId)
    .flatMap(item => {
      const user = auth.users.find(candidate => candidate._id === item.user);
      return user && matchesUserSearch(user, search)
        ? [{ user, role: item.role }]
        : [];
    });
  const page = sortAndPage(rows, paging, (row, field) =>
    field === 'role' ? row.role : (row.user as unknown as Json)[field]
  );
  return {
    members: page.map(row => toMember(auth, row.user, row.role, realm?._id)),
    count: rows.length,
  };
}

export function addTeamMembers(
  auth: MockAuthState,
  teamId: string,
  body: unknown
): string {
  const team = findTeam(auth, teamId);
  const ids = isJson(body) ? body.members : undefined;
  if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string')) {
    throw invalid('members must be an array of user ids');
  }
  const users = (ids as string[]).map(id => findUser(auth, id));
  const fresh = users.filter(
    user =>
      !auth.teamMembers.some(m => m.team === teamId && m.user === user._id)
  );
  const realm = realmsActive(auth) ? realmOfTeam(auth, team) : undefined;
  if (realm) {
    const policies = settingsOf(auth, realm._id).policies;
    const rejected = fresh.filter(
      user =>
        user.homeRealm !== null &&
        user.homeRealm !== realm._id &&
        !guestAllowed(policies, user.homeRealm)
    );
    if (rejected.length > 0) throw guestsNotAllowed(rejected, 'add');
  }
  for (const user of fresh) {
    grantTeamRole(auth, teamId, user._id, 'member');
    if (!realm) continue;
    if (user.homeRealm === null) user.homeRealm = realm._id;
    grantMembership(
      auth,
      user._id,
      realm._id,
      user.homeRealm === realm._id ? 'home' : 'guest'
    );
  }
  return 'OK';
}

function dropGuestAccess(auth: MockAuthState, userId: string, realmId: string) {
  const ids = subtreeIds(auth, realmId);
  auth.teamMembers = auth.teamMembers.filter(
    item => !(item.user === userId && ids.includes(item.team))
  );
  auth.memberships = auth.memberships.filter(
    item => !(item.user === userId && item.realm === realmId)
  );
}

export function removeTeamMembers(
  auth: MockAuthState,
  teamId: string,
  userIds: string[]
): string {
  const team = findTeam(auth, teamId);
  const users = userIds.map(id => findUser(auth, id));
  if (team.realm?.enabled === true) {
    const home = users.filter(user => user.homeRealm === teamId);
    if (home.length > 0) throw conduitError('HOME_USER_REMOVAL');
  }
  for (const user of users) {
    if (team.realm?.enabled === true) {
      dropGuestAccess(auth, user._id, teamId);
      continue;
    }
    auth.teamMembers = auth.teamMembers.filter(
      item => !(item.team === teamId && item.user === user._id)
    );
    const realm = realmOfTeam(auth, team);
    if (!realm) continue;
    const stillInRealm = auth.teamMembers.some(
      item =>
        item.user === user._id &&
        subtreeIds(auth, realm._id).includes(item.team)
    );
    const type = membershipOf(auth, user._id, realm._id)?.type;
    if (!stillInRealm && type === 'guest') {
      auth.memberships = auth.memberships.filter(
        item => !(item.user === user._id && item.realm === realm._id)
      );
    }
  }
  return 'OK';
}

export function patchTeamMemberRoles(
  auth: MockAuthState,
  teamId: string,
  body: unknown
): string {
  findTeam(auth, teamId);
  const ids = isJson(body) ? body.members : undefined;
  const role = isJson(body) ? body.role : undefined;
  if (!Array.isArray(ids) || typeof role !== 'string' || role === '') {
    throw invalid('members and role are required');
  }
  for (const item of auth.teamMembers) {
    if (item.team === teamId && ids.includes(item.user)) item.role = role;
  }
  return 'OK';
}

export function listRealmMembers(
  auth: MockAuthState,
  teamId: string,
  type: string | undefined,
  paging: Paging,
  search: string | undefined
) {
  findRealmTeam(auth, teamId);
  if (type !== undefined && type !== 'home' && type !== 'guest') {
    throw invalid("type must be 'home' or 'guest'");
  }
  const rows = auth.memberships
    .filter(item => item.realm === teamId && (!type || item.type === type))
    .flatMap(item => {
      const user = auth.users.find(candidate => candidate._id === item.user);
      return user && matchesUserSearch(user, search) ? [user] : [];
    });
  const page = sortAndPage(
    rows,
    paging,
    (user, field) => (user as unknown as Json)[field]
  );
  return {
    members: page.map(user =>
      toMember(
        auth,
        user,
        auth.teamMembers.find(m => m.team === teamId && m.user === user._id)
          ?.role,
        teamId
      )
    ),
    count: rows.length,
  };
}

export function addGuests(
  auth: MockAuthState,
  teamId: string,
  body: unknown
): { added: number } {
  assertEnabled(auth);
  findRealmTeam(auth, teamId);
  const ids = isJson(body) ? body.userIds : undefined;
  if (!Array.isArray(ids) || ids.length === 0) {
    throw invalid('userIds is required and must be a non-empty array');
  }
  const users = [...new Set((ids as unknown[]).map(String))].map(id =>
    findUser(auth, id)
  );
  const toAdd = users.filter(
    user => user.homeRealm !== teamId && !membershipOf(auth, user._id, teamId)
  );
  const policies = settingsOf(auth, teamId).policies;
  const rejected = toAdd.filter(
    user => !guestAllowed(policies, user.homeRealm)
  );
  if (rejected.length > 0) throw guestsNotAllowed(rejected, 'add');
  for (const user of toAdd) {
    grantMembership(auth, user._id, teamId, 'guest');
    grantTeamRole(auth, teamId, user._id, 'member');
  }
  return { added: toAdd.length };
}

export function removeGuest(
  auth: MockAuthState,
  teamId: string,
  userId: string
): string {
  findRealmTeam(auth, teamId);
  const user = findUser(auth, userId);
  if (user.homeRealm === teamId) throw conduitError('HOME_USER_REMOVAL');
  dropGuestAccess(auth, userId, teamId);
  return 'OK';
}

/* -------------------------------------------------------------------------- */
/* Users                                                                      */
/* -------------------------------------------------------------------------- */

export type UserFilters = {
  search?: string;
  isActive?: boolean;
  homeRealm?: string;
  realm?: string;
};

export function listUsers(
  auth: MockAuthState,
  paging: Paging,
  filters: UserFilters
) {
  let users = auth.users.filter(user =>
    matchesUserSearch(user, filters.search)
  );
  if (filters.isActive !== undefined) {
    users = users.filter(user => user.active === filters.isActive);
  }
  if (filters.homeRealm !== undefined) {
    const target = filters.homeRealm === 'global' ? null : filters.homeRealm;
    users = users.filter(user => user.homeRealm === target);
  }
  if (filters.realm !== undefined) {
    const members = new Set(
      auth.memberships
        .filter(item => item.realm === filters.realm)
        .map(i => i.user)
    );
    users = users.filter(user => members.has(user._id));
  }
  const page = sortAndPage(
    users,
    paging,
    (user, field) => (user as unknown as Json)[field]
  );
  return { users: page, count: users.length };
}

/** `GET /authentication/users/:id/realms`: the home realm and every guest realm. */
export function userRealms(auth: MockAuthState, userId: string) {
  const user = findUser(auth, userId);
  const summary = (realmId: string) => {
    const team = findRealmTeam(auth, realmId);
    return { _id: team._id, name: team.name, slug: team.realm?.slug ?? '' };
  };
  return {
    home: user.homeRealm ? summary(user.homeRealm) : null,
    guests: auth.memberships
      .filter(item => item.user === userId && item.type === 'guest')
      .map(item => ({ ...summary(item.realm), createdAt: item.createdAt })),
  };
}

export function createUser(auth: MockAuthState, body: unknown): MockUser {
  const input = isJson(body) ? body : {};
  const email = typeof input.email === 'string' ? input.email.trim() : '';
  if (!email || typeof input.password !== 'string') {
    throw invalid('email and password are required');
  }
  const homeRealm =
    typeof input.homeRealm === 'string' && input.homeRealm !== ''
      ? input.homeRealm
      : null;
  if (homeRealm) {
    assertEnabled(auth);
    findRealmTeam(auth, homeRealm);
  }
  // Shared: one email deployment-wide. Isolated: once per home realm (global is a scope).
  const taken = auth.users.some(
    user =>
      user.email.toLowerCase() === email.toLowerCase() &&
      (auth.identityMode === 'shared' || user.homeRealm === homeRealm)
  );
  if (taken) throw new MockHttpError(500, 'User already exists');
  const user: MockUser = {
    _id: nextId(auth),
    email,
    active: true,
    isVerified: true,
    hasTwoFA: false,
    twoFaMethod: 'sms',
    homeRealm,
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW,
  };
  auth.users.push(user);
  if (homeRealm) {
    grantMembership(auth, user._id, homeRealm, 'home');
    grantTeamRole(auth, homeRealm, user._id, 'member');
  }
  return user;
}

export function moveHomeRealm(
  auth: MockAuthState,
  userId: string,
  body: unknown
): MockUser {
  assertEnabled(auth);
  const user = findUser(auth, userId);
  const input = isJson(body) ? body : {};
  const requested = input.realmTeamId;
  const target =
    requested === undefined ||
    requested === null ||
    requested === '' ||
    requested === 'global'
      ? null
      : String(requested);
  const previous = user.homeRealm;
  if (target) findRealmTeam(auth, target);
  if (target !== previous) {
    if (target) {
      const existing = membershipOf(auth, userId, target);
      if (existing) existing.type = 'home';
      else grantMembership(auth, userId, target, 'home');
      grantTeamRole(auth, target, userId, 'member');
    }
    user.homeRealm = target;
    user.updatedAt = FIXED_NOW;
    if (previous) {
      auth.memberships = auth.memberships.filter(
        item => !(item.user === userId && item.realm === previous)
      );
    }
  }
  if (input.force === true) auth.signedOutUserIds.push(userId);
  return user;
}

/* -------------------------------------------------------------------------- */
/* Teams                                                                      */
/* -------------------------------------------------------------------------- */

export type TeamFilters = {
  search?: string;
  parentTeam?: string;
  realm?: boolean;
};

export function listTeams(
  auth: MockAuthState,
  paging: Paging,
  filters: TeamFilters
) {
  let teams = auth.teams.filter(team =>
    filters.parentTeam
      ? team.parentTeam === filters.parentTeam
      : !team.parentTeam
  );
  if (filters.search) {
    if (OBJECT_ID.test(filters.search)) {
      teams = teams.filter(team => team._id === filters.search);
    } else {
      const needle = filters.search.toLowerCase();
      teams = teams.filter(team => team.name.toLowerCase().includes(needle));
    }
  }
  if (filters.realm !== undefined) {
    teams = teams.filter(team =>
      filters.realm
        ? team.realm?.enabled === true
        : team.realm?.enabled !== true
    );
  }
  const page = sortAndPage(
    teams,
    paging,
    (team, field) => (team as unknown as Json)[field]
  );
  return { teams: page, count: teams.length };
}

export function createTeam(auth: MockAuthState, body: unknown): MockTeam {
  const input = isJson(body) ? body : {};
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (!name) throw invalid('name is required');
  const parent =
    typeof input.parentTeam === 'string' && input.parentTeam !== ''
      ? input.parentTeam
      : null;
  if (parent) findTeam(auth, parent);
  if (
    auth.teams.some(team => team.name === name && team.parentTeam === parent)
  ) {
    throw new MockHttpError(500, 'Team already exists');
  }
  const team = seedTeam(nextId(auth), name, {
    parentTeam: parent,
    isDefault: input.isDefault === true,
  });
  auth.teams.push(team);
  return team;
}

export function updateTeam(
  auth: MockAuthState,
  teamId: string,
  body: unknown
): MockTeam {
  const team = findTeam(auth, teamId);
  const input = isJson(body) ? body : {};
  if (typeof input.name === 'string' && input.name.trim()) {
    team.name = input.name.trim();
  }
  if (typeof input.isDefault === 'boolean') team.isDefault = input.isDefault;
  team.updatedAt = FIXED_NOW;
  return team;
}

export function deleteTeam(auth: MockAuthState, teamId: string): string {
  const team = findTeam(auth, teamId);
  if (team.realm?.enabled === true) {
    throw invalid('Realm teams cannot be deleted. Demote the realm first.');
  }
  const ids = subtreeIds(auth, teamId);
  auth.teams = auth.teams.filter(item => !ids.includes(item._id));
  auth.teamMembers = auth.teamMembers.filter(item => !ids.includes(item.team));
  return 'OK';
}
