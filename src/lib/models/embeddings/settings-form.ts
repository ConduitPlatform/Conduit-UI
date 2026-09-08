import {
  formApiKeyValue,
  isRedactedSecret,
  isSecretConfigured,
  omitRedactedApiKey,
} from './secrets.ts';
import type {
  EmbeddingsProviderSettings,
  EmbeddingsSettings,
} from './settings.ts';
import { OPENAI_COMPATIBLE_PROVIDER } from './settings.ts';

export const SETTINGS_LIMITS = {
  concurrency: { min: 1, max: 64 },
  attempts: { min: 1, max: 32 },
  maxBatchSize: { min: 1, max: 10_000 },
  drainTimeoutMs: { min: 1_000, max: 86_400_000 },
  maxMutationEventIds: { min: 1, max: 10_000 },
  embedTimeoutMs: { min: 1_000, max: 300_000 },
  maxEmbedInputBytes: { min: 1, max: 10 * 1024 * 1024 },
  maxEmbedResponseBytes: { min: 1, max: 50 * 1024 * 1024 },
};

export type EmbeddingsSettingsFormValues = {
  defaultProvider: typeof OPENAI_COMPATIBLE_PROVIDER;
  endpoint: string;
  apiKey: string;
  apiKeyConfigured: boolean;
  model: string;
  allowedHosts: string[];
  queue: {
    concurrency: number;
    attempts: number;
    maxBatchSize: number;
    drainTimeoutMs: number;
  };
  security: {
    requireGrpcKey: boolean;
    sourceFieldAllowlist: string[];
    maxMutationEventIds: number;
    embedTimeoutMs: number;
    maxEmbedInputBytes: number;
    maxEmbedResponseBytes: number;
  };
};

export function parseHttpsEndpoint(value: string): URL | undefined {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:') return undefined;
    if (url.username || url.password) return undefined;
    if (!url.hostname) return undefined;
    return url;
  } catch {
    return undefined;
  }
}

export function normalizeHost(value: string): string {
  return value.trim().toLowerCase().replace(/\.+$/, '');
}

export function isValidHost(value: string): boolean {
  const host = normalizeHost(value);
  if (!host) return false;
  if (host.includes('/') || host.includes(' ') || host.includes(':')) {
    return false;
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/.test(
    host
  );
}

export function normalizeHosts(values: string[]): string[] {
  const seen = new Set<string>();
  const hosts: string[] = [];
  for (const value of values) {
    const host = normalizeHost(value);
    if (!host || seen.has(host)) continue;
    seen.add(host);
    hosts.push(host);
  }
  return hosts;
}

export function openaiCompatibleProvider(
  settings: EmbeddingsSettings
): EmbeddingsProviderSettings {
  return (
    settings.providers[settings.defaultProvider] ??
    settings.providers[OPENAI_COMPATIBLE_PROVIDER] ?? {
      endpoint: '',
      model: '',
      allowedHosts: [],
    }
  );
}

export function toSettingsFormValues(
  settings: EmbeddingsSettings
): EmbeddingsSettingsFormValues {
  const provider = openaiCompatibleProvider(settings);
  return {
    defaultProvider: OPENAI_COMPATIBLE_PROVIDER,
    endpoint: provider.endpoint,
    apiKey: formApiKeyValue(provider.apiKey),
    apiKeyConfigured: isSecretConfigured(provider.apiKey),
    model: provider.model,
    allowedHosts: normalizeHosts(provider.allowedHosts),
    queue: { ...settings.queue },
    security: {
      ...settings.security,
      sourceFieldAllowlist: settings.security.sourceFieldAllowlist
        .map(item => item.trim())
        .filter(item => item.length > 0),
    },
  };
}

export function toSettingsPatch(
  values: EmbeddingsSettingsFormValues,
  previous: EmbeddingsSettings,
  enabled: boolean
): Partial<EmbeddingsSettings> {
  const apiKey = isRedactedSecret(values.apiKey) ? '' : values.apiKey.trim();
  const providerName = OPENAI_COMPATIBLE_PROVIDER;
  const nextProvider = omitRedactedApiKey({
    endpoint: values.endpoint.trim(),
    model: values.model.trim(),
    allowedHosts: normalizeHosts(values.allowedHosts),
    apiKey,
  });
  return {
    enabled,
    defaultProvider: providerName,
    providers: {
      ...previous.providers,
      [providerName]: nextProvider,
    },
    queue: values.queue,
    security: {
      ...values.security,
      sourceFieldAllowlist: values.security.sourceFieldAllowlist
        .map(item => item.trim())
        .filter(item => item.length > 0),
    },
  };
}
