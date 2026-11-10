import {
  hasFilter,
  type UserAdminCapabilities,
} from '@/lib/authentication/userCapabilities';

/** Fields the users table is allowed to send as `sort`. */
export const USER_SORT_FIELDS = [
  'email',
  'createdAt',
  'updatedAt',
  'active',
  'isVerified',
] as const;

export type UserSortField = (typeof USER_SORT_FIELDS)[number];

/** Providers the admin filter can name. `phone` is gated separately. */
export const SCHEMA_PROVIDERS = [
  'local',
  'metamask',
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

const KNOWN_PROVIDERS = new Set<string>([
  ...SCHEMA_PROVIDERS,
  'phone',
  'username',
]);

const PROVIDER_LABELS: Record<string, string> = {
  local: 'Local',
  metamask: 'MetaMask',
  apple: 'Apple',
  bitbucket: 'Bitbucket',
  facebook: 'Facebook',
  figma: 'Figma',
  github: 'GitHub',
  gitlab: 'GitLab',
  google: 'Google',
  linkedin: 'LinkedIn',
  microsoft: 'Microsoft',
  reddit: 'Reddit',
  slack: 'Slack',
  twitch: 'Twitch',
  twitter: 'Twitter',
  phone: 'Phone',
  username: 'Username',
};

export const USER_LIST_LIMIT_DEFAULT = 10;
export const USER_LIST_LIMIT_MAX = 25;

export type UserListQuery = {
  skip: number;
  limit: number;
  search?: string;
  sort?: string;
  isActive?: boolean;
  isVerified?: boolean;
  isAnonymous?: boolean;
  hasTwoFA?: boolean;
  provider?: string;
  homeRealm?: string;
};

/** `null` removes the param. Filter changes restart at the first page. */
export type UserListPatch = {
  search?: string | null;
  sort?: string | null;
  isActive?: boolean | null;
  isVerified?: boolean | null;
  isAnonymous?: boolean | null;
  hasTwoFA?: boolean | null;
  provider?: string | null;
  homeRealm?: string | null;
  skip?: number | null;
  limit?: number | null;
};

const FILTER_KEYS = [
  'search',
  'sort',
  'isActive',
  'isVerified',
  'isAnonymous',
  'hasTwoFA',
  'provider',
  'homeRealm',
] as const satisfies readonly (keyof UserListPatch)[];

function toSearchParams(
  input: URLSearchParams | Record<string, unknown>
): URLSearchParams {
  if (input instanceof URLSearchParams) return input;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) continue;
    const first = Array.isArray(value) ? value[0] : value;
    if (first === undefined || first === null || first === '') continue;
    params.set(key, String(first));
  }
  return params;
}

function booleanParam(value: string | null): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

function numberParam(value: string | null, fallback: number): number {
  if (value === null || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.floor(parsed);
}

function sortParam(value: string | null): string | undefined {
  if (!value) return undefined;
  const field = value.startsWith('-') ? value.slice(1) : value;
  if (!(USER_SORT_FIELDS as readonly string[]).includes(field))
    return undefined;
  return value;
}

function providerParam(
  value: string | null,
  capabilities: UserAdminCapabilities
): string | undefined {
  if (!value || !KNOWN_PROVIDERS.has(value)) return undefined;
  if (value === 'phone' && !hasFilter(capabilities, 'providerPhone')) {
    return undefined;
  }
  return value;
}

/** Drops params this backend would ignore, so a filter never looks applied when it isn't. */
export function parseUserListParams(
  input: URLSearchParams | Record<string, unknown>,
  capabilities: UserAdminCapabilities
): UserListQuery {
  const params = toSearchParams(input);
  const isAnonymous = booleanParam(params.get('isAnonymous'));
  const hideAnonymous =
    isAnonymous === false && !hasFilter(capabilities, 'isAnonymousExclusive');
  const isVerified = booleanParam(params.get('isVerified'));
  const hasTwoFA = booleanParam(params.get('hasTwoFA'));
  const limit = Math.min(
    USER_LIST_LIMIT_MAX,
    numberParam(params.get('limit'), USER_LIST_LIMIT_DEFAULT) ||
      USER_LIST_LIMIT_DEFAULT
  );

  return {
    skip: numberParam(params.get('skip'), 0),
    limit,
    ...(params.get('search')
      ? { search: params.get('search') ?? undefined }
      : {}),
    ...(sortParam(params.get('sort'))
      ? { sort: sortParam(params.get('sort')) }
      : {}),
    ...(booleanParam(params.get('isActive')) !== undefined
      ? { isActive: booleanParam(params.get('isActive')) }
      : {}),
    ...(isVerified !== undefined && hasFilter(capabilities, 'isVerified')
      ? { isVerified }
      : {}),
    ...(isAnonymous !== undefined && !hideAnonymous ? { isAnonymous } : {}),
    ...(hasTwoFA !== undefined && hasFilter(capabilities, 'hasTwoFA')
      ? { hasTwoFA }
      : {}),
    ...(providerParam(params.get('provider'), capabilities)
      ? { provider: providerParam(params.get('provider'), capabilities) }
      : {}),
    ...(params.get('homeRealm')
      ? { homeRealm: params.get('homeRealm') ?? undefined }
      : {}),
  };
}

function setBoolean(params: URLSearchParams, key: string, value: boolean) {
  params.set(key, value ? 'true' : 'false');
}

/** Query string the page can round-trip. Omitted fields are not filters. */
export function serializeUserListParams(query: UserListQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.skip > 0) params.set('skip', String(query.skip));
  if (query.limit !== USER_LIST_LIMIT_DEFAULT) {
    params.set('limit', String(query.limit));
  }
  if (query.search) params.set('search', query.search);
  if (query.sort) params.set('sort', query.sort);
  if (query.isActive !== undefined)
    setBoolean(params, 'isActive', query.isActive);
  if (query.isVerified !== undefined) {
    setBoolean(params, 'isVerified', query.isVerified);
  }
  if (query.isAnonymous !== undefined) {
    setBoolean(params, 'isAnonymous', query.isAnonymous);
  }
  if (query.hasTwoFA !== undefined)
    setBoolean(params, 'hasTwoFA', query.hasTwoFA);
  if (query.provider) params.set('provider', query.provider);
  if (query.homeRealm) params.set('homeRealm', query.homeRealm);
  return params;
}

