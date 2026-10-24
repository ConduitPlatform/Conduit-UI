import { Oauth2BaseConfig } from '@/lib/models/authentication/oauth2Base.config';

export type SlackConfig = {
  slack: Oauth2BaseConfig & {};
};
