export type ObservabilityServiceState =
  | 'not_configured'
  | 'unreachable'
  | 'ready';

export type PrometheusAvailability =
  | { state: 'not_configured' }
  | { state: 'unreachable' }
  | { state: 'ready' };

export type LokiAvailability = PrometheusAvailability;
