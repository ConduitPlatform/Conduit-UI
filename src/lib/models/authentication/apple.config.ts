import { Oauth2BaseConfig } from '@/lib/models/authentication/oauth2Base.config';

export type AppleExtraClient = {
  id: string;
  clientId: string;
  name?: string;
  redirect_uri?: string;
  privateKey?: string;
  teamId?: string;
  keyId?: string;
};

export type AppleConfig = {
  apple: Oauth2BaseConfig & {
    privateKey: string;
    teamId: string;
    keyId: string;
    clients?: AppleExtraClient[];
  };
};
