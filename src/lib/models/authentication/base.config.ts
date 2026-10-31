export const DEFAULT_TWO_FA_ISSUER = 'conduit';

export type EmailRestrictions = {
  enabled: boolean;
  blockDisposableEmails: boolean;
  blockPlusAddressing: boolean;
  blockedAddresses: string[];
  blockedDomains: string[];
  allowedAddresses: string[];
  allowedDomains: string[];
};

export type BaseAuthenticationSettings = {
  active: boolean;
  twoFa: {
    enabled: boolean;
    methods: {
      sms: boolean;
      authenticator: boolean;
    };
    // Absent on backends that predate these settings. The form fills the defaults.
    issuer?: string;
    allowedIssuers?: string[];
    backUpCodes: {
      enabled: boolean;
    };
  };
  phoneAuthentication: {
    enabled: boolean;
  };
  biometricAuthentication: {
    enabled: boolean;
  };
  captcha: {
    enabled: boolean;
    routes: {
      login: boolean;
      register: boolean;
      oAuth2: boolean;
    };
    acceptablePlatform: {
      android: boolean;
      web: boolean;
    };
  };
  redirectUris: {
    allowAny: boolean;
    whitelistedUris: string[];
  };
  anonymousUsers: {
    enabled: boolean;
  };
  emailRestrictions?: EmailRestrictions;
};
