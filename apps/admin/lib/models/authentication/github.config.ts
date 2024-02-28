import { Oauth2BaseConfig } from '@/lib/models/authentication/oauth2Base.config';

export type GithubConfig = {
  github: Oauth2BaseConfig & {},
};
