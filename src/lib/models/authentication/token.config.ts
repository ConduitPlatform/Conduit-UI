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
  accessTokens: {
    jwtSecret: string;
    expiryPeriod: number;
    setCookie: boolean;
    cookieOptions: CookieOptions;
  };
  refreshTokens: {
    enabled: boolean;
    expiryPeriod: number;
    setCookie: boolean;
    cookieOptions: CookieOptions;
  };
};
