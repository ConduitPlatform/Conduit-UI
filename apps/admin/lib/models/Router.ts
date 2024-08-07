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
  proxy: boolean;
};

type RateLimitSettings = {
  maxRequests: number;
  resetInterval: number;
};

type SecuritySettings = {
  clientValidation: boolean;
};
