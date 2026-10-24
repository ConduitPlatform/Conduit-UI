import type {
  EmbeddingConfig,
  EmbeddingConfigInput,
  VectorSimilarity,
} from './config.ts';
import type {
  EmbeddingProviderModel,
  EmbeddingsProviderSettings,
  EmbeddingsSettings,
} from './settings.ts';
import { isCatalogueModelValid } from './settings-form.ts';

export type ConfigProviderChoice = {
  key: string;
  models: EmbeddingProviderModel[];
};

export const CATALOGUE_UNAVAILABLE_MESSAGE =
  'Provider catalogue could not be verified. Retry.';

export const PROVIDER_NOT_CONFIGURED_MESSAGE =
  'This provider is not configured.';

export const MODEL_NOT_IN_CATALOGUE_MESSAGE =
  'This model is not in the selected provider catalogue.';

export const DIMENSIONS_POSITIVE_INTEGER_MESSAGE =
  'Dimensions must be a positive integer';

export function catalogueDimensionsMismatchMessage(
  requested: number,
  catalogue: number,
  modelName: string
): string {
  return `Requested dimensions ${requested} do not match catalogue dimensions ${catalogue} for model '${modelName}'`;
}

export const MODEL_ABSENT_DETAIL =
  'This model is not in the provider catalogue.';

export const MODEL_ABSENT_EDIT_DETAIL = `${MODEL_ABSENT_DETAIL} Add it in Settings before changing this config.`;

export const SETTINGS_CTA_LABEL = 'Open settings';

export const SETTINGS_HREF = '/embeddings/settings';

export const DIMENSIONS_HELP =
  'Must match the model and the index. Changing it requires a rebuild and backfill.';

export function similarityHelp(value: VectorSimilarity): string {
  switch (value) {
    case 'cosine':
      return 'Recommended for text.';
    case 'euclidean':
      return 'Straight-line vector distance.';
    case 'dotProduct':
      return 'Direction and magnitude.';
    default: {
      const exhaustive: never = value;
      return exhaustive;
    }
  }
}

function isProviderSettings(
  value: EmbeddingsProviderSettings | undefined
): value is EmbeddingsProviderSettings {
  return value != null && Array.isArray(value.models);
}

export function listConfiguredProviders(
  settings?: EmbeddingsSettings | null
): ConfigProviderChoice[] {
  if (!settings) return [];
  const choices: ConfigProviderChoice[] = [];
  for (const [key, provider] of Object.entries(settings.providers)) {
    if (!isProviderSettings(provider)) continue;
    choices.push({
      key,
      models: provider.models.filter(isCatalogueModelValid),
    });
  }
  return choices.sort((left, right) => left.key.localeCompare(right.key));
}

export function findCatalogueModel(
  providers: readonly ConfigProviderChoice[],
  providerKey: string,
  modelName: string
): EmbeddingProviderModel | undefined {
  const provider = providers.find(item => item.key === providerKey);
  if (!provider) return undefined;
  return provider.models.find(model => model.name === modelName);
}

export function isConfigModelInCatalogue(
  config: Pick<EmbeddingConfig, 'provider' | 'model'>,
  providers: readonly ConfigProviderChoice[]
): boolean {
  return findCatalogueModel(providers, config.provider, config.model) != null;
}

export function resolveCreateDefaults(args: {
  providers: readonly ConfigProviderChoice[];
  defaultProvider?: string;
  defaultModel?: string;
}): { provider: string; model: string; dimensions: number } {
  const preferred = args.defaultProvider?.trim() ?? '';
  const provider =
    args.providers.find(item => item.key === preferred)?.key ??
    (args.providers.length === 1 ? args.providers[0].key : '');
  const models =
    args.providers.find(item => item.key === provider)?.models ?? [];
  const preferredModel = args.defaultModel?.trim() ?? '';
  const model =
    models.find(item => item.name === preferredModel) ??
    (models.length === 1 ? models[0] : undefined);
  return {
    provider,
    model: model?.name ?? '',
    dimensions: model?.dimensions ?? 0,
  };
}

export function catalogueDimensionsForInput(
  data: Pick<EmbeddingConfigInput, 'provider' | 'model'>,
  providers: readonly ConfigProviderChoice[] | null | undefined
): EmbeddingProviderModel {
  if (providers == null) {
    throw new Error(CATALOGUE_UNAVAILABLE_MESSAGE);
  }
  const provider = data.provider?.trim() ?? '';
  if (!provider || !providers.some(item => item.key === provider)) {
    throw new Error(PROVIDER_NOT_CONFIGURED_MESSAGE);
  }
  const modelName = data.model?.trim() ?? '';
  const model = findCatalogueModel(providers, provider, modelName);
  if (!model) {
    throw new Error(MODEL_NOT_IN_CATALOGUE_MESSAGE);
  }
  return model;
}

export function resolveRequestedCatalogueDimensions(
  model: EmbeddingProviderModel,
  requested?: number
): number {
  if (requested == null || requested === 0) return model.dimensions;
  if (!Number.isInteger(requested) || requested <= 0) {
    throw new Error(DIMENSIONS_POSITIVE_INTEGER_MESSAGE);
  }
  if (requested !== model.dimensions) {
    throw new Error(
      catalogueDimensionsMismatchMessage(
        requested,
        model.dimensions,
        model.name
      )
    );
  }
  return model.dimensions;
}
