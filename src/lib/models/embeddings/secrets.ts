import type {
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
  model: string;
  allowedHosts: string[];
}): EmbeddingsProviderSettings {
  return {
    endpoint: args.endpoint,
    apiKeyConfigured: isSecretConfigured(args.apiKey),
    model: args.model,
    allowedHosts: args.allowedHosts,
  };
}

export function omitRedactedApiKey(
  provider: EmbeddingsProviderPatch
): EmbeddingsProviderPatch {
  if (!shouldSubmitApiKey(provider.apiKey)) {
    return {
      endpoint: provider.endpoint,
      model: provider.model,
      allowedHosts: provider.allowedHosts,
    };
  }
  return {
    endpoint: provider.endpoint,
    apiKey: provider.apiKey,
    model: provider.model,
    allowedHosts: provider.allowedHosts,
  };
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
