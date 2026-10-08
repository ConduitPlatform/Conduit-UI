export const MATERIAL_EMBEDDING_CONFIG_FIELDS = [
  'provider',
  'model',
  'dimensions',
  'sourceFields',
  'targetField',
  'similarity',
] as const;

export type MaterialEmbeddingConfigField =
  (typeof MATERIAL_EMBEDDING_CONFIG_FIELDS)[number];

export type MaterialEmbeddingConfig = {
  provider: string;
  model: string;
  dimensions: number;
  sourceFields: readonly string[];
  targetField: string;
  similarity: string;
};

export function normalizeSourceFields(fields: readonly string[]): string[] {
  return [...fields].map(field => field.trim()).sort();
}

export function sameSourceFields(
  left: readonly string[] | undefined,
  right: readonly string[] | undefined
): boolean {
  return (
    JSON.stringify(normalizeSourceFields(left ?? [])) ===
    JSON.stringify(normalizeSourceFields(right ?? []))
  );
}

export function toMaterialEmbeddingConfig(
  config: MaterialEmbeddingConfig
): MaterialEmbeddingConfig {
  return {
    provider: config.provider,
    model: config.model,
    dimensions: config.dimensions,
    sourceFields: config.sourceFields,
    targetField: config.targetField,
    similarity: config.similarity,
  };
}

export function diffMaterialEmbeddingConfig(
  existing: MaterialEmbeddingConfig,
  next: MaterialEmbeddingConfig
): MaterialEmbeddingConfigField[] {
  const changed: MaterialEmbeddingConfigField[] = [];
  if (existing.provider !== next.provider) changed.push('provider');
  if (existing.model !== next.model) changed.push('model');
  if (existing.dimensions !== next.dimensions) changed.push('dimensions');
  if (!sameSourceFields(existing.sourceFields, next.sourceFields)) {
    changed.push('sourceFields');
  }
  if (existing.targetField !== next.targetField) changed.push('targetField');
  if (existing.similarity !== next.similarity) changed.push('similarity');
  return changed;
}

export function requiresIndexRecreation(
  changed: readonly MaterialEmbeddingConfigField[]
): boolean {
  return changed.some(
    field =>
      field === 'dimensions' ||
      field === 'targetField' ||
      field === 'similarity'
  );
}

export function isInPlaceDimensionChange(
  existing: MaterialEmbeddingConfig,
  next: MaterialEmbeddingConfig
): boolean {
  return (
    existing.targetField === next.targetField &&
    existing.dimensions !== next.dimensions
  );
}
