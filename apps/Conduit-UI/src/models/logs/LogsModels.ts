export type ModulesTypes =
  | 'authentication'
  | 'email'
  | 'storage'
  | 'forms'
  | 'pushNotifications'
  | 'sms'
  | 'chat'
  | 'payments'
  | 'database'
  | 'router'
  | 'settings';

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
    default:
      return '';
  }
};
