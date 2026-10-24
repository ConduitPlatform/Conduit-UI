import 'server-only';

import type { LokiAvailability, PrometheusAvailability } from './types';

export function isPrometheusReady(
  availability: PrometheusAvailability
): availability is { state: 'ready' } {
  return availability.state === 'ready';
}

export function isLokiReady(
  availability: LokiAvailability
): availability is { state: 'ready' } {
  return availability.state === 'ready';
}
