export interface AuthUser {
  active: boolean;
  createdAt: string;
  email: string;
  isVerified: boolean;
  phoneNumber: string;
  updatedAt: string;
  _id: string;
}

export interface LocalTypes {
  enabled: boolean;
  sendVerificationEmail: boolean;
  verificationRequired: boolean;
  identifier: string;
  verification_redirect_uri: string;
  forgot_password_redirect_uri: string;
}

export interface GoogleTypes {
  enabled: boolean;
  accountLinking: boolean;
  clientId: string;
}

export interface FacebookTypes {
  enabled: boolean;
  accountLinking: boolean;
  clientId: string;
}

export interface KakaoTypes {
  enabled: boolean;
  clientId: string;
  redirect_uri: string;
}

export interface TwitchTypes {
  enabled: boolean;
  clientId: string;
  redirect_uri: string;
  clientSecret: string;
}

export type SocialNameTypes = 'local' | 'google' | 'facebook' | 'twitch' | 'kakao';
