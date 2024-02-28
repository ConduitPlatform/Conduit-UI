import { Strategy } from '@/components/authentication/strategies/Strategy';

const strategyMap: {
  [key: string]: Strategy
} = {
  'local': {
    name: 'Local',
    description: 'Supports register/login with email/password combinations.',
    supports: {
      login: true,
      register: true,
    },
    documentation: 'https://getconduit.dev/docs/modules/authentication/local',
  },
  'google': {
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
  },
  'facebook': {
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
    documentation: 'https://getconduit.dev/docs/modules/authentication/facebook',
  },
  'twitter': {
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
  },
  'github': {
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
  },
  'gitlab': {
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
  },
  'linkedin': {
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
    documentation: 'https://getconduit.dev/docs/modules/authentication/linkedin',

  },
  'apple': {
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
    documentation: 'https://getconduit.dev/docs/modules/authentication/tutorials/OAuth2/apple',
  },

  'microsoft': {
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
    documentation: 'https://getconduit.dev/docs/modules/authentication/microsoft',
  },
  'twitch': {
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
  },
  'slack': {
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
  },
  'figma': {
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
  },
  'magic_link': {
    name: 'Magic Link',
    description: 'Supports login operations when email is available for a user, by sending a one-time link to their email.',
    supports: {
      login: true,
      register: false,
    },
    documentation: 'https://getconduit.dev/docs/modules/authentication/magic-link',
  },
  'reddit': {
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
  },
  'phoneAuthentication': {
    name: 'Phone',
    description: 'Supports register/login with phone numbers.',
    supports: {
      login: true,
      register: true,
    },
    documentation: 'https://getconduit.dev/docs/modules/authentication/phone',
  },
  'biometricAuthentication': {
    name: 'Biometric',
    description: 'Supports login with biometrics (Fingerprint, FaceID, TouchID or passkeys in general).',
    supports: {
      login: true,
      register: false,
    },
    documentation: 'https://getconduit.dev/docs/modules/authentication/biometric',
  },
  'twoFa': {
    name: 'Two Factor Authentication',
    description: 'Adds the ability for users to enroll in two-factor authentication, with either phone or authenticator apps.',
    supports: {
      login: true,
      register: false,
    },
    documentation: 'https://getconduit.dev/docs/modules/authentication/two-fa',
  },
};
export default strategyMap;
