import { BaseAuthenticationSettings } from '@/lib/models/authentication/base.config';
import { LocalConfig } from '@/lib/models/authentication/local.config';
import { RedditConfig } from '@/lib/models/authentication/reddit.config';
import { TwitterConfig } from '@/lib/models/authentication/twitter.config';
import { SlackConfig } from './slack.config';
import { TwitchConfig } from '@/lib/models/authentication/twitch.config';
import { TeamsConfig } from '@/lib/models/authentication/teams.config';
import { TokenConfig } from '@/lib/models/authentication/token.config';
import { AppleConfig } from '@/lib/models/authentication/apple.config';
import { BitbucketConfig } from '@/lib/models/authentication/bitbucket.config';
import { FacebookConfig } from '@/lib/models/authentication/facebook.config';
import { FigmaConfig } from '@/lib/models/authentication/figma.config';
import { GithubConfig } from '@/lib/models/authentication/github.config';
import { GitlabConfig } from '@/lib/models/authentication/gitlab.config';
import { GoogleConfig } from '@/lib/models/authentication/google.config';
import { LinkedinConfig } from '@/lib/models/authentication/linkedIn.config';
import { MagicLinkConfig } from '@/lib/models/authentication/magicLink.config';
import { MicrosoftConfig } from '@/lib/models/authentication/microsoft.config';

export type AuthenticationConfig =
  BaseAuthenticationSettings
  & TokenConfig
  & TeamsConfig
  & LocalConfig
  & AppleConfig
  & BitbucketConfig
  & FacebookConfig
  & FigmaConfig
  & GithubConfig
  & GitlabConfig
  & GoogleConfig
  & LinkedinConfig
  & MagicLinkConfig
  & MicrosoftConfig
  & RedditConfig
  & SlackConfig
  & TwitchConfig
  & TwitterConfig;

export type AuthenticationConfigResponse = {
  config: AuthenticationConfig;
}
