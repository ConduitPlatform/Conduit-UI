import { z } from 'zod';
import { VECTOR_SIMILARITIES } from '@/lib/models/embeddings/config';
import {
  AUTOMATIC_STORAGE_MIME_TYPES,
  PARTITION_SUBJECT_PATTERN,
  type EmbeddingSource,
  type EmbeddingSourceKind,
  parseStorageSelectors,
} from '@/lib/models/embeddings/source';

export const embeddingSourceFormSchema = z
  .object({
    label: z.string().optional(),
    kind: z.enum(['conduit-storage', 'external']),
    partitionSubject: z
      .string()
      .trim()
      .min(1, 'Access scope is required')
      .regex(
        PARTITION_SUBJECT_PATTERN,
        'Access scope must be a resource such as Team:id'
      ),
    provider: z.string().min(1, 'Provider is required'),
    model: z.string().min(1, 'Model is required'),
    dimensions: z.coerce
      .number({ error: 'Dimensions must be a positive integer' })
      .int('Dimensions must be a positive integer')
      .positive('Dimensions must be a positive integer'),
    similarity: z.enum(VECTOR_SIMILARITIES),
    container: z.string().optional(),
    folderPrefix: z.string().optional(),
    mimeTypes: z
      .array(z.enum(AUTOMATIC_STORAGE_MIME_TYPES))
      .min(1, 'Select at least one supported type'),
    metadataAllowlist: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.kind === 'conduit-storage' && !value.container?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['container'],
        message: 'Container is required',
      });
    }
  });

export type EmbeddingSourceFormValues = z.infer<
  typeof embeddingSourceFormSchema
>;

export function defaultSourceFormValues(args: {
  kind: EmbeddingSourceKind;
  provider: string;
  model: string;
  dimensions: number;
}): EmbeddingSourceFormValues {
  return {
    label: '',
    kind: args.kind,
    partitionSubject: '',
    provider: args.provider,
    model: args.model,
    dimensions: args.dimensions,
    similarity: 'cosine',
    container: '',
    folderPrefix: '',
    mimeTypes: [...AUTOMATIC_STORAGE_MIME_TYPES],
    metadataAllowlist: '',
  };
}

export function toSourceFormValues(
  source: EmbeddingSource
): EmbeddingSourceFormValues {
  const selectors = parseStorageSelectors(source.selectors);
  return {
    label: source.label ?? '',
    kind: source.kind,
    partitionSubject: source.partitionSubject,
    provider: source.provider,
    model: source.model,
    dimensions: source.dimensions,
    similarity: source.similarity,
    container: selectors?.container ?? '',
    folderPrefix: selectors?.folderPrefix ?? '',
    mimeTypes: selectors?.mimeTypes
      ? [...selectors.mimeTypes]
      : [...AUTOMATIC_STORAGE_MIME_TYPES],
    metadataAllowlist: source.metadataAllowlist.join('\n'),
  };
}

export function parseMetadataAllowlistInput(value: string): string[] {
  return [
    ...new Set(
      value
        .split(/[\n,]/)
        .map(item => item.trim())
        .filter(Boolean)
    ),
  ];
}

export function sourceFormToCreateInput(values: EmbeddingSourceFormValues) {
  const metadataAllowlist = parseMetadataAllowlistInput(
    values.metadataAllowlist ?? ''
  );
  const mimeTypes =
    values.mimeTypes.length === AUTOMATIC_STORAGE_MIME_TYPES.length
      ? undefined
      : values.mimeTypes;
  return {
    label: values.label?.trim() || undefined,
    kind: values.kind,
    partitionSubject: values.partitionSubject.trim(),
    provider: values.provider,
    model: values.model,
    dimensions: values.dimensions,
    similarity: values.similarity,
    metadataAllowlist,
    selectors:
      values.kind === 'conduit-storage'
        ? {
            container: values.container?.trim() ?? '',
            ...(values.folderPrefix?.trim()
              ? { folderPrefix: values.folderPrefix.trim() }
              : {}),
            ...(mimeTypes ? { mimeTypes } : {}),
          }
        : undefined,
  };
}
