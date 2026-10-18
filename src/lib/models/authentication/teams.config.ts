export type RealmsConfig = {
  enabled: boolean;
  cacheTtlMs: number;
  allowEmailDiscovery: boolean;
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
