import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { normalizeSchemaFieldDefinition } from './schema-field-definition.ts';

describe('normalizeSchemaFieldDefinition', () => {
  it('keeps scalar Relation fields as Relation', () => {
    assert.deepEqual(
      normalizeSchemaFieldDefinition({
        type: 'Relation',
        model: 'User',
        required: true,
      }),
      {
        isArray: false,
        isGroup: false,
        type: 'Relation',
        relatedModel: 'User',
        required: true,
        unique: undefined,
        select: undefined,
        default: undefined,
        description: undefined,
        enumValues: undefined,
      }
    );
  });

  it('unwraps top-level Relation arrays', () => {
    const field = normalizeSchemaFieldDefinition([
      { type: 'Relation', model: 'User' },
    ]);
    assert.equal(field.type, 'Relation');
    assert.equal(field.relatedModel, 'User');
    assert.equal(field.isArray, true);
    assert.equal(field.isGroup, false);
  });

  it('unwraps wrapped { type: [{ type: Relation }] } arrays', () => {
    const field = normalizeSchemaFieldDefinition({
      type: [
        {
          select: true,
          required: true,
          type: 'Relation',
          model: 'Team',
        },
      ],
    });
    assert.equal(field.type, 'Relation');
    assert.equal(field.relatedModel, 'Team');
    assert.equal(field.isArray, true);
    assert.equal(field.required, true);
    assert.equal(field.select, true);
  });

  it('unwraps { type: ["Relation"], model } arrays', () => {
    const field = normalizeSchemaFieldDefinition({
      type: ['Relation'],
      model: 'User',
    });
    assert.equal(field.type, 'Relation');
    assert.equal(field.relatedModel, 'User');
    assert.equal(field.isArray, true);
  });

  it('unwraps { type: ["String"] } as String arrays, not Relation', () => {
    const field = normalizeSchemaFieldDefinition({
      type: ['String'],
      required: true,
    });
    assert.equal(field.type, 'String');
    assert.equal(field.isArray, true);
    assert.equal(field.relatedModel, undefined);
    assert.equal(field.required, true);
  });

  it('treats nested objects without type as Group', () => {
    const field = normalizeSchemaFieldDefinition({
      name: { type: 'String' },
    });
    assert.equal(field.type, 'Group');
    assert.equal(field.isGroup, true);
    assert.equal(field.isArray, false);
    assert.deepEqual(field.groupFields, { name: { type: 'String' } });
  });

  it('does not treat a Group required flag as a nested field', () => {
    const field = normalizeSchemaFieldDefinition({
      required: false,
      type: [
        {
          passenger: {
            type: 'Relation',
            required: false,
            model: 'Traveller',
          },
          isLeadTraveller: {
            type: 'Boolean',
            required: false,
            default: false,
          },
        },
      ],
    });
    assert.equal(field.type, 'Group');
    assert.equal(field.isGroup, true);
    assert.equal(field.isArray, true);
    assert.equal(field.required, false);
    assert.deepEqual(field.groupFields, {
      passenger: {
        type: 'Relation',
        required: false,
        model: 'Traveller',
      },
      isLeadTraveller: {
        type: 'Boolean',
        required: false,
        default: false,
      },
    });
  });

  it('keeps a nested field actually named required', () => {
    const field = normalizeSchemaFieldDefinition({
      required: { type: 'String' },
      passenger: { type: 'Relation', model: 'Traveller' },
    });
    assert.equal(field.isGroup, true);
    assert.deepEqual(field.groupFields, {
      required: { type: 'String' },
      passenger: { type: 'Relation', model: 'Traveller' },
    });
  });

  it('unwraps non-array Group wrappers whose type is a nested object', () => {
    const field = normalizeSchemaFieldDefinition({
      required: false,
      type: {
        paxCount: { type: 'Number', required: false },
        totalNet: { type: 'Number', required: false },
      },
    });
    assert.equal(field.type, 'Group');
    assert.equal(field.isGroup, true);
    assert.equal(field.isArray, false);
    assert.equal(field.required, false);
    assert.deepEqual(field.groupFields, {
      paxCount: { type: 'Number', required: false },
      totalNet: { type: 'Number', required: false },
    });
  });

  it('defaults a missing type to String', () => {
    assert.equal(normalizeSchemaFieldDefinition(undefined).type, 'String');
    assert.equal(normalizeSchemaFieldDefinition(null).type, 'String');
    assert.equal(normalizeSchemaFieldDefinition('').type, 'String');
  });

  it('recovers Relation when model is present on a String or ObjectId field', () => {
    assert.equal(
      normalizeSchemaFieldDefinition({ type: 'String', model: 'User' }).type,
      'Relation'
    );
    assert.equal(
      normalizeSchemaFieldDefinition({ type: 'ObjectId', model: 'File' })
        .relatedModel,
      'File'
    );
  });

  it('keeps shorthand String definitions', () => {
    const field = normalizeSchemaFieldDefinition('String');
    assert.equal(field.type, 'String');
    assert.equal(field.isArray, false);
    assert.equal(field.isGroup, false);
  });
});
