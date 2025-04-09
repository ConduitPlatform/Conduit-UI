export type BaseAuthenticationSettings = {
  active: boolean;
  service: boolean;
  twoFa: {
    enabled: boolean;
    methods: {
      sms: boolean;
      authenticator: boolean;
    };
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
};
