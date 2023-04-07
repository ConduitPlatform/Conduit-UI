export interface IRouterConfig {
  hostUrl: string;
  transports: { rest: boolean; graphql: boolean; sockets: boolean };
  security: { clientValidation: boolean };
  captcha: { provider: CaptchaProvider; enabled: boolean; secretKey: string };
  cors: {
    enabled: boolean;
    origin: string;
    methods: string;
    allowedHeaders: string;
    exposedHeaders: string;
    credentials: boolean;
    maxAge: number;
  };
}

export enum CaptchaProvider {
  recaptcha = 'recaptcha',
  hcaptcha = 'hcaptcha',
  turnstile = 'turnstile',
}
