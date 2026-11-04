export type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  signed: boolean;
  domain: string;
  path: string;
  sameSite: string;
};

export type TokenMode = 'session' | 'jwt';

export type SigningConfig = {
  kid: string;
  publicKey: string;
  /** Reads return '[REDACTED]'. */
  privateKey: '[REDACTED]' | string;
  previousKid: string;
  previousPublicKey: string;
  previousRetiredAt: number;
};

export type TokenConfig = {
  clients: {
    multipleUserSessions: boolean;
    multipleClientLogins: boolean;
  };
  accessTokens: {
    /** `session` keeps access tokens server-side; `jwt` issues short-lived signed tokens. */
    mode?: TokenMode;
    /** Only used in session mode. */
    jwtSecret: string;
    /** ms. In jwt mode the backend only accepts 60000..300000. */
    expiryPeriod: number;
    setCookie: boolean;
    cookieOptions: CookieOptions;
    /** jwt mode: check the session registry on every request. */
    strictRevocation?: boolean;
    /** Internal: never rendered. */
    tokenVersion?: number;
    signing?: SigningConfig;
  };
  refreshTokens: {
    enabled: boolean;
    expiryPeriod: number;
    /** Whether refreshing extends the refresh token's lifetime. */
    extendable?: boolean;
    /** ms cap on a refresh token's total lifetime. */
    maxLifetime?: number;
    setCookie: boolean;
    cookieOptions: CookieOptions;
  };
};
