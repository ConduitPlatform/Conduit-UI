//TODO placeholder fow now till we proxy the actual request
import { ModulesTypes } from '../../models/logs/LogsModels';
import { getRequestProm, NAMESPACE } from '../requestsConfig';

const namespace = (noDelimeter = false) => {
  if (NAMESPACE && NAMESPACE.length > 0) {
    return `${noDelimeter ? "" : ","}namespace="${NAMESPACE}"`;
  }
  return '';
};

export const getMetricsQuery = (body: {
  module: ModulesTypes;
  startDate?: number;
  endDate?: number;
  step?: string;
  //TODO define initial states of start,end,step
}) => {
  return getRequestProm('/query_range', {
    query: `sum(increase(conduit_admin_grpc_requests_total{module_name="${
      body.module
    }"${namespace()}}[10m]))`,
    start: body.startDate,
    end: body.endDate,
    step: body.step,
  });
};

//This is an instant vector as we dont need a time series
export const getModuleHealth = (body: {
  module: ModulesTypes;
  //TODO define initial states of start,end,step
}) => {
  return getRequestProm('/query', {
    query: `conduit_module_health_state{module_name="${body.module}"${namespace()}}[1m]`,
  });
};

export const getModuleLatency = (body: {
  module: ModulesTypes;
  //TODO define initial states of start,end,step
}) => {
  return getRequestProm('/query', {
    query:
      body.module !== 'home'
        ? `avg_over_time(conduit_grpc_request_latency_seconds{module_name="${
            body.module
          }"${namespace()}}[10m])`
        : `sum(avg_over_time(conduit_grpc_request_latency_seconds{${namespace(true)}}[5m]))`,
  });
};

export const getGenericMetricCounterQuery = (expression: string) =>
  getRequestProm('/query', { query: expression });

export const getGenericMetricQueryRange = (body: {
  expression: string;
  startDate?: number;
  endDate?: number;
  step?: string;
}) =>
  getRequestProm('/query_range', {
    query: body.expression,
    start: body.startDate,
    end: body.endDate,
    step: body.step,
  });
