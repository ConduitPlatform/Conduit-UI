export const VECTOR_SIMILARITIES = [
  'cosine',
  'euclidean',
  'dotProduct',
] as const;

export type VectorSimilarity = (typeof VECTOR_SIMILARITIES)[number];

export type EmbeddingConfig = {
  _id: string;
  schemaName: string;
  sourceFields: string[];
  targetField: string;
  provider: string;
  model: string;
  dimensions: number;
  similarity: VectorSimilarity;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type EmbeddingConfigInput = {
  schemaName: string;
  sourceFields: string[];
  targetField: string;
  provider?: string;
  model?: string;
  dimensions?: number;
  similarity?: VectorSimilarity;
  enabled?: boolean;
};

export type EmbeddingConfigOption = Pick<
  EmbeddingConfig,
  '_id' | 'schemaName' | 'targetField' | 'sourceFields' | 'enabled'
>;

export function toEmbeddingConfigOption(
  config: EmbeddingConfig
): EmbeddingConfigOption {
  return {
    _id: config._id,
    schemaName: config.schemaName,
    targetField: config.targetField,
    sourceFields: [...config.sourceFields],
    enabled: config.enabled,
  };
}

export type EmbeddingConfigRequest = {
  schemaName: string;
  sourceFields: string[];
  targetField: string;
  provider?: string;
  model?: string;
  dimensions?: number;
  similarity?: VectorSimilarity;
  enabled?: boolean;
};

export type UpsertEmbeddingConfigResult = {
  config: EmbeddingConfig;
  warnings: string[];
};

export function isVectorSimilarity(value: unknown): value is VectorSimilarity {
  return (
    typeof value === 'string' &&
    (VECTOR_SIMILARITIES as readonly string[]).includes(value)
  );
}
