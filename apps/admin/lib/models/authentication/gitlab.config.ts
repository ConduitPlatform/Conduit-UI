import { Oauth2BaseConfig } from '@/lib/models/authentication/oauth2Base.config';

export type GitlabConfig = {
  gitlab: Oauth2BaseConfig & {},
};
