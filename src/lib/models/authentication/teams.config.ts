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
  };
};
