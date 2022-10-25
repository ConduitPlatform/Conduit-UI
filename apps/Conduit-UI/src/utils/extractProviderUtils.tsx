import Facebook from '../assets/svgs/providers/facebook.svg';
import Local from '../assets/svgs/providers/local.svg';
import Google from '../assets/svgs/providers/google.svg';
import Twitch from '../assets/svgs/providers/twitch.svg';
import Figma from '../assets/svgs/providers/figma.svg';
import Github from '../assets/svgs/providers/github.svg';
import Slack from '../assets/svgs/providers/slack.svg';
import Microsoft from '../assets/svgs/providers/microsoft.svg';
import Phone from '../assets/svgs/providers/phone.svg';
import Lock from '../assets/svgs/providers/lock.svg';
import MagicLink from '../assets/svgs/providers/magicLink.svg';
import GitLab from '../assets/svgs/providers/gitlab.svg';
import Apple from '../assets/svgs/providers/apple.svg';
import BitBucket from '../assets/svgs/providers/bitbucket.svg';
import Reddit from '../assets/svgs/providers/reddit.svg';
import Twitter from '../assets/svgs/providers/twitter.svg';
import LinkedIn from '../assets/svgs/providers/linkedin.svg';

export const extractProviderIcon = (name: string) => {
  switch (name) {
    case 'google':
      return Google;
    case 'facebook':
      return Facebook;
    case 'local':
      return Local;
    case 'twitch':
      return Twitch;
    case 'figma':
      return Figma;
    case 'github':
      return Github;
    case 'slack':
      return Slack;
    case 'microsoft':
      return Microsoft;
    case 'phoneAuthentication':
      return Phone;
    case 'twoFa':
      return Lock;
    case 'magic_link':
      return MagicLink;
    case 'gitlab':
      return GitLab;
    case 'reddit':
      return Reddit;
    case 'apple':
      return Apple;
    case 'bitbucket':
      return BitBucket;
    case 'twitter':
      return Twitter;
    case 'linkedin':
      return LinkedIn;
    default:
      return Github;
  }
};

export const extractProviderName = (name: string) => {
  switch (name) {
    case 'google':
      return 'Google';
    case 'facebook':
      return 'facebook';
    case 'local':
      return 'Local';
    case 'twitch':
      return 'twitch';
    case 'figma':
      return 'Figma';
    case 'github':
      return 'GitHub';
    case 'slack':
      return 'slack';
    case 'microsoft':
      return 'Microsoft';
    case 'apple':
      return 'Apple';
    case 'twitter':
      return 'Twitter';
    case 'bitbucket':
      return 'BitBucket';
    case 'reddit':
      return 'Reddit';
    case 'phoneAuthentication':
      return 'Phone';
    case 'twoFa':
      return 'Two Factor Authentication';
    case 'magic_link':
      return 'Magic Link';
    case 'gitlab':
      return 'GitLab';
    case 'linkedin':
      return 'LinkedIn';
    default:
      return 'Local';
  }
};
