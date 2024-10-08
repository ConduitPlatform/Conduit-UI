export type ModulesTypes =
  | 'home'
  | 'authentication'
  | 'email'
  | 'storage'
  | 'forms'
  | 'functions'
  | 'pushNotifications'
  | 'sms'
  | 'chat'
  | 'payments'
  | 'database'
  | 'router'
  | 'settings'
  | 'core';

export interface LogsData {
  timestamp: string;
  message: string;
  level: string;
  instance?: string;
}

export interface LokiLogsData {
  stream: {
    instance: string;
    level: string;
    module: ModulesTypes;
  };
  values: [];
}
