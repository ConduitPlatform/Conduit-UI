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
  parseDatabaseSystemSchemaNames,
  requireEligibleDeclaredSchema,
  SCHEMA_ELIGIBILITY_UNAVAILABLE_MESSAGE,
  toEmbeddingConfigRequest,
  toSchemaFieldMap,
  UNAVAILABLE_EMBEDDING_SCHEMA_MESSAGE,
  validateEmbeddingConfigInput,
} from './source-fields';

const NO_SYSTEM_SCHEMAS: string[] = [];
const DATABASE_SYSTEM_SCHEMAS = [
  '_DeclaredSchema',
  'MigratedSchemas',
  'CustomEndpoints',
  'PendingSchemas',
  'Views',
];

function extendableSchema(
  name: string,
  extra: Record<string, unknown> = {}
): {
  name: string;
  ownerModule: string;
  enabled: boolean;
  modelOptions: Record<string, unknown>;
  fields: Record<string, unknown>;
} {
  return {
    name,
    ownerModule: 'database',
    enabled: true,
    modelOptions: {
      conduit: { permissions: { extendable: true } },
    },
    fields: { title: { type: 'String' } },
    ...extra,
  };
}

function extendableArticle(extra: Record<string, unknown> = {}): {
  name: string;
  ownerModule: string;
  enabled: boolean;
  modelOptions: Record<string, unknown>;
  fields: Record<string, unknown>;
} {
  return extendableSchema('Article', extra);
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

  it('denies embeddings-owned, system, platform-internal, and auth-secret schemas', () => {
    expect(
      isDeniedEmbeddingSchema({ name: 'Article', ownerModule: 'database' })
    ).toBe(false);
    expect(
      isDeniedEmbeddingSchema({
        name: 'EmbeddingConfig',
        ownerModule: 'embeddings',
      })
    ).toBe(true);
    expect(
      isDeniedEmbeddingSchema({ name: 'Config', ownerModule: 'core' })
    ).toBe(true);
    expect(
      isDeniedEmbeddingSchema({ name: 'Admin', ownerModule: 'core' })
    ).toBe(true);
    expect(
      isDeniedEmbeddingSchema({
        name: 'AdminMiddleware',
        ownerModule: 'core',
      })
    ).toBe(true);
    expect(
      isDeniedEmbeddingSchema({ name: 'Client', ownerModule: 'router' })
    ).toBe(true);
    expect(
      isDeniedEmbeddingSchema({
        name: 'AppMiddleware',
        ownerModule: 'router',
      })
    ).toBe(true);
    expect(
      isDeniedEmbeddingSchema({ name: 'User', ownerModule: 'authentication' })
    ).toBe(false);
    expect(
      isDeniedEmbeddingSchema({ name: 'Team', ownerModule: 'authentication' })
    ).toBe(false);
    expect(
      isDeniedEmbeddingSchema(
        { name: 'Views', ownerModule: 'database' },
        DATABASE_SYSTEM_SCHEMAS
      )
    ).toBe(true);
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
    const eligible = listEligibleSchemas(
      [
        {
          name: 'Article',
          ownerModule: 'database',
          enabled: true,
          modelOptions: { conduit: { permissions: { extendable: true } } },
          fields: { title: { type: 'String' } },
        },
        extendableSchema('User', { ownerModule: 'authentication' }),
        extendableSchema('Team', { ownerModule: 'authentication' }),
        extendableSchema('Admin', { ownerModule: 'core' }),
        extendableSchema('Client', { ownerModule: 'router' }),
        extendableSchema('Views'),
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
      ],
      DATABASE_SYSTEM_SCHEMAS
    );
    expect(eligible.map(schema => schema.name)).toEqual([
      'Article',
      'Team',
      'User',
    ]);
    expect(listEligibleSchemas([extendableArticle()])).toEqual([]);
    expect(listEligibleSchemas([extendableArticle()], null)).toEqual([]);
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
        schemas,
        NO_SYSTEM_SCHEMAS
      )
    ).toEqual([{ schemaName: 'Article' }]);
    expect(filterByEligibleSchemas([{ schemaName: 'Article' }], null)).toEqual(
      []
    );
    expect(
      filterByEligibleSchemas([{ schemaName: 'Article' }], schemas)
    ).toEqual([]);
    expect([
      ...eligibleSchemaIdsByName(schemas, NO_SYSTEM_SCHEMAS).keys(),
    ]).toEqual(['Article']);
    expect([...eligibleSchemaIdsByName(schemas).keys()]).toEqual([]);
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
        ],
        NO_SYSTEM_SCHEMAS
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
        ],
        NO_SYSTEM_SCHEMAS
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
        ],
        NO_SYSTEM_SCHEMAS
      )
    ).toThrow(
      "Requested dimensions 8 do not match catalogue dimensions 1536 for model 'text-embedding-3-small'"
    );
    expect(() =>
      validateEmbeddingConfigInput(
        { ...input, sourceFields: ['password'] },
        [
          extendableArticle({
            fields: { password: { type: 'String' }, title: { type: 'String' } },
          }),
        ],
        undefined,
        NO_SYSTEM_SCHEMAS
      )
    ).toThrow('One or more source fields are not eligible.');
    expect(() =>
      validateEmbeddingConfigInput(
        { ...input, schemaName: 'AccessToken' },
        [
          {
            name: 'AccessToken',
            ownerModule: 'authentication',
            enabled: true,
            modelOptions: { conduit: { permissions: { extendable: true } } },
            fields: { title: { type: 'String' } },
          },
        ],
        undefined,
        NO_SYSTEM_SCHEMAS
      )
    ).toThrow(UNAVAILABLE_EMBEDDING_SCHEMA_MESSAGE);
    expect(() =>
      validateEmbeddingConfigInput(
        { ...input, schemaName: 'Admin' },
        [extendableSchema('Admin', { ownerModule: 'core' })],
        [
          {
            key: 'openai-compatible',
            models: [{ name: 'text-embedding-3-small', dimensions: 1536 }],
          },
        ],
        DATABASE_SYSTEM_SCHEMAS
      )
    ).toThrow(UNAVAILABLE_EMBEDDING_SCHEMA_MESSAGE);
    expect(
      validateEmbeddingConfigInput(
        { ...input, schemaName: 'User' },
        [
          extendableSchema('User', {
            ownerModule: 'authentication',
          }),
        ],
        [
          {
            key: 'openai-compatible',
            models: [{ name: 'text-embedding-3-small', dimensions: 1536 }],
          },
        ],
        DATABASE_SYSTEM_SCHEMAS
      ).schemaName
    ).toBe('User');
    expect(() =>
      validateEmbeddingConfigInput(
        input,
        [extendableArticle({ enabled: false, name: 'Article' })],
        undefined,
        NO_SYSTEM_SCHEMAS
      )
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
        ],
        NO_SYSTEM_SCHEMAS
      )
    ).toThrow('This model is not in the selected provider catalogue.');
    expect(() => requireEligibleDeclaredSchema('Article', null)).toThrow(
      SCHEMA_ELIGIBILITY_UNAVAILABLE_MESSAGE
    );
    expect(() =>
      requireEligibleDeclaredSchema('Article', [extendableArticle()])
    ).toThrow(SCHEMA_ELIGIBILITY_UNAVAILABLE_MESSAGE);
    expect(() => validateEmbeddingConfigInput(input)).toThrow(
      SCHEMA_ELIGIBILITY_UNAVAILABLE_MESSAGE
    );
    expect(() => validateEmbeddingConfigInput(input, null)).toThrow(
      SCHEMA_ELIGIBILITY_UNAVAILABLE_MESSAGE
    );
    expect(() =>
      validateEmbeddingConfigInput(input, [extendableArticle()])
    ).toThrow(SCHEMA_ELIGIBILITY_UNAVAILABLE_MESSAGE);
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
        ],
        NO_SYSTEM_SCHEMAS
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
        ],
        NO_SYSTEM_SCHEMAS
      ).model
    ).toBe('text-embedding-3-small');
  });

  it('parses the Database system schema payload and fails closed on drift', () => {
    expect(
      parseDatabaseSystemSchemaNames({
        databaseSystemSchemas: DATABASE_SYSTEM_SCHEMAS,
      })
    ).toEqual(DATABASE_SYSTEM_SCHEMAS);
    expect(() => parseDatabaseSystemSchemaNames({})).toThrow(
      SCHEMA_ELIGIBILITY_UNAVAILABLE_MESSAGE
    );
    expect(() =>
      parseDatabaseSystemSchemaNames({ databaseSystemSchemas: [1] })
    ).toThrow(SCHEMA_ELIGIBILITY_UNAVAILABLE_MESSAGE);
  });

  it('preserves source field allowlist case and rejects invalid names', () => {
    expect(
      normalizeSourceFieldAllowlist([' Title ', 'Title', 'bodyText'])
    ).toEqual(['Title', 'bodyText']);
    expect(isValidSourceFieldName('bodyText')).toBe(true);
    expect(isValidSourceFieldName('1bad')).toBe(false);
  });
});
