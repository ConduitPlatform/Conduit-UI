import type { RealmMembershipType } from '@/lib/models/Realm';

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
  /** Realm team id the user authenticates at; null/absent = global user. */
  homeRealm?: string | null;
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
  /** Present when the team is inside a realm. */
  membershipType?: RealmMembershipType;
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
