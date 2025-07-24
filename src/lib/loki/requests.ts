'use server';
import { LogsData, LokiLogsData } from '@/lib/models/logs-viewer';
import { getLokiClient } from '@/lib/loki/index';
import { _getEnv } from '@/lib/logic/EnvManager';

export const getLogsLevels = async (
  startDate?: number,
  endDate?: number
): Promise<string[]> => {
  const res = await (
    await getLokiClient()
  ).get('/loki/api/v1/label/level/values', {
    params: {
      start: startDate,
      end: endDate,
    },
  });
  return res.data.data;
};

export const getModules = async (
  startDate?: number,
  endDate?: number
): Promise<string[]> => {
  const { namespace } = await _getEnv();
  let query;
  if (namespace && namespace.length > 0) {
    query = `{namespace="${namespace}}"`;
  }
  const res = await (
    await getLokiClient()
  ).get('/loki/api/v1/label/module/values', {
    params: {
      start: startDate,
      end: endDate,
      query: query,
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
  const queryParts = [];
  let normalizedModules: string[] = [];
  const { modules, levels, startDate, endDate, limit, searchTerm } = data;

  if (typeof modules === 'string') {
    normalizedModules = [modules];
  }

  if (Array.isArray(modules)) {
    normalizedModules = modules;
  }
  const { namespace } = await _getEnv();
  if (namespace && namespace.length > 0) {
    queryParts.push(`namespace="${namespace}"`);
  }

  if (normalizedModules.length) {
    const selectedModuleStr = normalizedModules.join('|');
    queryParts.push(`module=~"${selectedModuleStr}"`);
  }

  if (levels?.length) {
    const selectedLevelsStr = levels.join('|');
    queryParts.push(`level=~"${selectedLevelsStr}"`);
  }

  query += queryParts.join(',') + '}';

  if (searchTerm) {
    query += ` |~ "${searchTerm}"`;
  }
  const res = await (
    await getLokiClient()
  ).get(`/loki/api/v1/query_range`, {
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
