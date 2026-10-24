import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { validateSchemaFields } from './schema-field-validation.ts';

describe('validateSchemaFields', () => {
  it('allows a group nested inside weekly plus a new sibling field', () => {
    const error = validateSchemaFields([
      {
        name: 'weekly',
        type: 'Group',
        fields: [
          {
            name: 'on',
            type: 'Group',
            fields: [{ name: 'day', type: 'String', required: true }],
          },
        ],
      },
      { name: 'title', type: 'String' },
    ]);

    assert.equal(error, null);
  });

  it('still requires a group to contain at least one field', () => {
    const error = validateSchemaFields([
      { name: 'weekly', type: 'Group', fields: [] },
    ]);

    assert.equal(
      error,
      'weekly is a nested group and needs at least one nested field.'
    );
  });

  it('requires a nested group to contain at least one field', () => {
    const error = validateSchemaFields([
      {
        name: 'weekly',
        type: 'Group',
        fields: [{ name: 'on', type: 'Group', fields: [] }],
      },
    ]);

    assert.equal(
      error,
      'weekly.on is a nested group and needs at least one nested field.'
    );
  });

  it('requires an enum field to list at least one value', () => {
    const error = validateSchemaFields([
      { name: 'status', type: 'Enum', enumValues: [] },
    ]);
    assert.equal(error, 'status is an enum and needs at least one value.');
  });

  it('rejects enum defaults that are not in the value list', () => {
    const error = validateSchemaFields([
      {
        name: 'status',
        type: 'Enum',
        enumValueType: 'String',
        enumValues: ['draft', 'published'],
        default: 'archived',
      },
    ]);
    assert.equal(error, 'status default must be one of the enum values.');
  });

  it('rejects non-numeric values on a number enum', () => {
    const error = validateSchemaFields([
      {
        name: 'priority',
        type: 'Enum',
        enumValueType: 'Number',
        enumValues: ['1', 'high'],
      },
    ]);
    assert.equal(error, 'priority has an enum value that is not a number.');
  });

  it('allows groups deeper than two levels', () => {
    const error = validateSchemaFields([
      {
        name: 'weekly',
        type: 'Group',
        fields: [
          {
            name: 'on',
            type: 'Group',
            fields: [
              {
                name: 'window',
                type: 'Group',
                fields: [{ name: 'start', type: 'String' }],
              },
            ],
          },
        ],
      },
    ]);

    assert.equal(error, null);
  });
});
