import { LogsData, ModuleNames } from '@/lib/models/logs-viewer';
import { format, isValid } from 'date-fns';

export const getFormattedMessage = (message: LogsData['message']) =>
  message.slice(0, message?.indexOf('{"'));

export const getFormattedMetadata = (message: LogsData['message']) => {
  const metadataStartIndex = message?.indexOf('{"');
  if (metadataStartIndex === -1 || metadataStartIndex === undefined) {
    return 'No metadata';
  }

  const metadata = message.slice(metadataStartIndex);
  return JSON.parse(metadata);
};

export const getFormattedDate = (timestamp: LogsData['timestamp']) => {
  const date = new Date(Number(timestamp) / 1_000_000);
  if (!isValid(date)) {
    return 'Invalid date';
  }
  return format(date, 'MMM dd, yyyy, hh:mm:ss a');
};

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
    // Special case for 'Today'
    const startTime = new Date(now.setHours(0, 0, 0, 0));
    const endTime = new Date();
    return {
      startDate: startTime.valueOf() * 1000000,
      endDate: endTime.valueOf() * 1000000,
    };
  } else {
    const minutes = parseInt(value, 10);
    const endDate = now;
    const startDate = new Date(now.getTime() - minutes * 60000);
    return {
      startTime: startDate.valueOf() * 1000000,
      endTime: endDate.valueOf() * 1000000,
    };
  }
};
