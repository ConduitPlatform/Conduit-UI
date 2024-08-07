import { StrategyInterface } from '@/components/authentication/strategies/interface/Strategy.interface';
import { AppleConfigForm } from '@/components/authentication/strategies/settingsConfig/oAuth/appleConfig';
import { OauthDefaultConfigForm } from '@/components/authentication/strategies/settingsConfig/oAuth/oauthDefaultConfig';
import { MicrosoftConfigForm } from '@/components/authentication/strategies/settingsConfig/oAuth/microsoftConfig';
import { LocalConfigForm } from '@/components/authentication/strategies/settingsConfig/localConfig';
import { MagicLinkConfigForm } from '@/components/authentication/strategies/settingsConfig/magicLinkConfig';
import { TwoFaConfigForm } from '@/components/authentication/strategies/settingsConfig/twoFaConfig';

const strategyMap: {
  [key: string]: StrategyInterface;
} = {
  local: {
    name: 'Local',
    description: 'Supports register/login with email/password combinations.',
    supports: {
      login: true,
      register: true,
    },
    documentation: 'https://getconduit.dev/docs/modules/authentication/local',
    form: LocalConfigForm,
  },
  apple: {
    name: 'Apple',
    description: 'Supports register/login with Apple accounts.',
    supports: {
      login: true,
      register: true,
    },
    oauth: {
      redirect: true,
      native: false,
    },
    documentation:
      'https://getconduit.dev/docs/modules/authentication/tutorials/OAuth2/apple',
    form: AppleConfigForm,
  },
  google: {
    name: 'Google',
    description: 'Supports register/login with Google accounts.',
    supports: {
      login: true,
      register: true,
    },
    oauth: {
      redirect: true,
      native: true,
    },
    documentation: 'https://getconduit.dev/docs/modules/authentication/google',
    form: OauthDefaultConfigForm,
  },
  facebook: {
    name: 'Facebook',
    description: 'Supports register/login with Facebook accounts.',
    supports: {
      login: true,
      register: true,
    },
    oauth: {
      redirect: true,
      native: true,
    },
    documentation:
      'https://getconduit.dev/docs/modules/authentication/facebook',
    form: OauthDefaultConfigForm,
  },
  twitter: {
    name: 'Twitter/X',
    description: 'Supports register/login with Twitter/X accounts.',
    supports: {
      login: true,
      register: true,
    },
    oauth: {
      redirect: true,
      native: false,
    },
    documentation: 'https://getconduit.dev/docs/modules/authentication/twitter',
    form: OauthDefaultConfigForm,
  },
  github: {
    name: 'Github',
    description: 'Supports register/login with Github accounts.',
    supports: {
      login: true,
      register: true,
    },
    oauth: {
      redirect: true,
      native: false,
    },
    documentation: 'https://getconduit.dev/docs/modules/authentication/github',
    form: OauthDefaultConfigForm,
  },
  gitlab: {
    name: 'Gitlab',
    description: 'Supports register/login with Gitlab accounts.',
    supports: {
      login: true,
      register: true,
    },
    oauth: {
      redirect: true,
      native: false,
    },
    documentation: 'https://getconduit.dev/docs/modules/authentication/gitlab',
    form: OauthDefaultConfigForm,
  },
  linkedin: {
    name: 'LinkedIn',
    description: 'Supports register/login with LinkedIn accounts.',
    supports: {
      login: true,
      register: true,
    },
    oauth: {
      redirect: true,
      native: false,
    },
    documentation:
      'https://getconduit.dev/docs/modules/authentication/linkedin',
    form: OauthDefaultConfigForm,
  },
  microsoft: {
    name: 'Microsoft',
    description: 'Supports register/login with Microsoft accounts.',
    supports: {
      login: true,
      register: true,
    },
    oauth: {
      redirect: true,
      native: false,
    },
    documentation:
      'https://getconduit.dev/docs/modules/authentication/microsoft',
    form: MicrosoftConfigForm,
  },
  twitch: {
    name: 'Twitch',
    description: 'Supports register/login with Twitch accounts.',
    supports: {
      login: true,
      register: true,
    },
    oauth: {
      redirect: true,
      native: false,
    },
    documentation: 'https://getconduit.dev/docs/modules/authentication/twitch',
    form: OauthDefaultConfigForm,
  },
  slack: {
    name: 'Slack',
    description: 'Supports register/login with Slack accounts.',
    supports: {
      login: true,
      register: true,
    },
    oauth: {
      redirect: true,
      native: false,
    },
    documentation: 'https://getconduit.dev/docs/modules/authentication/slack',
    form: OauthDefaultConfigForm,
  },
  figma: {
    name: 'Figma',
    description: 'Supports register/login with Figma accounts.',
    supports: {
      login: true,
      register: true,
    },
    oauth: {
      redirect: true,
      native: false,
    },
    documentation: 'https://getconduit.dev/docs/modules/authentication/figma',
    form: OauthDefaultConfigForm,
  },
  magic_link: {
    name: 'Magic Link',
    description:
      'Supports login operations when email is available for a user, by sending a one-time link to their email.',
    supports: {
      login: true,
      register: false,
    },
    documentation:
      'https://getconduit.dev/docs/modules/authentication/magic-link',
    form: MagicLinkConfigForm,
  },
  reddit: {
    name: 'Reddit',
    description: 'Supports register/login with Reddit accounts.',
    supports: {
      login: true,
      register: true,
    },
    oauth: {
      redirect: true,
      native: false,
    },
    documentation: 'https://getconduit.dev/docs/modules/authentication/reddit',
    form: OauthDefaultConfigForm,
  },
  phoneAuthentication: {
    name: 'Phone',
    description: 'Supports register/login with phone numbers.',
    supports: {
      login: true,
      register: true,
    },
    documentation: 'https://getconduit.dev/docs/modules/authentication/phone',
  },
  biometricAuthentication: {
    name: 'Biometric',
    description:
      'Supports login with biometrics (Fingerprint, FaceID, TouchID or passkeys in general).',
    supports: {
      login: true,
      register: false,
    },
    documentation:
      'https://getconduit.dev/docs/modules/authentication/biometric',
  },
  twoFa: {
    name: 'Two Factor Authentication',
    description:
      'Adds the ability for users to enroll in two-factor authentication, with either phone or authenticator apps.',
    supports: {
      login: true,
      register: false,
    },
    documentation: 'https://getconduit.dev/docs/modules/authentication/two-fa',
    form: TwoFaConfigForm,
  },
};
export default strategyMap;
