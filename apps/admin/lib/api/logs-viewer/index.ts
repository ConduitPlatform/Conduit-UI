'use server';
import { LogsData, LokiLogsData } from '@/lib/models/logs-viewer';
import axios from 'axios';

//TODO: remove to .env or change docker/loki configuration files
const LOKI_BASE_URL = 'http://localhost:3100';

const lokiInstance = axios.create({
  baseURL: LOKI_BASE_URL,
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

lokiInstance.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    if (error.response) {
      // Server responded with a status code outside the range of 2xx
      console.error({
        message: error.message,
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config.url,
        method: error.config.method,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // Request was made but no response was received
      console.error({
        message: error.message,
        url: error.config.url,
        method: error.config.method,
        request: error.request,
      });
    } else {
      // Something happened in setting up the request
      console.error({
        message: error.message,
        config: error.config,
      });
    }
    return Promise.reject(error);
  }
);

export const getLogsLevels = async (
  startDate?: number,
  endDate?: number
): Promise<string[]> => {
  const res = await lokiInstance.get('/loki/api/v1/label/level/values', {
    params: {
      start: startDate,
      end: endDate,
    },
  });
  return res.data.data;
};

export const getLogsQueryRange = async (data: {
  modules?: string[] | string;
  searchTerm?: string;
  levels?: string[];
  startDate?: number;
  endDate?: number;
  limit?: string;
}): Promise<LogsData[]> => {
  let query = '{';
  let normalizedModules: string[] = [];
  const { modules, levels, startDate, endDate, limit, searchTerm } = data;

  if (typeof modules === 'string') {
    normalizedModules = [modules];
  }

  if (Array.isArray(modules)) {
    normalizedModules = modules;
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

  if (searchTerm) {
    query += ` |~ "${searchTerm}"`;
  }

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
          level: item?.stream?.level,
          instance: item?.stream?.instance,
          module: item?.stream?.module,
        });
      })
    );
    logs.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }
  return logs;
};
