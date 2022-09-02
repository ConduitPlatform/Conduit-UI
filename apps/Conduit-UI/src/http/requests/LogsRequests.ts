import { getRequestLoki } from '../requestsConfig';
import { ModulesTypes } from '../../models/logs/LogsModels';

export const getLogsLevels = (body: { startDate?: number; endDate?: number }) =>
  getRequestLoki(`/loki/api/v1/label/level/values`, {
    start: body.startDate,
    end: body.endDate,
  });

export const getLogsQueryRange = (body: {
  module: ModulesTypes;
  levels?: string[];
  startDate?: number;
  endDate?: number;
  limit?: number;
}) => {
  let query = `{module="${body.module}"`;
  if (body.levels?.length) {
    const selectedLevelsStr = body.levels?.join('|');
    query = query.concat(', ', `level=~"${selectedLevelsStr}"`);
  }
  query = query.concat('', '}');

  return getRequestLoki(`/loki/api/v1/query_range`, {
    query: query,
    start: body.startDate,
    end: body.endDate,
    limit: body.limit,
  });
};
