import Facebook from '../assets/svgs/providers/facebook.svg';
import Local from '../assets/svgs/providers/local.svg';
import Google from '../assets/svgs/providers/google.svg';
import Twitch from '../assets/svgs/providers/twitch.svg';
import Figma from '../assets/svgs/providers/figma.svg';
import Github from '../assets/svgs/providers/github.svg';
import Slack from '../assets/svgs/providers/slack.svg';
import Microsoft from '../assets/svgs/providers/microsoft.svg';
import Phone from '../assets/svgs/providers/phone.svg';
import Refresh from '../assets/svgs/providers/refresh.svg';

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
      return Refresh;
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
    case 'phoneAuthentication':
      return 'Phone';
    case 'twoFa':
      return 'Two Factor Authentication';
    default:
      return 'Local';
  }
};
