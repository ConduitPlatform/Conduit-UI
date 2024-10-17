import { LogsData, LokiLogsData, ModulesTypes } from '@/lib/models/logs-viewer';
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
  module?: ModulesTypes,
  levels?: string[],
  startDate?: number,
  endDate?: number,
  limit?: number
) => {
  let query = '';
  if (module) {
    query = `{module="${module}"`;
  }

  if (levels?.length) {
    const selectedLevelsStr = levels?.join('|');
    query = query.concat(', ', `level=~"${selectedLevelsStr}"`);
  }
  query = query.concat('', '}');

  const res = await lokiInstance.get(`/loki/api/v1/query_range`, {
    params: {
      query: query,
      start: startDate,
      end: endDate,
      limit: limit,
    },
  });

  const logs: LogsData[] = [];
  res.data.data.result.forEach((item: LokiLogsData) =>
    item?.values?.forEach(value => {
      logs.push({
        timestamp: value?.[0],
        message: value?.[1],
        level: item?.stream?.level,
        instance: item?.stream?.instance,
      });
    })
  );

  return logs;
};
