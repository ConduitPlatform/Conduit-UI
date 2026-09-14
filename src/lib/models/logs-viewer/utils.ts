import { format, isValid } from 'date-fns';

import type { LogsData, ModuleNames } from './index';

export const HTTP_METHODS = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
] as const;

const HTTP_SUMMARY_PATTERN = new RegExp(
  `^(${HTTP_METHODS.join('|')})\\s+(\\S+)\\s+([1-5]\\d{2})\\s+(\\d+(?:\\.\\d+)?(?:ns|µs|us|ms|s))$`
);

export type HttpMethod = (typeof HTTP_METHODS)[number];

export type LogSummary =
  | {
      type: 'http';
      method: HttpMethod;
      path: string;
      statusCode: number;
      duration: string;
    }
  | {
      type: 'text';
      text: string;
    };

export const parseLogSummary = (message: string): LogSummary => {
  const match = HTTP_SUMMARY_PATTERN.exec(message);
  if (!match) {
    return { type: 'text', text: message };
  }

  const [, method, path, statusCode, duration] = match;
  return {
    type: 'http',
    method: method as HttpMethod,
    path,
    statusCode: Number(statusCode),
    duration,
  };
};

export const getFormattedMessage = (message: LogsData['message']) => {
  const metadataStartIndex = message?.indexOf('{"');
  if (metadataStartIndex === undefined || metadataStartIndex === -1) {
    return message ?? '';
  }
  return message.slice(0, metadataStartIndex).trim();
};

export const getFormattedMetadata = (
  message: LogsData['message']
): Record<string, unknown> | string => {
  const metadataStartIndex = message?.indexOf('{"');
  if (metadataStartIndex === -1 || metadataStartIndex === undefined) {
    return 'No metadata';
  }

  const metadata = message.slice(metadataStartIndex);
  try {
    return JSON.parse(metadata) as Record<string, unknown>;
  } catch {
    return { raw: metadata };
  }
};

export const formatLogModule = (module: LogsData['module']): string => {
  if (!module) return 'unknown';
  if (Array.isArray(module)) {
    const label = module.filter(Boolean).join(', ');
    return label || 'unknown';
  }
  return module;
};

export const escapeLogqlString = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

export const getLogDate = (timestamp: LogsData['timestamp']): Date | null => {
  const date = new Date(Number(timestamp) / 1_000_000);
  return isValid(date) ? date : null;
};

export const formatLogDate = (date: Date | null) => {
  if (!date) {
    return 'Invalid date';
  }
  return format(date, 'MMM dd, yyyy, hh:mm:ss a');
};

export const getFormattedDate = (timestamp: LogsData['timestamp']) =>
  formatLogDate(getLogDate(timestamp));

export const checkUnknownModuleNames = (
  knownModuleNames: ModuleNames[],
  unknownModuleNames: string[]
): string[] => {
  if (unknownModuleNames.length === 0) {
    return knownModuleNames;
  }
  const newModules = unknownModuleNames.filter(
    module => !knownModuleNames.includes(module as ModuleNames)
  );
  return [...knownModuleNames, ...newModules];
};

export const generateMultiSelectOptions = (options?: string[]) => {
  if (!options || options.length === 0) {
    return [];
  }
  const modifiedOptions = options
    .map(option => ({
      label: option,
      value: option,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return modifiedOptions;
};

// transform values from select input in drawer into timestamps
export const getTimestamp = (value: string) => {
  const now = new Date();
  if (value === '0') {
    const startTime = new Date(now.setHours(0, 0, 0, 0));
    const endTime = new Date();
    return {
      startTime: startTime.valueOf() * 1_000_000,
      endTime: endTime.valueOf() * 1_000_000,
    };
  }

  const minutes = parseInt(value, 10);
  const endDate = now;
  const startDate = new Date(now.getTime() - minutes * 60000);
  return {
    startTime: startDate.valueOf() * 1_000_000,
    endTime: endDate.valueOf() * 1_000_000,
  };
};
