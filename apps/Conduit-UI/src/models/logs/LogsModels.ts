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
  | 'core';

export interface LogsData {
  stream: {
    instance: string;
    level: string;
    module: ModulesTypes;
  };
  values: [];
}
