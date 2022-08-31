//TODO placeholder fow now till we proxy the actual request
import { ModulesTypes } from '../../models/logs/LogsModels';
import { getRequestProm } from '../requestsConfig';

export const getMetricsQuery = (body: { module: ModulesTypes }) => {
  return getRequestProm('/query', {
    query: `conduit_admin_grpc_requests_total{job="${body.module}"}[1h]`,
  });
};
