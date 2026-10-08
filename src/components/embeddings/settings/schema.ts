import { z } from 'zod';
import { formApiKeyValue } from '@/lib/models/embeddings/secrets';
import { OPENAI_COMPATIBLE_PROVIDER } from '@/lib/models/embeddings/settings';
import {
  parseHttpsEndpoint,
  SETTINGS_LIMITS,
  uniqueCatalogueNames,
} from '@/lib/models/embeddings/settings-form';

function boundedInt(limits: { min: number; max: number }, message: string) {
  return z.coerce
    .number({ error: message })
    .int(message)
    .min(limits.min, message)
    .max(limits.max, message);
}

const catalogueModelSchema = z.object({
  name: z.string().trim().min(1, 'Model name is required'),
  dimensions: z.coerce
    .number({ error: 'Dimensions must be a positive integer' })
    .int('Dimensions must be a positive integer')
    .positive('Dimensions must be a positive integer'),
});

export const embeddingsSettingsFormSchema = z
  .object({
    defaultProvider: z
      .string()
      .min(1, 'Provider is required')
      .refine(
        value => value === OPENAI_COMPATIBLE_PROVIDER,
        'Provider must be openai-compatible'
      ),
    endpoint: z
      .string()
      .trim()
      .min(1, 'Endpoint is required')
      .refine(
        value => parseHttpsEndpoint(value) != null,
        'Endpoint must be HTTPS with a public DNS hostname and no credentials'
      ),
    apiKey: z.string().transform(formApiKeyValue),
    apiKeyConfigured: z.boolean(),
    models: z.array(catalogueModelSchema).min(1, 'Add at least one model'),
    defaultModel: z.string(),
    queue: z.object({
      concurrency: boundedInt(
        SETTINGS_LIMITS.concurrency,
        `Concurrency must be ${SETTINGS_LIMITS.concurrency.min}–${SETTINGS_LIMITS.concurrency.max}`
      ),
      attempts: boundedInt(
        SETTINGS_LIMITS.attempts,
        `Attempts must be ${SETTINGS_LIMITS.attempts.min}–${SETTINGS_LIMITS.attempts.max}`
      ),
      maxBatchSize: boundedInt(
        SETTINGS_LIMITS.maxBatchSize,
        `Max batch size must be ${SETTINGS_LIMITS.maxBatchSize.min}–${SETTINGS_LIMITS.maxBatchSize.max}`
      ),
      drainTimeoutMs: boundedInt(
        SETTINGS_LIMITS.drainTimeoutMs,
        `Drain timeout must be ${SETTINGS_LIMITS.drainTimeoutMs.min}–${SETTINGS_LIMITS.drainTimeoutMs.max} ms`
      ),
    }),
    security: z.object({
      maxMutationEventIds: boundedInt(
        SETTINGS_LIMITS.maxMutationEventIds,
        `Max mutation event ids must be ${SETTINGS_LIMITS.maxMutationEventIds.min}–${SETTINGS_LIMITS.maxMutationEventIds.max}`
      ),
      embedTimeoutMs: boundedInt(
        SETTINGS_LIMITS.embedTimeoutMs,
        `Embed timeout must be ${SETTINGS_LIMITS.embedTimeoutMs.min}–${SETTINGS_LIMITS.embedTimeoutMs.max} ms`
      ),
      maxEmbedInputBytes: boundedInt(
        SETTINGS_LIMITS.maxEmbedInputBytes,
        `Max input bytes must be ${SETTINGS_LIMITS.maxEmbedInputBytes.min}–${SETTINGS_LIMITS.maxEmbedInputBytes.max}`
      ),
      maxEmbedResponseBytes: boundedInt(
        SETTINGS_LIMITS.maxEmbedResponseBytes,
        `Max response bytes must be ${SETTINGS_LIMITS.maxEmbedResponseBytes.min}–${SETTINGS_LIMITS.maxEmbedResponseBytes.max}`
      ),
    }),
  })
  .superRefine((value, ctx) => {
    if (!value.apiKeyConfigured && value.apiKey.trim().length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['apiKey'],
        message: 'API key is required',
      });
    }
    const names = uniqueCatalogueNames(value.models);
    if (names.length !== value.models.length) {
      const seen = new Set<string>();
      value.models.forEach((model, index) => {
        const name = model.name.trim();
        if (!name) return;
        if (seen.has(name)) {
          ctx.addIssue({
            code: 'custom',
            path: ['models', index, 'name'],
            message: `Model '${name}' is duplicated`,
          });
        }
        seen.add(name);
      });
    }
    const defaultModel = value.defaultModel.trim();
    if (defaultModel && !names.includes(defaultModel)) {
      ctx.addIssue({
        code: 'custom',
        path: ['defaultModel'],
        message: 'Default model must match a listed model',
      });
    }
  });

export type EmbeddingsSettingsSchemaValues = z.infer<
  typeof embeddingsSettingsFormSchema
>;