function applyValue(
  query: UserListQuery,
  key: (typeof FILTER_KEYS)[number] | 'skip' | 'limit',
  value: string | boolean | number | null | undefined
) {
  if (value === null || value === undefined || value === '') {
    delete query[key];
    return;
  }
  if (key === 'skip' || key === 'limit') {
    query[key] = value as number;
    return;
  }
  if (
    key === 'isActive' ||
    key === 'isVerified' ||
    key === 'isAnonymous' ||
    key === 'hasTwoFA'
  ) {
    query[key] = value as boolean;
    return;
  }
  query[key] = value as string;
}

/**
 * Applies a filter change. Any filter (not paging) restarts at the first page.
 * The result is parsed again so a gated value is never written.
 */
export function applyUserListPatch(
  current: URLSearchParams | Record<string, unknown>,
  patch: UserListPatch,
  capabilities: UserAdminCapabilities
): URLSearchParams {
  const query = parseUserListParams(current, capabilities);
  const filterChanged = FILTER_KEYS.some(key => key in patch);
  for (const [key, value] of Object.entries(patch) as [
    keyof UserListPatch,
    UserListPatch[keyof UserListPatch],
  ][]) {
    applyValue(query, key, value);
  }
  if (filterChanged) query.skip = 0;
  return serializeUserListParams(
    parseUserListParams(serializeUserListParams(query), capabilities)
  );
}

/** asc → desc → none. */
export function nextSort(
  current: string | undefined,
  field: UserSortField
): string | undefined {
  if (current === field) return `-${field}`;
  if (current === `-${field}`) return undefined;
  return field;
}

export function providerLabel(provider: string): string {
  return PROVIDER_LABELS[provider] ?? provider;
}

function sectionEnabled(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    'enabled' in value &&
    (value as { enabled?: unknown }).enabled === true
  );
}

/**
 * Strategies turned on in the authentication config.
 * When settings failed to load, the schema list is the fallback.
 * `phone` is included only when the backend can filter on it and phone auth is on
 * (or settings are missing, so the fallback stays available).
 */
export function providerChoices(
  config: object | null | undefined,
  capabilities: UserAdminCapabilities
): string[] {
  const record = config as Record<string, unknown> | null | undefined;
  const choices: string[] = !record
    ? [...SCHEMA_PROVIDERS]
    : SCHEMA_PROVIDERS.filter(key => sectionEnabled(record[key]));
  if (
    hasFilter(capabilities, 'providerPhone') &&
    (!record || sectionEnabled(record.phoneAuthentication))
  ) {
    choices.push('phone');
  }
  return choices;
}

/** Params for `getUsers`, without paging and without empty fields. */
export function toUserQueryParams(
  query: UserListQuery,
  options?: { includeHomeRealm?: boolean }
): {
  sort?: string;
  search?: string;
  isActive?: boolean;
  isVerified?: boolean;
  isAnonymous?: boolean;
  hasTwoFA?: boolean;
  provider?: string;
  homeRealm?: string;
} {
  return {
    ...(query.search ? { search: query.search } : {}),
    ...(query.sort ? { sort: query.sort } : {}),
    ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    ...(query.isVerified !== undefined ? { isVerified: query.isVerified } : {}),
    ...(query.isAnonymous !== undefined
      ? { isAnonymous: query.isAnonymous }
      : {}),
    ...(query.hasTwoFA !== undefined ? { hasTwoFA: query.hasTwoFA } : {}),
    ...(query.provider ? { provider: query.provider } : {}),
    ...(options?.includeHomeRealm !== false && query.homeRealm
      ? { homeRealm: query.homeRealm }
      : {}),
  };
}
