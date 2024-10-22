import { LogLevel, LogsData } from '@/lib/models/logs-viewer';
import { format, isValid } from 'date-fns';

export const getFormattedMessage = (message: LogsData['message']) =>
  message.slice(0, message?.indexOf('{"'));

export const getFormattedMetadata = (message: LogsData['message']) => {
  const metadata = message?.slice(message?.indexOf('{"'));
  return JSON.parse(metadata);
};

export const getFormattedDate = (timestamp: LogsData['timestamp']) => {
  const date = new Date(Number(timestamp) / 1_000_000);
  if (!isValid(date)) {
    return 'Invalid date';
  }
  return format(date, 'MMM dd, yyyy, hh:mm:ss a');
};

export const logBadgeBackgroundColorMap: Record<LogLevel, string> = {
  critical: 'bg-purple-500 hover:bg-purple/80',
  error: 'bg-red-600 hover:bg-red/80',
  warning: 'bg-amber-400 hover:bg-amber/80',
  info: 'bg-teal-500 hover:bg-teal/80',
  debug: 'bg-cyan-500 hover:bg-cyan/80',
  unknown: 'bg-slate-500 hover:bg-slate/80',
};
