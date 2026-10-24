export type ApiToken = {
  _id: string;
  name: string;
  tokenPrefix: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
};

export type CreateTokenResponse = {
  id: string;
  name: string;
  token: string; // Full token - shown only once
  expiresAt: string | null;
  createdAt: string;
};

export type ListTokensResponse = {
  tokens: ApiToken[];
};

export type CreateTokenRequest = {
  name: string;
  expiresInDays?: number;
};
