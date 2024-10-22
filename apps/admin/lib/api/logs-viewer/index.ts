import {
  LogLevel,
  LogsData,
  LokiLogsData,
  ModulesTypes,
} from '@/lib/models/logs-viewer';
import axios from 'axios';

//TODO: remove to .env or change docker/loki configuration files
const LOKI_BASE_URL = 'http://localhost:3100';

//TODO: add error handling
export const lokiInstance = axios.create({
  baseURL: LOKI_BASE_URL,
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const getLogsLevels = async (startDate?: number, endDate?: number) => {
  const res = await lokiInstance.get('/loki/api/v1/label/level/values', {
    params: {
      start: startDate,
      end: endDate,
    },
  });
  return res.data.data;
};

export const getLogsQueryRange = async (
  modules?: ModulesTypes | ModulesTypes[],
  levels?: string[],
  startDate?: number,
  endDate?: number,
  limit?: number
): Promise<LogsData[]> => {
  let query = '{';
  let normalizedModules: ModulesTypes[] = [];

  if (typeof modules === 'string') {
    // Single module passed
    normalizedModules = [modules];
  } else if (Array.isArray(modules)) {
    // Array of modules passed
    normalizedModules = modules;
  } else {
    // No modules provided, use all modules
    const allModules: ModulesTypes[] = [
      'home',
      'authentication',
      'authorization',
      'email',
      'storage',
      'forms',
      'functions',
      'pushNotifications',
      'sms',
      'chat',
      'payments',
      'database',
      'router',
      'settings',
      'core',
    ];
    normalizedModules = allModules;
  }

  if (normalizedModules.length) {
    const selectedModuleStr = normalizedModules.join('|');
    query += `module=~"${selectedModuleStr}"`;
  }

  if (levels?.length) {
    const selectedLevelsStr = levels.join('|');
    query += `, level=~"${selectedLevelsStr}"`;
  }

  query += '}';

  const res = await lokiInstance.get(`/loki/api/v1/query_range`, {
    params: {
      query: query,
      start: startDate,
      end: endDate,
      limit: limit,
    },
  });

  const logs: LogsData[] = [];

  if (res.data.data.result) {
    res.data.data.result.forEach((item: LokiLogsData) =>
      item?.values?.forEach(value => {
        logs.push({
          timestamp: value?.[0],
          message: value?.[1],
          level: item?.stream?.level as LogLevel,
          instance: item?.stream?.instance,
          module: item?.stream?.module,
        });
      })
    );
  }
  return logs;
};
