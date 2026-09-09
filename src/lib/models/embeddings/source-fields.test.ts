import { describe, expect, it } from 'vitest';
import {
  isDeniedEmbeddingSchema,
  isEligibleSourceField,
  isHiddenField,
  isSensitiveFieldName,
  isStringLikeField,
  isValidSourceFieldName,
  listEligibleSchemas,
  listEligibleSourceFields,
  listSourceFieldChoices,
  normalizeSourceFieldAllowlist,
  SCHEMA_ELIGIBILITY_UNAVAILABLE_MESSAGE,
  toEmbeddingConfigRequest,
  toSchemaFieldMap,
  validateEmbeddingConfigInput,
} from './source-fields';

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

  it('prefers compiled fields and filters denied schemas', () => {
    const fields = toSchemaFieldMap({
      fields: { title: { type: 'String' } },
      compiledFields: { body: { type: 'String' } },
    });
    expect(Object.keys(fields)).toEqual(['body']);
    const eligible = listEligibleSchemas([
      {
        name: 'Article',
        ownerModule: 'database',
        fields: { title: { type: 'String' } },
      },
      {
        name: 'EmbeddingConfig',
        ownerModule: 'embeddings',
        fields: { title: { type: 'String' } },
      },
    ]);
    expect(eligible.map(schema => schema.name)).toEqual(['Article']);
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
      validateEmbeddingConfigInput(input, [
        {
          name: 'Article',
          ownerModule: 'database',
          fields: { title: { type: 'String' } },
        },
      ]).sourceFields
    ).toEqual(['title']);
    expect(() =>
      validateEmbeddingConfigInput({ ...input, sourceFields: ['password'] }, [
        {
          name: 'Article',
          ownerModule: 'database',
          fields: { password: { type: 'String' }, title: { type: 'String' } },
        },
      ])
    ).toThrow('One or more source fields are not eligible.');
    expect(() =>
      validateEmbeddingConfigInput({ ...input, schemaName: 'AccessToken' }, [
        {
          name: 'AccessToken',
          ownerModule: 'authentication',
          fields: { title: { type: 'String' } },
        },
      ])
    ).toThrow('This schema cannot be used for embeddings.');
    expect(() => validateEmbeddingConfigInput(input)).toThrow(
      SCHEMA_ELIGIBILITY_UNAVAILABLE_MESSAGE
    );
    expect(() => validateEmbeddingConfigInput(input, null)).toThrow(
      SCHEMA_ELIGIBILITY_UNAVAILABLE_MESSAGE
    );
  });

  it('preserves source field allowlist case and rejects invalid names', () => {
    expect(
      normalizeSourceFieldAllowlist([' Title ', 'Title', 'bodyText'])
    ).toEqual(['Title', 'bodyText']);
    expect(isValidSourceFieldName('bodyText')).toBe(true);
    expect(isValidSourceFieldName('1bad')).toBe(false);
  });
});
