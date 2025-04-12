export type User = {
  _id: string;
  email: string;
  hashedPassword?: string;
  google?: AuthProviderBase;
  facebook?: AuthProviderBase;
  twitch?: AuthProviderBase;
  slack?: AuthProviderBase;
  figma?: AuthProviderBase;
  microsoft?: AuthProviderBase;
  github?: AuthProviderBase;
  active: boolean;
  isVerified: boolean;
  hasTwoFA: boolean;
  twoFaMethod: string;
  phoneNumber?: string;
  isAnonymous?: boolean;
  createdAt: Date;
  updatedAt: Date;
};
interface AuthProviderBase {
  id: string;
  token: string;
  tokenExpires?: Date;
  data: { [key: string]: any };
}
export type TeamUser = User & {
  role: string;
};

export type Admin = {
  createdAt: string;
  email: string;
  username: string;
  updatedAt: string;
  _id: string;
  isSuperAdmin: boolean;
  hasTwoFA: boolean;
};
