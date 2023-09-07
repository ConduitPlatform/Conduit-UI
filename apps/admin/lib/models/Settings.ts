export type AdminSettings = {
  auth: AuthSettings;
  hostUrl: string;
  transports: TransportSettings;
  cors: CorsSettings;
}

type CorsSettings = {
  enabled: boolean;
  origin: string;
  methods: string;
  allowedHeaders: string;
  exposedHeaders: string;
  credentials: boolean;
  maxAge: number;
}

type AuthSettings = {
  tokenSecret: string;
  hashRounds: number;
  tokenExpirationTime: number;
}

type TransportSettings = {
  rest: boolean;
  graphql: boolean;
  sockets: boolean
}

export type CoreSettings = {
  env: string;
}