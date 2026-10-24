import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { normalizeSchemaIndexResponse } from './schema-indexes.ts';

const idIndex = {
  fields: ['_id'],
  types: [1],
  options: { name: '_id_' },
};

const customIndex = {
  fields: ['owner'],
  types: [1],
  options: { name: 'owner_1' },
};

describe('normalizeSchemaIndexResponse', () => {
  it('accepts the raw array returned by the Database module', () => {
    assert.deepEqual(normalizeSchemaIndexResponse([idIndex, customIndex]), [
      idIndex,
      customIndex,
    ]);
  });

  it('accepts the documented { indexes } envelope', () => {
    assert.deepEqual(
      normalizeSchemaIndexResponse({ indexes: [idIndex, customIndex] }),
      [idIndex, customIndex]
    );
  });

  it('returns an empty array when indexes are missing', () => {
    assert.deepEqual(normalizeSchemaIndexResponse(undefined), []);
    assert.deepEqual(normalizeSchemaIndexResponse(null), []);
    assert.deepEqual(normalizeSchemaIndexResponse({}), []);
    assert.deepEqual(normalizeSchemaIndexResponse({ indexes: undefined }), []);
  });
});
