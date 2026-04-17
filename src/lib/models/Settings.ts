export type AdminSettings = {
  auth: AuthSettings;
  hostUrl: string;
  transports: TransportSettings;
  cors: CorsSettings;
  /** MCP transport tuning (admin config); required by API when patching admin config */
  mcp: McpSettings;
};

type McpSettings = {
  pingInterval: number;
  sessionTimeout: number;
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

type AuthSettings = {
  tokenSecret: string;
  hashRounds: number;
  tokenExpirationTime: number;
};

type TransportSettings = {
  rest: boolean;
  graphql: boolean;
  sockets: boolean;
  mcp: boolean;
};

export type CoreSettings = {
  env: CoreEnv;
};

export type CoreEnv = 'production' | 'development' | 'test';
