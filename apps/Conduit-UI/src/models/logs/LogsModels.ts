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
  levels: string[];
  instances: string[];
  modules: string[];
  query: [
    {
      stream: {
        instance: string;
        level: string;
        module: ModulesTypes;
      };
      values: [];
    }
  ];
}
