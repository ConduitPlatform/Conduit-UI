import { describe, expect, it } from 'vitest';

import {
  buildDocumentListQuery,
  buildFieldSearchQuery,
  listSearchableFields,
} from './data-explorer.utils';

const schema = {
  fields: {
    name: 'String',
    age: { type: 'Number' },
    active: { type: 'Boolean' },
    tags: ['String'],
    owner: { type: 'Relation', model: 'User' },
    address: {
      city: { type: 'String' },
      geo: { type: 'JSON' },
    },
    createdAt: { type: 'Date' },
  },
  extensions: [
    {
      fields: {
        nickname: { type: 'String' },
        name: { type: 'Number' },
      },
    },
  ],
};

describe('listSearchableFields', () => {
  it('keeps text, number, and boolean leaves, including nested groups', () => {
    expect(listSearchableFields(schema)).toEqual([
      { path: '_id', kind: 'id' },
      { path: 'name', kind: 'text' },
      { path: 'age', kind: 'number' },
      { path: 'active', kind: 'boolean' },
      { path: 'address.city', kind: 'text' },
      { path: 'nickname', kind: 'text' },
    ]);
  });

  it('does not let an extension replace a compiled field of the same name', () => {
    const fields = listSearchableFields({
      compiledFields: { name: { type: 'String' } },
      extensions: [{ fields: { name: { type: 'Number' } } }],
    });
    expect(fields.find(field => field.path === 'name')?.kind).toBe('text');
  });
});

describe('buildFieldSearchQuery', () => {
  const fields = listSearchableFields(schema);

  it('returns undefined for a blank term', () => {
    expect(buildFieldSearchQuery('   ', 'name', fields)).toBeUndefined();
  });

  it('contains-matches one text field', () => {
    expect(buildFieldSearchQuery('Ann', 'name', fields)).toEqual({
      name: { $ilike: '%Ann%' },
    });
  });

  it('passes regex-like input through as a literal contains term', () => {
    expect(buildFieldSearchQuery('a.b*', 'name', fields)).toEqual({
      name: { $ilike: '%a.b*%' },
    });
  });

  it('matches a number field only when the term is numeric', () => {
    expect(buildFieldSearchQuery('42', 'age', fields)).toEqual({ age: 42 });
    expect(buildFieldSearchQuery('nope', 'age', fields)).toEqual({
      $and: [{ _id: { $exists: true } }, { _id: { $exists: false } }],
    });
  });

  it('matches a boolean field from true or false', () => {
    expect(buildFieldSearchQuery('TRUE', 'active', fields)).toEqual({
      active: true,
    });
  });

  it('ORs every field that can match the term', () => {
    expect(buildFieldSearchQuery('42', undefined, fields)).toEqual({
      $or: [
        { name: { $ilike: '%42%' } },
        { age: 42 },
        { 'address.city': { $ilike: '%42%' } },
        { nickname: { $ilike: '%42%' } },
      ],
    });
  });

  it('matches _id exactly when the term is an id', () => {
    const id = '11111111-1111-4111-8111-111111111111';
    expect(buildFieldSearchQuery(id, '_id', fields)).toEqual({ _id: id });
    expect(buildFieldSearchQuery('ann', '_id', fields)).toEqual({
      $and: [{ _id: { $exists: true } }, { _id: { $exists: false } }],
    });
  });

  it('includes an exact id match when searching all fields', () => {
    const id = '507f1f77bcf86cd799439011';
    expect(buildFieldSearchQuery(id, undefined, fields)).toEqual({
      $or: [
        { _id: id },
        { name: { $ilike: `%${id}%` } },
        { 'address.city': { $ilike: `%${id}%` } },
        { nickname: { $ilike: `%${id}%` } },
      ],
    });
  });

  it('ignores a field that is not on the schema', () => {
    expect(buildFieldSearchQuery('Ann', 'missing', fields)).toEqual({
      $or: [
        { name: { $ilike: '%Ann%' } },
        { 'address.city': { $ilike: '%Ann%' } },
        { nickname: { $ilike: '%Ann%' } },
      ],
    });
  });
});

describe('buildDocumentListQuery', () => {
  it('ANDs the search with an existing filter', () => {
    expect(
      buildDocumentListQuery({
        filter: { status: 'open' },
        term: 'Ann',
        field: 'name',
        schema,
      })
    ).toEqual({
      $and: [{ status: 'open' }, { name: { $ilike: '%Ann%' } }],
    });
  });

  it('keeps a filter when the search box is empty', () => {
    expect(
      buildDocumentListQuery({
        filter: { status: 'open' },
        term: '',
        schema,
      })
    ).toEqual({ status: 'open' });
  });
});
