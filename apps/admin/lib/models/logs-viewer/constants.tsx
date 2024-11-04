export const limitOptions = [
  { label: '100', value: '100' },
  { label: '500', value: '500' },
  { label: '1000', value: '1000' },
  { label: '5000', value: '5000' },
];

export const timeOptions = [
  {
    label: 'Last 10 minutes',
    value: '10',
  },
  {
    label: 'Last 30 minutes',
    value: '30',
  },
  {
    label: 'Last 1 hour',
    value: '60',
  },
  {
    label: 'Last 24 hours',
    value: '1440', // 24 hours in minutes
  },
  {
    label: 'Today',
    value: '0',
  },
];

export const moduleNameByPath = {
  authentication: 'authentication',
  authorization: 'authorization',
  email: 'email',
  storage: 'storage',
  forms: 'forms',
  functions: 'functions',
  pushNotifications: 'push-notifications',
  sms: 'sms',
  chat: 'chat',
  payments: 'payments',
  database: 'database',
  router: 'router',
  settings: 'settings',
  core: '',
} as const;

export const knownModuleNames = Object.keys(moduleNameByPath);
