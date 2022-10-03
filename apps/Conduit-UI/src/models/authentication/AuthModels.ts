export interface AuthUser {
  active: boolean;
  createdAt: string;
  email: string;
  isVerified: boolean;
  phoneNumber: string;
  updatedAt: string;
  hasTwoFA?: boolean;
  _id: string;
}

export interface AuthUserUI {
  Active: boolean;
  Email: string;
  'Registered At': string;
  Verified: boolean;
  _id: string;
}

export interface SignInTypes {
  enabled: boolean;
  OAuth2Flow?: boolean;
  accountLinking?: boolean;
  sendVerificationEmail?: boolean;
  verificationRequired?: boolean;
  clientId?: string;
  identifier?: string;
  verification_redirect_uri?: string;
  verification?: { required: boolean; send_email: boolean; redirect_uri: string };
  forgot_password_redirect_uri?: string;
  redirect_uri?: string;
  clientSecret?: string;
  methods?: { authenticator?: boolean; sms?: boolean };
  authenticator?: boolean;
  sms?: boolean;
}

export type SocialNameTypes =
  | 'local'
  | 'google'
  | 'facebook'
  | 'twitch'
  | 'microsoft'
  | 'slack'
  | 'github'
  | 'figma'
  | 'phoneAuthentication'
  | 'twoFa';

export interface ServiceAccount {
  active: boolean;
  createdAt: string;
  hashedToken: string;
  name: string;
  updatedAt: string;
  _id: string;
}

export interface SettingsStateTypes {
  active: boolean;
  generateRefreshToken: boolean;
  rateLimit: number;
  tokenInvalidationPeriod: number;
  refreshTokenInvalidationPeriod: number;
  jwtSecret: string;
  showSecret?: boolean;
}

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  signed: boolean;
  maxAge: number;
  domain: string;
  path: string;
  sameSite: string;
}

export interface IAuthenticationConfig {
  facebook: SignInTypes;
  google: SignInTypes;
  local: SignInTypes;
  twitch: SignInTypes;
  github: SignInTypes;
  figma: SignInTypes;
  slack: SignInTypes;
  microsoft: SignInTypes;
  service: SignInTypes;
  twoFa: SignInTypes;
  accessTokens: {
    cookieOptions: CookieOptions;
    jwtSecret: string;
    expiryPeriod: number;
    setCookie: boolean;
  };
  refreshTokens: {
    cookieOptions: CookieOptions;
    expiryPeriod: number;
    enabled: boolean;
    secure: boolean;
    setCookie: boolean;
  };
  phoneAuthentication: { enabled: boolean };
  clients: { multipleUserSessions: boolean; multipleClientLogins: boolean };
  active: boolean;
}
