import { z } from 'zod';
import { VECTOR_SIMILARITIES } from '@/lib/models/embeddings/config';
import {
  isInPlaceDimensionChange,
  MaterialEmbeddingConfig,
} from '@/lib/models/embeddings/config-change';
import { isValidSchemaOrTargetName } from '@/lib/models/embeddings/source-fields';

const NAME_MESSAGE =
  'Use a letter or underscore first, then letters, numbers, or underscores';

export const embeddingConfigFormSchema = z.object({
  schemaName: z
    .string()
    .min(1, 'Schema is required')
    .refine(isValidSchemaOrTargetName, NAME_MESSAGE),
  sourceFields: z
    .array(z.string().min(1))
    .min(1, 'Select at least one source field'),
  targetField: z
    .string()
    .min(1, 'Target field is required')
    .refine(isValidSchemaOrTargetName, NAME_MESSAGE),
  provider: z.string().min(1, 'Provider is required'),
  model: z.string().min(1, 'Model is required'),
  dimensions: z.coerce
    .number({ error: 'Dimensions must be a positive integer' })
    .int('Dimensions must be a positive integer')
    .positive('Dimensions must be a positive integer'),
  similarity: z.enum(VECTOR_SIMILARITIES),
  enabled: z.boolean(),
});

export type EmbeddingConfigFormValues = z.infer<
  typeof embeddingConfigFormSchema
>;

export function defaultConfigFormValues(args: {
  provider?: string;
  model?: string;
  dimensions?: number;
}): EmbeddingConfigFormValues {
  return {
    schemaName: '',
    sourceFields: [],
    targetField: '',
    provider: args.provider || '',
    model: args.model || '',
    dimensions: args.dimensions && args.dimensions > 0 ? args.dimensions : 0,
    similarity: 'cosine',
    enabled: false,
  };
}

export function embeddingConfigEditSchema(existing: MaterialEmbeddingConfig) {
  return embeddingConfigFormSchema.superRefine((value, ctx) => {
    if (
      isInPlaceDimensionChange(existing, {
        provider: value.provider,
        model: value.model,
        dimensions: value.dimensions,
        sourceFields: value.sourceFields,
        targetField: value.targetField,
        similarity: value.similarity,
      })
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['dimensions'],
        message:
          'Changing dimensions on the same target field is not allowed. Choose a new target field first.',
      });
    }
  });
}
