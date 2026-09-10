export const OPENAI_COMPATIBLE_PROVIDER = 'openai-compatible' as const;

export type EmbeddingProviderModel = {
  name: string;
  dimensions: number;
};

export type EmbeddingsProviderSettings = {
  endpoint: string;
  apiKeyConfigured: boolean;
  models: EmbeddingProviderModel[];
  defaultModel: string;
};

export type EmbeddingsProviderPatch = {
  endpoint: string;
  apiKey?: string;
  models: EmbeddingProviderModel[];
  defaultModel?: string;
};

export type EmbeddingsQueueSettings = {
  concurrency: number;
  attempts: number;
  maxBatchSize: number;
  drainTimeoutMs: number;
};

export type EmbeddingsSecuritySettings = {
  sourceFieldAllowlist: string[];
  maxMutationEventIds: number;
  embedTimeoutMs: number;
  maxEmbedInputBytes: number;
  maxEmbedResponseBytes: number;
  maxChunksPerDocument?: number;
  maxChunkTextBytes?: number;
  maxMetadataBytes?: number;
  maxReferenceBytes?: number;
  sourceSearchMaxLimit?: number;
};

export type EmbeddingsStorageExtractionSettings = {
  maxFileBytes?: number;
  maxExtractedBytes?: number;
  maxPdfPages?: number;
  extractTimeoutMs?: number;
  maxChunksPerFile?: number;
  chunkOverlapBytes?: number;
  queueConcurrency?: number;
  queueAttempts?: number;
};

export type EmbeddingsSettings = {
  enabled: boolean;
  defaultProvider: string;
  providers: Record<string, EmbeddingsProviderSettings>;
  queue: EmbeddingsQueueSettings;
  security: EmbeddingsSecuritySettings;
  storageExtraction?: EmbeddingsStorageExtractionSettings;
};

export type EmbeddingsSettingsPatch = {
  enabled?: boolean;
  defaultProvider?: string;
  providers?: Record<string, EmbeddingsProviderPatch>;
  queue?: EmbeddingsQueueSettings;
  security?: EmbeddingsSecuritySettings;
  storageExtraction?: EmbeddingsStorageExtractionSettings;
};

export type EmbeddingsConfigResponse = {
  config: EmbeddingsSettings;
};
