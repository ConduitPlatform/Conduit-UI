import { describe, expect, it } from 'vitest';
import {
  eligibleSchemaIdsByName,
  filterByEligibleSchemas,
  isDeclaredSchemaEnabled,
  isDeniedEmbeddingSchema,
  isEligibleEmbeddingSchema,
  isSchemaExtendable,
  isEligibleSourceField,
  isHiddenField,
  isSensitiveFieldName,
  isStringLikeField,
  isValidSourceFieldName,
  listEligibleSchemas,
  listEligibleSourceFields,
  listSourceFieldChoices,
  normalizeSourceFieldAllowlist,
  requireEligibleDeclaredSchema,
  SCHEMA_ELIGIBILITY_UNAVAILABLE_MESSAGE,
  toEmbeddingConfigRequest,
  toSchemaFieldMap,
  UNAVAILABLE_EMBEDDING_SCHEMA_MESSAGE,
  validateEmbeddingConfigInput,
} from './source-fields';

function extendableArticle(extra: Record<string, unknown> = {}): {
  name: string;
  ownerModule: string;
  enabled: boolean;
  modelOptions: Record<string, unknown>;
  fields: Record<string, unknown>;
} {
  return {
    name: 'Article',
    ownerModule: 'database',
    enabled: true,
    modelOptions: {
      conduit: { permissions: { extendable: true } },
    },
    fields: { title: { type: 'String' } },
    ...extra,
  };
}

