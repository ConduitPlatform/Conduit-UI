/** What `GET /authentication/users/capabilities` says this backend can do. */
export type UserAdminCapabilities = {
  version: number;
  filters: string[];
  sort: string[];
  actions: string[];
};

/** A 404 or any failed probe: hide every gated control and never send its params. */
export const LEGACY_CAPABILITIES: UserAdminCapabilities = {
  version: 0,
  filters: [],
  sort: [],
  actions: [],
};

export const USER_ADMIN_CAPABILITIES_V1: UserAdminCapabilities = {
  version: 1,
  filters: ['isVerified', 'hasTwoFA', 'isAnonymousExclusive', 'providerPhone'],
  sort: ['email', 'createdAt', 'updatedAt', 'active', 'isVerified'],
  actions: [
    'setPassword',
    'sendPasswordReset',
    'resetTwoFa',
    'clearPhone',
    'bulkDeleteFull',
    'bulkToggleFixed',
    'userTeams',
  ],
};

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === 'string');
}

/** Drops a body that isn't the capabilities shape. Unknown names are kept. */
export function normalizeCapabilities(value: unknown): UserAdminCapabilities {
  if (!value || typeof value !== 'object') return LEGACY_CAPABILITIES;
  const record = value as Record<string, unknown>;
  return {
    version: typeof record.version === 'number' ? record.version : 0,
    filters: stringList(record.filters),
    sort: stringList(record.sort),
    actions: stringList(record.actions),
  };
}

/**
 * A v1 backend patches only the fields it is sent. Older handlers need the
 * email and 2FA fields resent on every patch.
 */
export function patchesOnlySentFields(
  capabilities: UserAdminCapabilities
): boolean {
  return capabilities.version >= 1;
}

export function hasAction(
  capabilities: UserAdminCapabilities,
  action: string
): boolean {
  return capabilities.actions.includes(action);
}

export function hasFilter(
  capabilities: UserAdminCapabilities,
  filter: string
): boolean {
  return capabilities.filters.includes(filter);
}
