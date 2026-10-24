'use server';

import { getLokiAvailabilityCore } from '@/lib/observability/lokiAvailabilityCore';
import type { LokiAvailability } from '@/lib/observability/types';

/** Server action for Client Components (e.g. LogsDrawer). */
export async function getLokiAvailability(): Promise<LokiAvailability> {
  return getLokiAvailabilityCore();
}
