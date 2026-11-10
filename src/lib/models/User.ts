import type { RealmMembershipType } from '@/lib/models/Realm';

export type User = {
  _id: string;
  email: string;
  username?: string;
  google?: AuthProviderBase;
  facebook?: AuthProviderBase;
  twitch?: AuthProviderBase;
  slack?: AuthProviderBase;
  figma?: AuthProviderBase;
  microsoft?: AuthProviderBase;
  github?: AuthProviderBase;
  apple?: AuthProviderBase;
  bitbucket?: AuthProviderBase;
  gitlab?: AuthProviderBase;
  linkedin?: AuthProviderBase;
  reddit?: AuthProviderBase;
  twitter?: AuthProviderBase;
  metamask?: {
    ethPublicAddress?: string;
    nonce?: string;
  };
  active: boolean;
  isVerified: boolean;
  hasTwoFA: boolean;
  twoFaMethod: string;
  phoneNumber?: string;
  isAnonymous?: boolean;
  /** Realm team id the user authenticates at; null/absent = global user. */
  homeRealm?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

/** One team the user belongs to, as `GET /authentication/users/:id/teams` returns it. */
export type UserTeamMembership = {
  _id: string;
  name: string;
  parentTeam?: string;
  isDefault?: boolean;
  realm?: { enabled?: boolean; slug?: string };
  roles: string[];
  membershipType?: RealmMembershipType;
};

interface AuthProviderBase {
  id: string;
  token: string;
  tokenExpires?: Date;
  data: { [key: string]: unknown };
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
