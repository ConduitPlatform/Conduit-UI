export type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  signed: boolean;
  domain: string;
  path: string;
  sameSite: string;
};

export type TokenConfig = {
  clients: {
    multipleUserSessions: boolean;
    multipleClientLogins: boolean;
  };
  accessTokens: CookieOptions & {
    jwtSecret: string;
    expiryPeriod: number;
    setCookie: boolean;
  };
  refreshTokens: CookieOptions & {
    enabled: boolean;
    expiryPeriod: number;
    setCookie: boolean;
  };
};
