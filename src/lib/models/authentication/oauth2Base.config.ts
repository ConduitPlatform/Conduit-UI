export type Oauth2BaseConfig = {
  enabled: boolean;
  clientId: string;
  clientSecret?: string;
  redirect_uri?: string;
  accountLinking?: boolean;
};
