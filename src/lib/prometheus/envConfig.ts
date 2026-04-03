import 'server-only';

import type { Environment } from '@/lib/logic/EnvManager';
import type { PrometheusConfig } from '@/lib/prometheus/client';

/** Returns null when PROMETHEUS_URL is not set (no implicit localhost). */
export function prometheusConfigFromEnvironment(
  envDetails: Environment
): PrometheusConfig | null {
  const promUrl = envDetails.promUrl?.trim();
  if (!promUrl) {
    return null;
  }
  const baseUrl = promUrl.replace(/\/$/, '');
  const useAzureAuth = envDetails.azAuth === 'true';
  return {
    baseUrl,
    username: envDetails.promUsername,
    password: envDetails.promPassword,
    useAzureAuth,
    azureTenantId: envDetails.azTenantId,
    azureClientId: envDetails.azClientId,
    azureClientSecret: envDetails.azClientSecret,
  };
}
