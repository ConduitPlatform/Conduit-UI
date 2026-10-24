import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  extractSchemaEditorFields,
  schemaEditorFieldsToApi,
} from './schema-editor-fields.ts';

function ids() {
  let next = 0;
  return () => `field-${next++}`;
}

describe('schema editor enum fields', () => {
  it('recognizes string enums instead of leaving them as String', () => {
    const [field] = extractSchemaEditorFields(
      {
        status: {
          type: 'String',
          enum: ['draft', 'published'],
          required: true,
          default: 'draft',
        },
      },
      ids()
    );

    assert.equal(field?.type, 'Enum');
    assert.deepEqual(field?.enumValues, ['draft', 'published']);
    assert.equal(field?.enumValueType, 'String');
    assert.equal(field?.required, true);
    assert.equal(field?.default, 'draft');
  });

  it('recognizes number enums instead of leaving them as String or Number', () => {
    const [field] = extractSchemaEditorFields(
      {
        priority: {
          type: 'Number',
          enum: [1, 2, 3],
          default: 2,
        },
      },
      ids()
    );

    assert.equal(field?.type, 'Enum');
    assert.equal(field?.enumValueType, 'Number');
    assert.deepEqual(field?.enumValues, ['1', '2', '3']);
    assert.equal(field?.default, '2');
  });

  it('writes enums back as a scalar type plus an enum list', () => {
    const fields = extractSchemaEditorFields(
      {
        status: { type: 'String', enum: ['draft', 'published'] },
        priority: { type: 'Number', enum: [1, 2], default: 1 },
        tags: [{ type: 'String', enum: ['a', 'b'] }],
        title: { type: 'String' },
      },
      ids()
    );

    assert.deepEqual(schemaEditorFieldsToApi(fields), {
      status: { type: 'String', enum: ['draft', 'published'] },
      priority: { type: 'Number', enum: [1, 2], default: 1 },
      tags: [{ type: 'String', enum: ['a', 'b'] }],
      title: { type: 'String' },
    });
  });

  it('keeps non-enum fields in the existing schema shape', () => {
    const fields = extractSchemaEditorFields(
      {
        title: 'String',
        count: { type: 'Number', required: true, default: 3 },
        owner: { type: 'Relation', model: 'User' },
        tags: ['String'],
        meta: { note: { type: 'String' } },
      },
      ids()
    );

    assert.equal(fields.find(field => field.name === 'title')?.type, 'String');
    assert.equal(
      fields.find(field => field.name === 'owner')?.relatedModel,
      'User'
    );
    assert.equal(fields.find(field => field.name === 'meta')?.type, 'Group');
    assert.deepEqual(schemaEditorFieldsToApi(fields), {
      title: { type: 'String' },
      count: { type: 'Number', required: true, default: 3 },
      owner: { type: 'Relation', model: 'User' },
      tags: [{ type: 'String' }],
      meta: { note: { type: 'String' } },
    });
  });

  it('recognizes enums nested inside a group', () => {
    const [group] = extractSchemaEditorFields(
      {
        address: {
          country: { type: 'String', enum: ['GR', 'US'] },
        },
      },
      ids()
    );

    assert.equal(group?.type, 'Group');
    assert.equal(group?.fields?.[0]?.name, 'country');
    assert.equal(group?.fields?.[0]?.type, 'Enum');
    assert.deepEqual(group?.fields?.[0]?.enumValues, ['GR', 'US']);

    assert.deepEqual(schemaEditorFieldsToApi(group ? [group] : []), {
      address: {
        country: { type: 'String', enum: ['GR', 'US'] },
      },
    });
  });
});
