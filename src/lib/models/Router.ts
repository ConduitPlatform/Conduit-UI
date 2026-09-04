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

type SecuritySettings = {
  clientValidation: boolean;
};

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