describe('source field eligibility', () => {
  it('accepts string-like definitions and rejects hidden or sensitive names', () => {
    expect(isStringLikeField('String')).toBe(true);
    expect(isStringLikeField({ type: 'String' })).toBe(true);
    expect(isStringLikeField(['String'])).toBe(true);
    expect(isStringLikeField('Number')).toBe(false);
    expect(isHiddenField({ type: 'String', select: false })).toBe(true);
    expect(isSensitiveFieldName('apiKey')).toBe(true);
    expect(isEligibleSourceField('title', { type: 'String' })).toBe(true);
    expect(isEligibleSourceField('password', { type: 'String' })).toBe(false);
    expect(
      isEligibleSourceField('notes', { type: 'String', select: false })
    ).toBe(false);
  });

  it('lists eligible fields and keeps currently selected ineligible names', () => {
    const fields = {
      title: { type: 'String' },
      body: { type: 'String' },
      password: { type: 'String' },
      hidden: { type: 'String', select: false },
      count: { type: 'Number' },
    };
    expect(listEligibleSourceFields(fields)).toEqual(['body', 'title']);
    expect(
      listSourceFieldChoices(fields, ['title', 'password']).map(
        choice => choice.name
      )
    ).toEqual(['body', 'password', 'title']);
  });

  it('denies embeddings-owned, system, and auth-secret schemas', () => {
    expect(
      isDeniedEmbeddingSchema({ name: 'Article', ownerModule: 'database' })
    ).toBe(false);
    expect(
      isDeniedEmbeddingSchema({
        name: 'EmbeddingConfig',
        ownerModule: 'embeddings',
      })
    ).toBe(true);
    expect(isDeniedEmbeddingSchema({ name: 'Config' })).toBe(true);
    expect(isDeniedEmbeddingSchema({ name: 'AccessToken' })).toBe(true);
    expect(isDeniedEmbeddingSchema({ name: '_internal' })).toBe(true);
  });

  it('requires an enabled schema and extendable permissions', () => {
    expect(isDeclaredSchemaEnabled({ enabled: true })).toBe(true);
    expect(isDeclaredSchemaEnabled({ enabled: false })).toBe(false);
    expect(isDeclaredSchemaEnabled({})).toBe(true);
    expect(
      isDeclaredSchemaEnabled({
        modelOptions: { conduit: { cms: { enabled: true } } },
      })
    ).toBe(true);
    expect(
      isDeclaredSchemaEnabled({
        modelOptions: { conduit: { cms: { enabled: false } } },
      })
    ).toBe(false);
    expect(
      isDeclaredSchemaEnabled({
        modelOptions: { conduit: { permissions: { extendable: true } } },
      })
    ).toBe(true);
    expect(isSchemaExtendable(undefined)).toBe(false);
    expect(
      isSchemaExtendable({
        conduit: { permissions: { extendable: true } },
      })
    ).toBe(true);
    expect(
      isEligibleEmbeddingSchema({
        name: 'Article',
        ownerModule: 'database',
        enabled: true,
        modelOptions: { conduit: { permissions: { extendable: true } } },
      })
    ).toBe(true);
    expect(
      isEligibleEmbeddingSchema({
        name: 'Article',
        ownerModule: 'database',
        enabled: true,
        modelOptions: { conduit: { cms: { enabled: true } } },
      })
    ).toBe(false);
    expect(
      isEligibleEmbeddingSchema({
        name: 'Article',
        ownerModule: 'database',
        enabled: false,
        modelOptions: { conduit: { permissions: { extendable: true } } },
      })
    ).toBe(false);
    expect(
      isEligibleEmbeddingSchema({
        name: 'AccessToken',
        ownerModule: 'authentication',
        enabled: true,
        modelOptions: { conduit: { permissions: { extendable: true } } },
      })
    ).toBe(false);
  });

  it('prefers compiled fields and filters denied and disabled schemas', () => {
    const fields = toSchemaFieldMap({
      fields: { title: { type: 'String' } },
      compiledFields: { body: { type: 'String' } },
    });
    expect(Object.keys(fields)).toEqual(['body']);
    const eligible = listEligibleSchemas([
      {
        name: 'Article',
        ownerModule: 'database',
        enabled: true,
        modelOptions: { conduit: { permissions: { extendable: true } } },
        fields: { title: { type: 'String' } },
      },
      {
        name: 'CmsOnly',
        ownerModule: 'database',
        enabled: true,
        modelOptions: { conduit: { cms: { enabled: true } } },
        fields: { title: { type: 'String' } },
      },
      {
        name: 'Draft',
        ownerModule: 'database',
        enabled: false,
        fields: { title: { type: 'String' } },
      },
      {
        name: 'Legacy',
        ownerModule: 'database',
        modelOptions: { conduit: { cms: { enabled: false } } },
        fields: { title: { type: 'String' } },
      },
      {
        name: 'EmbeddingConfig',
        ownerModule: 'embeddings',
        enabled: true,
        fields: { title: { type: 'String' } },
      },
    ]);
    expect(eligible.map(schema => schema.name)).toEqual(['Article']);
  });

  it('drops configs for disabled schemas and skips their index ids', () => {
    const schemas = [
      {
        _id: 's1',
        name: 'Article',
        ownerModule: 'database',
        enabled: true,
        modelOptions: { conduit: { permissions: { extendable: true } } },
      },
      { _id: 's2', name: 'Draft', ownerModule: 'database', enabled: false },
      {
        _id: 's3',
        name: 'AccessToken',
        ownerModule: 'authentication',
        enabled: true,
      },
    ];
    expect(
      filterByEligibleSchemas(
        [{ schemaName: 'Article' }, { schemaName: 'Draft' }],
        schemas
      )
    ).toEqual([{ schemaName: 'Article' }]);
    expect(filterByEligibleSchemas([{ schemaName: 'Article' }], null)).toEqual(
      []
    );
    expect([...eligibleSchemaIdsByName(schemas).keys()]).toEqual(['Article']);
  });

  it('builds an explicit upsert body and revalidates eligible fields', () => {
    const input = {
      schemaName: 'Article',
      sourceFields: ['title'],
      targetField: 'embedding',
      provider: 'openai-compatible',
      model: 'text-embedding-3-small',
      dimensions: 1536,
      similarity: 'cosine' as const,
      enabled: false,
    };
    expect(toEmbeddingConfigRequest(input)).toEqual(input);
    expect(
      toEmbeddingConfigRequest({ ...input, dimensions: undefined })
    ).not.toHaveProperty('dimensions');
    expect(
      validateEmbeddingConfigInput(
        input,
        [extendableArticle()],
        [
          {
            key: 'openai-compatible',
            models: [{ name: 'text-embedding-3-small', dimensions: 1536 }],
          },
        ]
      ).sourceFields
    ).toEqual(['title']);
    expect(
      validateEmbeddingConfigInput(
        { ...input, dimensions: undefined },
        [extendableArticle()],
        [
          {
            key: 'openai-compatible',
            models: [{ name: 'text-embedding-3-small', dimensions: 1536 }],
          },
        ]
      )
    ).not.toHaveProperty('dimensions');
    expect(() =>
      validateEmbeddingConfigInput(
        { ...input, dimensions: 8 },
        [extendableArticle()],
        [
          {
            key: 'openai-compatible',
            models: [{ name: 'text-embedding-3-small', dimensions: 1536 }],
          },
        ]
      )
    ).toThrow(
      "Requested dimensions 8 do not match catalogue dimensions 1536 for model 'text-embedding-3-small'"
    );
    expect(() =>
      validateEmbeddingConfigInput({ ...input, sourceFields: ['password'] }, [
        extendableArticle({
          fields: { password: { type: 'String' }, title: { type: 'String' } },
        }),
      ])
    ).toThrow('One or more source fields are not eligible.');
    expect(() =>
      validateEmbeddingConfigInput({ ...input, schemaName: 'AccessToken' }, [
        {
          name: 'AccessToken',
          ownerModule: 'authentication',
          enabled: true,
          modelOptions: { conduit: { permissions: { extendable: true } } },
          fields: { title: { type: 'String' } },
        },
      ])
    ).toThrow(UNAVAILABLE_EMBEDDING_SCHEMA_MESSAGE);
    expect(() =>
      validateEmbeddingConfigInput(input, [
        extendableArticle({ enabled: false, name: 'Article' }),
      ])
    ).toThrow(UNAVAILABLE_EMBEDDING_SCHEMA_MESSAGE);
    expect(() =>
      validateEmbeddingConfigInput(
        input,
        [extendableArticle()],
        [
          {
            key: 'openai-compatible',
            models: [{ name: 'other-model', dimensions: 768 }],
          },
        ]
      )
    ).toThrow('This model is not in the selected provider catalogue.');
    expect(() => requireEligibleDeclaredSchema('Article', null)).toThrow(
      SCHEMA_ELIGIBILITY_UNAVAILABLE_MESSAGE
    );
    expect(() => validateEmbeddingConfigInput(input)).toThrow(
      SCHEMA_ELIGIBILITY_UNAVAILABLE_MESSAGE
    );
    expect(() => validateEmbeddingConfigInput(input, null)).toThrow(
      SCHEMA_ELIGIBILITY_UNAVAILABLE_MESSAGE
    );
    expect(() =>
      validateEmbeddingConfigInput(
        input,
        [
          extendableArticle({
            fields: {
              title: { type: 'String' },
              embedding: { type: 'String' },
            },
          }),
        ],
        [
          {
            key: 'openai-compatible',
            models: [{ name: 'text-embedding-3-small', dimensions: 1536 }],
          },
        ]
      )
    ).toThrow(
      "Field 'embedding' already exists on schema 'Article' and is not a compatible embeddings extension"
    );
    expect(
      validateEmbeddingConfigInput(
        input,
        [
          extendableArticle({
            fields: { title: { type: 'String' } },
            compiledFields: {
              title: { type: 'String' },
              embedding: {
                type: 'Vector',
                dimensions: 1536,
                similarity: 'cosine',
                select: false,
              },
              embeddingSourceHash: {
                type: 'String',
                required: false,
                select: false,
              },
            },
            extensions: [
              {
                ownerModule: 'embeddings',
                fields: {
                  embedding: {
                    type: 'Vector',
                    dimensions: 1536,
                    similarity: 'cosine',
                    select: false,
                  },
                  embeddingSourceHash: {
                    type: 'String',
                    required: false,
                    select: false,
                  },
                },
              },
            ],
          }),
        ],
        [
          {
            key: 'openai-compatible',
            models: [{ name: 'text-embedding-3-small', dimensions: 1536 }],
          },
        ]
      ).model
    ).toBe('text-embedding-3-small');
  });

  it('preserves source field allowlist case and rejects invalid names', () => {
    expect(
      normalizeSourceFieldAllowlist([' Title ', 'Title', 'bodyText'])
    ).toEqual(['Title', 'bodyText']);
    expect(isValidSourceFieldName('bodyText')).toBe(true);
    expect(isValidSourceFieldName('1bad')).toBe(false);
  });
});
