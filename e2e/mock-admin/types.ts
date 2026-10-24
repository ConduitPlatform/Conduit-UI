export const MOCK_SCENARIOS = [
  'ready',
  'workers-off',
  'gated',
  'blank',
  'no-embeddings',
  // Authentication realms. Embeddings are in the `ready` state in all three.
  'realms',
  'realms-disabled',
  'realms-legacy',
  // Isolated identity mode, with the same email held by one user in each of two realms.
  'realms-isolated',
] as const;

export type MockScenario = (typeof MOCK_SCENARIOS)[number];

export function isMockScenario(value: unknown): value is MockScenario {
  return (
    typeof value === 'string' &&
    (MOCK_SCENARIOS as readonly string[]).includes(value)
  );
}

export type MockModule = {
  moduleName: string;
  url: string;
  serving: boolean;
};

export type MockProviderModel = {
  name: string;
  dimensions: number;
};

export type MockProviderSettings = {
  endpoint: string;
  apiKey: string;
  models: MockProviderModel[];
  defaultModel: string;
};

export type MockEmbeddingsSettings = {
  enabled: boolean;
  defaultProvider: string;
  providers: Record<string, MockProviderSettings>;
  queue: {
    concurrency: number;
    attempts: number;
    maxBatchSize: number;
    drainTimeoutMs: number;
  };
  security: {
    sourceFieldAllowlist: string[];
    maxMutationEventIds: number;
    embedTimeoutMs: number;
    maxEmbedInputBytes: number;
    maxEmbedResponseBytes: number;
  };
};

export type MockCapabilities = {
  supported: boolean;
  storage: boolean;
  indexing: boolean;
  search: boolean;
  provider: 'mongodb' | 'postgres' | 'unsupported';
  reason?: string;
};

export type MockQueueCounts = {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
};

export type MockEmbeddingConfig = {
  _id: string;
  schemaName: string;
  sourceFields: string[];
  targetField: string;
  provider: string;
  model: string;
  dimensions: number;
  similarity: 'cosine' | 'euclidean' | 'dotProduct';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MockVectorIndex = {
  name: string;
  field: string;
  dimensions: number;
  similarity: 'cosine' | 'euclidean' | 'dotProduct';
  method: 'hnsw' | 'ivfflat' | 'flat';
  status: 'pending' | 'ready' | 'failed';
  queryable: boolean;
};

export type MockSchema = {
  _id: string;
  name: string;
  parentSchema: string | null;
  fields: Record<string, unknown>;
  compiledFields: Record<string, unknown>;
  extensions: unknown[];
  modelOptions: Record<string, unknown>;
  ownerModule: string;
  collectionName: string;
  createdAt: string;
  updatedAt: string;
};

export type MockBackfillRun = {
  _id: string;
  schemaName: string;
  configId?: string;
  state: 'queued' | 'running' | 'completed' | 'failed' | 'canceled';
  cursor?: string;
  batchSize: number;
  onlyMissing: boolean;
  filter?: Record<string, unknown>;
  scannedCount: number;
  queuedCount: number;
  processedCount: number;
  failedCount: number;
  startedAt?: string;
  finishedAt?: string;
  drainStartedAt?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
  autoAdvance: boolean;
  pollCount: number;
  createdMs: number;
};

export type MockRealmMembershipType = 'home' | 'guest';

export type MockTeam = {
  _id: string;
  name: string;
  parentTeam: string | null;
  isDefault: boolean;
  realm?: { enabled: boolean; slug?: string };
  createdAt: string;
  updatedAt: string;
};

export type MockRealmOAuthSecrets = Record<
  string,
  { clientSecret?: string; privateKey?: string }
>;

export type MockRealmSettings = {
  _id: string;
  team: string;
  active: boolean;
  strategies: Record<string, unknown> & { oauth: Record<string, unknown> };
  registration: { allowWithoutInvite: boolean };
  policies: {
    requireTwoFa: boolean;
    requireVerifiedEmail: boolean;
    allowedClientIds: string[];
    guests: {
      allowed: boolean;
      allowedHomeRealms: string[];
      directSignIn: boolean;
    };
  };
  linking: { inbound: boolean; outbound: boolean };
  /** Never leaves the mock: reads return `has*` flags instead. */
  oauthSecrets: MockRealmOAuthSecrets;
  createdAt: string;
  updatedAt: string;
};

export type MockUser = {
  _id: string;
  email: string;
  active: boolean;
  isVerified: boolean;
  hasTwoFA: boolean;
  twoFaMethod: string;
  homeRealm: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MockTeamMember = {
  team: string;
  user: string;
  role: string;
};

export type MockRealmMembership = {
  _id: string;
  user: string;
  realm: string;
  type: MockRealmMembershipType;
  createdAt: string;
};

export type MockIdentityMode = 'shared' | 'isolated';

export type MockAuthState = {
  /** `absent` reproduces a backend that predates realms (no `teams.realms` key). */
  realmsFlag: 'enabled' | 'disabled' | 'absent';
  /** `teams.realms.identityMode`. Shared: identifiers are unique deployment-wide. */
  identityMode: MockIdentityMode;
  /** `teams.realms.discoveryLogin`. */
  discoveryLogin: boolean;
  /** Authentication config without `teams.realms` (derived from `realmsFlag`). */
  config: Record<string, unknown>;
  teams: MockTeam[];
  realmSettings: MockRealmSettings[];
  users: MockUser[];
  teamMembers: MockTeamMember[];
  memberships: MockRealmMembership[];
  /** Users whose tokens were deleted (force demote, force home-realm move). */
  signedOutUserIds: string[];
  seq: number;
};

/** A request the mock served, for specs that assert on what the UI sent. */
export type MockRecordedRequest = {
  method: string;
  path: string;
  query: Record<string, string | string[]>;
  body: unknown;
};

export type MockAdminState = {
  scenario: MockScenario;
  modules: MockModule[];
  settings: MockEmbeddingsSettings;
  capabilities: MockCapabilities;
  schemas: MockSchema[];
  configs: MockEmbeddingConfig[];
  indexesBySchemaId: Record<string, MockVectorIndex[]>;
  backfills: MockBackfillRun[];
  tokens: Set<string>;
  lastSettingsPatchHadApiKey: boolean;
  configSeq: number;
  backfillSeq: number;
  auth: MockAuthState;
  requests: MockRecordedRequest[];
};
