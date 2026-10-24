import { Oauth2BaseConfig } from '@/lib/models/authentication/oauth2Base.config';

export type MicrosoftConfig = {
  microsoft: Oauth2BaseConfig & {
    tenantId: string;
  };
};
