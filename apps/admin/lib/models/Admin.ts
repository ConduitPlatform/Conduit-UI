export type AdminSettings = {
  hostUrl: string,
  auth: AuthSettings,
  cors: CorsSettings,
  transports: TransportSettings
}

type CorsSettings = {
  enabled: boolean,
  origin: string,
  methods: string,
  allowedHeaders: string,
  exposedHeaders: string,
  credentials: boolean,
  maxAge: number
}

type AuthSettings = {
  tokenSecret: string,
  hashRounds: number,
  tokenExpirationTime: number
}

type TransportSettings = {
  rest: boolean,
  graphql: boolean,
  sockets: boolean,
  proxy: boolean
}