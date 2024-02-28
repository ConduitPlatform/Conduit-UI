import { Oauth2BaseConfig } from '@/lib/models/authentication/oauth2Base.config';

export type BitbucketConfig = {
  bitbucket: Oauth2BaseConfig & {},
};
