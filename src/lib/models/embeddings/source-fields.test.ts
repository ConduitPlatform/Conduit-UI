import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  isDeniedEmbeddingSchema,
  isEligibleSourceField,
  isHiddenField,
  isSensitiveFieldName,
  isStringLikeField,
  listEligibleSchemas,
  listEligibleSourceFields,
  listSourceFieldChoices,
  toSchemaFieldMap,
} from './source-fields.ts';

describe('source field eligibility', () => {
  it('accepts string-like definitions and rejects hidden or sensitive names', () => {
    assert.equal(isStringLikeField('String'), true);
    assert.equal(isStringLikeField({ type: 'String' }), true);
    assert.equal(isStringLikeField(['String']), true);
    assert.equal(isStringLikeField('Number'), false);
    assert.equal(isHiddenField({ type: 'String', select: false }), true);
    assert.equal(isSensitiveFieldName('apiKey'), true);
    assert.equal(isEligibleSourceField('title', { type: 'String' }), true);
    assert.equal(isEligibleSourceField('password', { type: 'String' }), false);
    assert.equal(
      isEligibleSourceField('notes', { type: 'String', select: false }),
      false
    );
  });

  it('lists eligible fields and keeps currently selected ineligible names', () => {
    const fields = {
      title: { type: 'String' },
      body: { type: 'String' },
      password: { type: 'String' },
      hidden: { type: 'String', select: false },
      count: { type: 'Number' },
    };
    assert.deepEqual(listEligibleSourceFields(fields), ['body', 'title']);
    assert.deepEqual(
      listSourceFieldChoices(fields, ['title', 'password']).map(
        choice => choice.name
      ),
      ['body', 'password', 'title']
    );
  });

  it('denies embeddings-owned, system, and auth-secret schemas', () => {
    assert.equal(
      isDeniedEmbeddingSchema({ name: 'Article', ownerModule: 'database' }),
      false
    );
    assert.equal(
      isDeniedEmbeddingSchema({
        name: 'EmbeddingConfig',
        ownerModule: 'embeddings',
      }),
      true
    );
    assert.equal(isDeniedEmbeddingSchema({ name: 'Config' }), true);
    assert.equal(isDeniedEmbeddingSchema({ name: 'AccessToken' }), true);
    assert.equal(isDeniedEmbeddingSchema({ name: '_internal' }), true);
  });

  it('prefers compiled fields and filters denied schemas', () => {
    const fields = toSchemaFieldMap({
      fields: { title: { type: 'String' } },
      compiledFields: { body: { type: 'String' } },
    });
    assert.deepEqual(Object.keys(fields), ['body']);
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
    assert.deepEqual(
      eligible.map(schema => schema.name),
      ['Article']
    );
  });
});
