import { z } from 'zod';
import { formApiKeyValue } from '../../../lib/models/embeddings/secrets.ts';
import { OPENAI_COMPATIBLE_PROVIDER } from '../../../lib/models/embeddings/settings.ts';
import {
  isValidHost,
  normalizeHosts,
  parseHttpsEndpoint,
  SETTINGS_LIMITS,
} from '../../../lib/models/embeddings/settings-form.ts';
import {
  isValidSourceFieldName,
  normalizeSourceFieldAllowlist,
} from '../../../lib/models/embeddings/source-fields.ts';

function boundedInt(limits: { min: number; max: number }, message: string) {
  return z.coerce
    .number({ error: message })
    .int(message)
    .min(limits.min, message)
    .max(limits.max, message);
}

const hostListSchema = z
  .array(z.string())
  .transform(normalizeHosts)
  .superRefine((hosts, ctx) => {
    if (hosts.some(host => !isValidHost(host))) {
      ctx.addIssue({
        code: 'custom',
        message: 'Use a public DNS hostname such as api.openai.com',
      });
    }
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
    model: z.string().trim().min(1, 'Model is required'),
    allowedHosts: hostListSchema,
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
      requireGrpcKey: z.boolean(),
      sourceFieldAllowlist: z
        .array(z.string())
        .transform(normalizeSourceFieldAllowlist)
        .superRefine((fields, ctx) => {
          if (fields.some(field => !isValidSourceFieldName(field))) {
            ctx.addIssue({
              code: 'custom',
              message:
                'Use a letter or underscore first, then letters, numbers, or underscores',
            });
          }
        }),
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
    const url = parseHttpsEndpoint(value.endpoint);
    if (!url) return;
    const hostname = url.hostname.toLowerCase();
    if (!value.allowedHosts.includes(hostname)) {
      ctx.addIssue({
        code: 'custom',
        path: ['allowedHosts'],
        message: `Allowlist must include ${hostname}`,
      });
    }
    if (value.allowedHosts.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['allowedHosts'],
        message: 'Add at least one allowed host',
      });
    }
  });

export type EmbeddingsSettingsSchemaValues = z.infer<
  typeof embeddingsSettingsFormSchema
>;
