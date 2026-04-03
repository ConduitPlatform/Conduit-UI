'use server';

import { withTtlCache } from '@/lib/cache/ttlMemoryCache';
import { getCurrentEnvironment } from '@/lib/logic/EnvManager';
import { prometheusConfigFromEnvironment } from '@/lib/prometheus/envConfig';
import {
  prometheusHealthCheck,
  type PrometheusConfig,
} from '@/lib/prometheus/client';
import type { PrometheusAvailability } from '@/lib/observability/types';

export type { PrometheusAvailability } from '@/lib/observability/types';

type PrometheusSnapshot = {
  envName: string;
  baseUrl: string;
  useAzureAuth: boolean;
  username: string;
  password: string;
  azureTenantId: string;
  azureClientId: string;
  azureClientSecret: string;
};

function snapshotToConfig(snap: PrometheusSnapshot): PrometheusConfig {
  return {
    baseUrl: snap.baseUrl,
    username: snap.username || undefined,
    password: snap.password || undefined,
    useAzureAuth: snap.useAzureAuth,
    azureTenantId: snap.azureTenantId || undefined,
    azureClientId: snap.azureClientId || undefined,
    azureClientSecret: snap.azureClientSecret || undefined,
  };
}

function cacheKeyForSnapshot(snap: PrometheusSnapshot): string {
  return [
    'prometheus-availability-v1',
    snap.envName,
    snap.baseUrl,
    String(snap.useAzureAuth),
    snap.username,
    snap.password,
    snap.azureTenantId,
    snap.azureClientId,
    snap.azureClientSecret,
  ].join(':');
}

/**
 * Cached reachability result (60s) keyed by env + URL + auth, so parallel
 * metric calls and server actions do not each run a separate probe.
 */
export async function getPrometheusAvailability(): Promise<PrometheusAvailability> {
  const env = await getCurrentEnvironment();
  const config = prometheusConfigFromEnvironment(env);
  if (!config) {
    return { state: 'not_configured' };
  }

  const snap: PrometheusSnapshot = {
    envName: env.name,
    baseUrl: config.baseUrl,
    useAzureAuth: config.useAzureAuth ?? false,
    username: config.username ?? '',
    password: config.password ?? '',
    azureTenantId: config.azureTenantId ?? '',
    azureClientId: config.azureClientId ?? '',
    azureClientSecret: config.azureClientSecret ?? '',
  };

  return withTtlCache(cacheKeyForSnapshot(snap), 60, async () => {
    const ok = await prometheusHealthCheck(snapshotToConfig(snap));
    return ok
      ? ({ state: 'ready' } as const)
      : ({ state: 'unreachable' } as const);
  });
}
