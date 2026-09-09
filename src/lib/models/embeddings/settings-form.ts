import { isRedactedSecret, omitRedactedApiKey } from './secrets.ts';
import type {
  EmbeddingsProviderSettings,
  EmbeddingsSettings,
  EmbeddingsSettingsPatch,
} from './settings.ts';
import { OPENAI_COMPATIBLE_PROVIDER } from './settings.ts';
import { normalizeSourceFieldAllowlist } from './source-fields.ts';

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

const BLOCKED_HOST_LABELS = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
  'metadata.google.com',
  '0.0.0.0',
  '::',
  '::1',
]);

function parseIpv4(host: string): [number, number, number, number] | undefined {
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!match) return undefined;
  const octets = match.slice(1).map(Number);
  if (octets.some(octet => octet > 255)) return undefined;
  return [octets[0], octets[1], octets[2], octets[3]];
}

function isPrivateOrLoopbackIpv4(octets: [number, number, number, number]) {
  const [a, b] = octets;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

export function isBlockedProviderHost(value: string): boolean {
  const host = normalizeHost(value);
  if (!host) return true;
  if (BLOCKED_HOST_LABELS.has(host)) return true;
  if (host.endsWith('.localhost') || host.endsWith('.local')) return true;
  if (host.endsWith('.internal') || host.endsWith('.arpa')) return true;
  if (host.includes(':')) return true;
  const ipv4 = parseIpv4(host);
  if (ipv4 && isPrivateOrLoopbackIpv4(ipv4)) return true;
  return false;
}

export function parseHttpsEndpoint(value: string): URL | undefined {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:') return undefined;
    if (url.username || url.password) return undefined;
    if (!url.hostname) return undefined;
    if (isBlockedProviderHost(url.hostname)) return undefined;
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
  if (isBlockedProviderHost(host)) return false;
  if (host.includes('/') || host.includes(' ') || host.includes(':')) {
    return false;
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    const ipv4 = parseIpv4(host);
    return ipv4 != null;
  }
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
      apiKeyConfigured: false,
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
    apiKey: '',
    apiKeyConfigured: provider.apiKeyConfigured,
    model: provider.model,
    allowedHosts: normalizeHosts(provider.allowedHosts),
    queue: { ...settings.queue },
    security: {
      ...settings.security,
      sourceFieldAllowlist: normalizeSourceFieldAllowlist(
        settings.security.sourceFieldAllowlist
      ),
    },
  };
}

export function toSettingsPatch(
  values: EmbeddingsSettingsFormValues,
  previous: EmbeddingsSettings,
  enabled: boolean
): EmbeddingsSettingsPatch {
  const apiKey = isRedactedSecret(values.apiKey) ? '' : values.apiKey.trim();
  const providerName = OPENAI_COMPATIBLE_PROVIDER;
  const nextProvider = omitRedactedApiKey({
    endpoint: values.endpoint.trim(),
    model: values.model.trim(),
    allowedHosts: normalizeHosts(values.allowedHosts),
    apiKey,
  });
  const previousProviders: EmbeddingsSettingsPatch['providers'] = {};
  for (const [name, provider] of Object.entries(previous.providers)) {
    previousProviders[name] = {
      endpoint: provider.endpoint,
      model: provider.model,
      allowedHosts: provider.allowedHosts,
    };
  }
  return {
    enabled,
    defaultProvider: providerName,
    providers: {
      ...previousProviders,
      [providerName]: nextProvider,
    },
    queue: values.queue,
    security: {
      ...values.security,
      sourceFieldAllowlist: normalizeSourceFieldAllowlist(
        values.security.sourceFieldAllowlist
      ),
    },
  };
}
