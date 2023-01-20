export type ModulesTypes =
  | 'home'
  | 'authentication'
  | 'authorization'
  | 'email'
  | 'storage'
  | 'forms'
  | 'pushNotifications'
  | 'sms'
  | 'chat'
  | 'payments'
  | 'database'
  | 'router'
  | 'settings'
  | 'core';

export interface LogsData {
  timestamp: number;
  message: string;
  level: string;
  instance: string;
}

export interface LokiLogsData {
  stream: {
    instance: string;
    level: string;
    module: ModulesTypes;
  };
  values: [];
}

export const moduleTitle = (type: ModulesTypes) => {
  switch (type) {
    case 'authentication':
      return 'Authentication';
    case 'authorization':
      return 'Authorization';
    case 'email':
      return 'Email';
    case 'storage':
      return 'Storage';
    case 'forms':
      return 'Forms';
    case 'pushNotifications':
      return 'Push Notifications';
    case 'sms':
      return 'SMS';
    case 'chat':
      return 'Chat';
    case 'payments':
      return 'Payments';
    case 'database':
      return 'Database';
    case 'router':
      return 'Router';
    case 'settings':
      return 'Settings';
    case 'core':
      return 'Core';
    default:
      return '';
  }
};
