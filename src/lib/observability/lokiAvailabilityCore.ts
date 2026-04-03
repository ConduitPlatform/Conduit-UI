'use server';

import axios from 'axios';
import { withTtlCache } from '@/lib/cache/ttlMemoryCache';
import { getCurrentEnvironment } from '@/lib/logic/EnvManager';
import type { LokiAvailability } from '@/lib/observability/types';

export type { LokiAvailability } from '@/lib/observability/types';

async function lokiReadyProbe(baseUrl: string): Promise<boolean> {
  const root = baseUrl.replace(/\/$/, '');
  try {
    const res = await axios.get(`${root}/ready`, {
      timeout: 8000,
      validateStatus: s => s >= 200 && s < 300,
    });
    return res.status >= 200 && res.status < 300;
  } catch {
    return false;
  }
}

/**
 * Cached Loki readiness (60s), keyed by env name and URL.
 * Use from Server Components and server modules; use `getLokiAvailability` from
 * `lokiAvailability.actions` inside Client Components.
 */
export async function getLokiAvailabilityCore(): Promise<LokiAvailability> {
  const env = await getCurrentEnvironment();
  const raw = env.lokiUrl?.trim();
  if (!raw) {
    return { state: 'not_configured' };
  }
  const baseUrl = raw.replace(/\/$/, '');

  const cacheKey = ['loki-availability-v1', env.name, baseUrl].join(':');

  return withTtlCache(cacheKey, 60, async () => {
    const ok = await lokiReadyProbe(baseUrl);
    return ok
      ? ({ state: 'ready' } as const)
      : ({ state: 'unreachable' } as const);
  });
}
