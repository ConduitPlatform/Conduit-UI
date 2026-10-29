import type { AuthenticationConfig } from '@/lib/models/authentication';
import { getAxiosResponseStatus } from '@/lib/logic/api-error';

export const MISSING_AUTHENTICATION_CONFIG_ROUTE =
  'This Conduit core is not serving /config/authentication, so authentication settings cannot be saved.';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** `GET /config/authentication` → `{ config: AuthenticationConfig }`. */
export function authenticationConfigFromModuleResponse(
  payload: unknown
): AuthenticationConfig | undefined {
  if (!isRecord(payload) || !isRecord(payload.config)) return undefined;
  return payload.config as AuthenticationConfig;
}

/**
 * `GET /config` → `{ config: { modules: { authentication } } }`.
 * Used when the per-module config route is not registered.
 */
export function authenticationConfigFromMonoResponse(
  payload: unknown
): AuthenticationConfig | undefined {
  if (!isRecord(payload) || !isRecord(payload.config)) return undefined;
  const modules = payload.config.modules;
  if (!isRecord(modules) || !isRecord(modules.authentication)) return undefined;
  return modules.authentication as AuthenticationConfig;
}

/** Express HTML 404: the admin route was never registered. */
export function isUnregisteredConfigRoute(error: unknown): boolean {
  if (getAxiosResponseStatus(error) !== 404) return false;
  if (!error || typeof error !== 'object' || !('response' in error))
    return false;
  const data = (error as { response?: { data?: unknown } }).response?.data;
  return (
    typeof data === 'string' && /Cannot (GET|PATCH|PUT|POST|DELETE)/.test(data)
  );
}

export function explainMissingConfigRoute(error: unknown): never {
  if (isUnregisteredConfigRoute(error)) {
    throw new Error(MISSING_AUTHENTICATION_CONFIG_ROUTE);
  }
  throw error;
}
