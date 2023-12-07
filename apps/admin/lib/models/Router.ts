export type RouterSettings = {
  hostUrl: string,
  captcha: captchaSettings,
  cors: corsSettings,
  transports: transportSettings,
  rateLimit: rateLimitSettings,
  security: securitySettings
}

type captchaSettings = {
  enabled: boolean,
  provider: string,
  secretKey: string
}

type corsSettings = {
  enabled: boolean,
  origin: string,
  methods: string,
  allowedHeaders: string,
  exposedHeaders: string,
  credentials: boolean,
  maxAge: number
}

type transportSettings = {
  rest: boolean,
  graphql: boolean,
  sockets: boolean,
  proxy: boolean
}

type rateLimitSettings = {
  maxRequests: number,
  resetInterval: number
}

type securitySettings = {
  clientValidation: boolean
}
