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
