/**
 * `shared`: one account per identifier across the deployment. `isolated`: identifiers are
 * unique per home realm, so the same email can exist once in each realm.
 */
export type RealmIdentityMode = 'shared' | 'isolated';

export type RealmsConfig = {
  enabled: boolean;
  cacheTtlMs: number;
  allowEmailDiscovery: boolean;
  /** Absent on backends that predate isolated identity mode (treated as `shared`). */
  identityMode?: RealmIdentityMode;
  /** Absent on backends that predate account linking (treated as `false`). */
  discoveryLogin?: boolean;
};

export type TeamsConfig = {
  teams: {
    enabled: boolean;
    enableDefaultTeam: boolean;
    allowAddWithoutInvite: boolean;
    allowRegistrationWithoutInvite: boolean;
    allowEmailMismatchForInvites: boolean;
    invites: {
      enabled: boolean;
      sendEmail: boolean;
      inviteUrl: string;
    };
    /** Absent on backends that predate authentication realms. */
    realms?: RealmsConfig;
  };
};
