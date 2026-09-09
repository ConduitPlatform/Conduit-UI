import type {
  EmbeddingProviderModel,
  EmbeddingsProviderPatch,
  EmbeddingsProviderSettings,
  EmbeddingsSettingsPatch,
} from './settings.ts';

export const REDACTED_SECRET = '[REDACTED]';

export function isSecretConfigured(value: string | undefined): boolean {
  return typeof value === 'string' && value.length > 0;
}

export function isRedactedSecret(value: string | undefined): boolean {
  return value === REDACTED_SECRET;
}

export function formApiKeyValue(value: string | undefined): string {
  if (!value || isRedactedSecret(value)) return '';
  return value;
}

export function shouldSubmitApiKey(value: string | undefined): value is string {
  return isSecretConfigured(value) && !isRedactedSecret(value);
}

export function toClientSafeProvider(args: {
  endpoint: string;
  apiKey?: string;
  models: EmbeddingProviderModel[];
  defaultModel: string;
}): EmbeddingsProviderSettings {
  return {
    endpoint: args.endpoint,
    apiKeyConfigured: isSecretConfigured(args.apiKey),
    models: args.models,
    defaultModel: args.defaultModel,
  };
}

export function omitRedactedApiKey(
  provider: EmbeddingsProviderPatch
): EmbeddingsProviderPatch {
  const next: EmbeddingsProviderPatch = {
    endpoint: provider.endpoint,
    models: provider.models,
    defaultModel: provider.defaultModel ?? '',
  };
  if (shouldSubmitApiKey(provider.apiKey)) {
    next.apiKey = provider.apiKey;
  }
  return next;
}

export function sanitizeEmbeddingsSettingsPatch(
  data: EmbeddingsSettingsPatch
): EmbeddingsSettingsPatch {
  if (!data.providers) return data;
  const providers: Record<string, EmbeddingsProviderPatch> = {};
  for (const [name, provider] of Object.entries(data.providers)) {
    if (!provider) continue;
    providers[name] = omitRedactedApiKey(provider);
  }
  return { ...data, providers };
}
