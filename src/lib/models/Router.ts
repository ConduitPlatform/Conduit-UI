export type RouterSettings = {
  hostUrl: string;
  captcha: CaptchaSettings;
  cors: CorsSettings;
  transports: TransportSettings;
  rateLimit: RateLimitSettings;
  security: SecuritySettings;
};

export type CaptchaProvider = 'recaptcha' | 'hcaptcha' | 'turnstile';

type CaptchaSettings = {
  enabled: boolean;
  provider: CaptchaProvider;
  secretKey: string;
};

type CorsSettings = {
  enabled: boolean;
  origin: string;
  methods: string;
  allowedHeaders: string;
  exposedHeaders: string;
  credentials: boolean;
  maxAge: number;
};

type TransportSettings = {
  rest: boolean;
  graphql: boolean;
  sockets: boolean;
};

type RateLimitSettings = {
  maxRequests: number;
  resetInterval: number;
};

export type SecuritySettings = {
  clientValidation: boolean;
  clientSecretEncryptionKey: string;
  clientSignaturePathPrefix: string;
};

/** Marker the admin API returns for a stored sensitive value. Never send it back. */
export const REDACTED_CONFIG_VALUE = '[REDACTED]';

/**
 * Security block for PATCH /config/router.
 * `clientSecretEncryptionKey` is omitted unless this edit typed or generated a value.
 */
export type SecuritySettingsPatch = Omit<
  SecuritySettings,
  'clientSecretEncryptionKey'
> & {
  clientSecretEncryptionKey?: string;
};

export type RouterSettingsPatch = Omit<RouterSettings, 'security'> & {
  security: SecuritySettingsPatch;
};

/**
 * Keep the stored encryption key unless the operator typed or generated a replacement.
 * An empty field and `[REDACTED]` are omitted so the stored key stays.
 */
export function securitySettingsPatch(
  security: SecuritySettings,
  encryptionKeyEdited: boolean
): SecuritySettingsPatch {
  const {
    clientSecretEncryptionKey,
    clientValidation,
    clientSignaturePathPrefix,
  } = security;
  const patch: SecuritySettingsPatch = {
    clientValidation,
    clientSignaturePathPrefix,
  };
  if (
    encryptionKeyEdited &&
    clientSecretEncryptionKey !== '' &&
    clientSecretEncryptionKey !== REDACTED_CONFIG_VALUE
  ) {
    patch.clientSecretEncryptionKey = clientSecretEncryptionKey;
  }
  return patch;
}

/** Standard base64 (not base64url). 32 bytes encode to 44 characters ending in `=`. */
export function encodeStandardBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function generateClientSecretEncryptionKey(
  randomBytes: (length: number) => Uint8Array = randomBytes32
): string {
  return encodeStandardBase64(randomBytes(32));
}

function randomBytes32(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

export type RouterRoute = {
  path: string;
  action: string;
  handler: string;
  middlewares?: string[];
  description?: string;
};

export type RouterModuleData = {
  routes: Record<string, RouterRoute>;
  middlewares?: Record<string, { path: string; handler: string }>;
  moduleUrl?: string;
};

export type RouterRoutesResponse = {
  [moduleName: string]: RouterModuleData;
};

export type SecurityClient = {
  _id: string;
  clientId: string;
  alias: string;
  notes?: string;
  domain?: string;
  platform: string;
  createdAt: string;
  updatedAt: string;
};

export type SecurityClientsResponse = {
  clients: SecurityClient[];
};

/** Plaintext secret from POST /router/security/client. Not stored on SecurityClient. */
export type CreatedSecurityClient = {
  clientId: string;
  clientSecret: string;
  platform: string;
  alias?: string;
  domain?: string;
  notes?: string;
};

export type CreateSecurityClientRequest = {
  platform: string;
  domain?: string;
  alias?: string;
  notes?: string;
};

export type UpdateSecurityClientRequest = {
  platform?: string;
  domain?: string;
  alias?: string;
  notes?: string;
};

export type EventRelay = {
  _id: string;
  name: string;
  notes?: string;
  active: boolean;
  busEvent: string;
  socketEvent: string;
  resourceType: string;
  resourceIdPath: string;
  permission: string;
  messageTemplate: unknown;
  createdAt: string;
  updatedAt: string;
};

export type EventRelaysResponse = {
  relays: EventRelay[];
  count: number;
};

export type EventRelayWriteRequest = {
  name: string;
  notes?: string;
  active?: boolean;
  busEvent: string;
  socketEvent: string;
  resourceType: string;
  resourceIdPath: string;
  permission: string;
  messageTemplate: unknown;
};

export type EventRelayPreviewInput = {
  messageTemplate: unknown;
  samplePayload: unknown;
};

export type EventRelayPreviewRemoteResult =
  | { status: 'ok'; payload: unknown }
  | { status: 'error'; message: string }
  | { status: 'unavailable' };
