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

export interface AuthTeam {
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  _id: string;
}

export interface AuthTeamUI {
  Name: string;
  'Registered At': string;
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
  keyId?: string;
  privateKey?: string;
  teamId?: string;
}

export type SocialNameTypes =
  | 'local'
  | 'bitbucket'
  | 'reddit'
  | 'linkedin'
  | 'twitter'
  | 'apple'
  | 'google'
  | 'facebook'
  | 'twitch'
  | 'microsoft'
  | 'slack'
  | 'github'
  | 'gitlab'
  | 'figma'
  | 'phoneAuthentication'
  | 'twoFa'
  | 'magic_link';

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

export enum CaptchaProvider {
  recaptcha = 'recaptcha',
  hcaptcha = 'hcaptcha',
}

export interface IAuthenticationConfig {
  facebook: SignInTypes;
  google: SignInTypes;
  local: SignInTypes;
  twitch: SignInTypes;
  github: SignInTypes;
  gitlab: SignInTypes;
  figma: SignInTypes;
  slack: SignInTypes;
  microsoft: SignInTypes;
  service: SignInTypes;
  magic_link: SignInTypes;
  twoFa: SignInTypes;
  apple: SignInTypes;
  reddit: SignInTypes;
  bitbucket: SignInTypes;
  linkedin: SignInTypes;
  twitter: SignInTypes;
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
    setCookie: boolean;
  };
  phoneAuthentication: { enabled: boolean };
  clients: { multipleUserSessions: boolean; multipleClientLogins: boolean };
  teams: {
    enabled: boolean;
    enableDefaultTeam: boolean;
    allowAddWithoutInvite: boolean;
    invites: {
      enabled: boolean;
      sendEmail: boolean;
      inviteUrl: string;
    };
  };
  active: boolean;
  captcha: {
    enabled: boolean;
    acceptablePlatform: {
      android: boolean;
      web: boolean;
    };
    provider: CaptchaProvider;
    routes: {
      login: boolean;
      register: boolean;
      oAuth2: boolean;
    };
    secretKey?: string;
  };
}
