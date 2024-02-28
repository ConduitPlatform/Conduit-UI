import { Oauth2BaseConfig } from '@/lib/models/authentication/oauth2Base.config';

export type AppleConfig = {
  apple: Oauth2BaseConfig & {
    privateKey: string;
    teamId: string;
    keyId: string;
  },
};
