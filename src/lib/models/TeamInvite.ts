export type TeamInvite = {
  _id: string;
  tokenType: string;
  token: string;
  data: {
    teamId: string;
    role: string;
    email?: string;
    userData?: Record<string, unknown>;
  };
  user?: string;
  createdAt: string;
  updatedAt: string;
};
