import { isRedactedSecret, omitRedactedApiKey } from './secrets.ts';
import type {
  EmbeddingProviderModel,
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

export const NEW_CATALOGUE_MODEL: EmbeddingProviderModel = {
  name: '',
  dimensions: 1536,
};

export const EMPTY_PROVIDER_SETTINGS: EmbeddingsProviderSettings = {
  endpoint: '',
  apiKeyConfigured: false,
  models: [],
  defaultModel: '',
};

export type EmbeddingsSettingsFormValues = {
  defaultProvider: typeof OPENAI_COMPATIBLE_PROVIDER;
  endpoint: string;
  apiKey: string;
  apiKeyConfigured: boolean;
  models: EmbeddingProviderModel[];
  defaultModel: string;
  queue: {
    concurrency: number;
    attempts: number;
    maxBatchSize: number;
    drainTimeoutMs: number;
  };
  security: {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function trimName(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function parseDimensions(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return undefined;
}

function parseCatalogueEntry(
  value: unknown
): EmbeddingProviderModel | undefined {
  if (!isRecord(value)) return undefined;
  const name = trimName(value.name);
  const dimensions = parseDimensions(value.dimensions);
  if (!name || dimensions == null) return undefined;
  return { name, dimensions };
}

export function isCatalogueModelValid(model: {
  name?: string;
  dimensions?: number;
}): boolean {
  return (
    typeof model.name === 'string' &&
    model.name.trim().length > 0 &&
    typeof model.dimensions === 'number' &&
    Number.isInteger(model.dimensions) &&
    model.dimensions > 0
  );
}

export function uniqueCatalogueNames(
  models: Array<{ name?: string }>
): string[] {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const model of models) {
    const name = trimName(model.name);
    if (!name || seen.has(name)) continue;
    seen.add(name);
    names.push(name);
  }
  return names;
}

export function normalizeProviderCatalogue(raw: unknown): {
  models: EmbeddingProviderModel[];
  defaultModel: string;
} {
  const source = isRecord(raw) ? raw : {};
  const listed = Array.isArray(source.models)
    ? source.models
        .map(parseCatalogueEntry)
        .filter((model): model is EmbeddingProviderModel => model != null)
    : [];
  const seen = new Set<string>();
  const models: EmbeddingProviderModel[] = [];
  for (const model of listed) {
    if (seen.has(model.name)) continue;
    seen.add(model.name);
    models.push(model);
  }
  let migratedFromSingular = false;
  if (models.length === 0) {
    const name = trimName(source.model);
    const dimensions = parseDimensions(source.dimensions);
    if (name && dimensions != null) {
      models.push({ name, dimensions });
      migratedFromSingular = true;
    }
  }
  const names = new Set(models.map(model => model.name));
  const configuredDefault = trimName(source.defaultModel);
  const defaultModel = names.has(configuredDefault)
    ? configuredDefault
    : migratedFromSingular
      ? (models[0]?.name ?? '')
      : '';
  return { models, defaultModel };
}

export function resolveProviderDefaultModel(
  provider?: EmbeddingsProviderSettings
): string {
  if (!provider) return '';
  const selected = provider.defaultModel.trim();
  if (selected && provider.models.some(model => model.name === selected)) {
    return selected;
  }
  return provider.models.find(isCatalogueModelValid)?.name ?? '';
}

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

export function normalizeHost(value: string): string {
  return value.trim().toLowerCase().replace(/\.+$/, '');
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

export function openaiCompatibleProvider(
  settings: EmbeddingsSettings
): EmbeddingsProviderSettings {
  return (
    settings.providers[settings.defaultProvider] ??
    settings.providers[OPENAI_COMPATIBLE_PROVIDER] ??
    EMPTY_PROVIDER_SETTINGS
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
    models:
      provider.models.length > 0
        ? provider.models.map(model => ({ ...model }))
        : [{ ...NEW_CATALOGUE_MODEL }],
    defaultModel: provider.defaultModel,
    queue: { ...settings.queue },
    security: {
      maxMutationEventIds: settings.security.maxMutationEventIds,
      embedTimeoutMs: settings.security.embedTimeoutMs,
      maxEmbedInputBytes: settings.security.maxEmbedInputBytes,
      maxEmbedResponseBytes: settings.security.maxEmbedResponseBytes,
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
  const defaultModel = values.defaultModel.trim();
  const nextProvider = omitRedactedApiKey({
    endpoint: values.endpoint.trim(),
    models: values.models.map(model => ({
      name: model.name.trim(),
      dimensions: model.dimensions,
    })),
    defaultModel,
    apiKey,
  });
  const previousProviders: EmbeddingsSettingsPatch['providers'] = {};
  for (const [name, provider] of Object.entries(previous.providers)) {
    previousProviders[name] = {
      endpoint: provider.endpoint,
      models: provider.models,
      defaultModel: provider.defaultModel,
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
      sourceFieldAllowlist: normalizeSourceFieldAllowlist(
        previous.security.sourceFieldAllowlist
      ),
      maxMutationEventIds: values.security.maxMutationEventIds,
      embedTimeoutMs: values.security.embedTimeoutMs,
      maxEmbedInputBytes: values.security.maxEmbedInputBytes,
      maxEmbedResponseBytes: values.security.maxEmbedResponseBytes,
    },
  };
}
