import { Oauth2BaseConfig } from '@/lib/models/authentication/oauth2Base.config';

export type AppleOAuthClientConfig = {
  id: string;
  name?: string;
  clientId: string;
  privateKey: string;
  teamId: string;
  keyId: string;
  redirect_uri?: string;
};

export type AppleConfig = {
  apple: Oauth2BaseConfig & {
    privateKey: string;
    teamId: string;
    keyId: string;
    clients?: AppleOAuthClientConfig[];
  };
};
