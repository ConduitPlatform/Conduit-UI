import { knownModuleNames } from './constants';

export type ModuleNames = (typeof knownModuleNames)[number];

export interface LogsData {
  timestamp: string;
  message: string;
  level: string;
  instance?: string;
  module?: string[] | string;
}

export type LogsQueryParams = {
  modules: string[];
  levels: string[];
  startDate: number | undefined;
  endDate: number | undefined;
  limit: string | undefined;
  searchTerm?: string;
};

export type RefreshLogsFn = (data: LogsQueryParams) => Promise<LogsData[]>;

export type LogsFiltersState = {
  selectedLevels: string[];
  selectedLimit: string | undefined;
  selectedModules: string[];
  selectedTime: string | undefined;
  selectedStartDate: Date | undefined;
  selectedEndDate: Date | undefined;
  searchTerm: string;
};

export interface LokiLogsData {
  stream: {
    instance: string;
    level: string;
    module: string[];
  };
  values: [];
}

export interface Option {
  label: string | React.ReactNode;
  value: any;
}
