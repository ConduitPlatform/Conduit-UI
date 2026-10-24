import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DEFAULT_MONGO_SCHEMA_FIELDS,
  canAssignSchemaFieldName,
  isDefaultMongoSchemaField,
  isLockedMongoSchemaField,
} from './system-schema-fields.ts';

describe('isDefaultMongoSchemaField', () => {
  it('matches MongoDB default document fields', () => {
    for (const name of DEFAULT_MONGO_SCHEMA_FIELDS) {
      assert.equal(isDefaultMongoSchemaField(name), true);
    }
  });

  it('does not match custom field names', () => {
    assert.equal(isDefaultMongoSchemaField('name'), false);
    assert.equal(isDefaultMongoSchemaField('id'), false);
    assert.equal(isDefaultMongoSchemaField('created_at'), false);
    assert.equal(isDefaultMongoSchemaField('_ID'), false);
    assert.equal(isDefaultMongoSchemaField(''), false);
  });
});

describe('isLockedMongoSchemaField', () => {
  it('locks default fields only at the schema root', () => {
    assert.equal(isLockedMongoSchemaField('_id', 0), true);
    assert.equal(isLockedMongoSchemaField('createdAt'), true);
    assert.equal(isLockedMongoSchemaField('updatedAt', 0), true);
    assert.equal(isLockedMongoSchemaField('__v', 0), true);
  });

  it('does not lock nested Group fields with the same names', () => {
    assert.equal(isLockedMongoSchemaField('_id', 1), false);
    assert.equal(isLockedMongoSchemaField('createdAt', 1), false);
    assert.equal(isLockedMongoSchemaField('updatedAt', 2), false);
  });

  it('does not lock custom fields at the schema root', () => {
    assert.equal(isLockedMongoSchemaField('name', 0), false);
    assert.equal(isLockedMongoSchemaField('title', 0), false);
  });
});

describe('canAssignSchemaFieldName', () => {
  it('blocks renaming a custom top-level field onto a Mongo default name', () => {
    assert.equal(canAssignSchemaFieldName('title', '_id', 0), false);
    assert.equal(canAssignSchemaFieldName('title', 'createdAt', 0), false);
    assert.equal(canAssignSchemaFieldName('title', 'updatedAt'), false);
    assert.equal(canAssignSchemaFieldName('title', '__v', 0), false);
  });

  it('allows keeping or assigning custom names at the schema root', () => {
    assert.equal(canAssignSchemaFieldName('title', 'title', 0), true);
    assert.equal(canAssignSchemaFieldName('title', 'name', 0), true);
    assert.equal(canAssignSchemaFieldName('_id', 'name', 0), true);
  });

  it('allows existing system rows to keep their names', () => {
    assert.equal(canAssignSchemaFieldName('_id', '_id', 0), true);
    assert.equal(canAssignSchemaFieldName('createdAt', 'createdAt', 0), true);
  });

  it('allows nested Group fields to use Mongo default names', () => {
    assert.equal(canAssignSchemaFieldName('title', 'createdAt', 1), true);
    assert.equal(canAssignSchemaFieldName('when', '_id', 1), true);
  });
});
