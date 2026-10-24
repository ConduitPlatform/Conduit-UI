import { AuthenticationConfig } from '@/lib/models/authentication';

export function isStrategyEnabled(
  config: AuthenticationConfig,
  key: string
): boolean {
  const entry = config[key as keyof AuthenticationConfig];
  if (typeof entry === 'object' && entry !== null && 'enabled' in entry) {
    return entry.enabled;
  }
  return false;
}
