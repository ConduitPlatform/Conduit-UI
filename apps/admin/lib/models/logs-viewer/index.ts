import { knownModuleNames } from './constants';

export type ModuleNames = (typeof knownModuleNames)[number];

export interface LogsData {
  timestamp: string;
  message: string;
  level: string;
  instance?: string;
  module?: string[];
}

export interface LokiLogsData {
  stream: {
    instance: string;
    level: string;
    module: string[];
  };
  values: [];
}

export interface Option {
  label: string;
  value: string;
}
