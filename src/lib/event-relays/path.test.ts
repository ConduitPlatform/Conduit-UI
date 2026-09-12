import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { lookupOwnPath, parseDotPath } from './path.ts';

describe('event relay path helpers', () => {
  it('resolves dot paths on own properties only', () => {
    assert.deepEqual(parseDotPath('documentId'), ['documentId']);
    assert.equal(lookupOwnPath({ documentId: 'abc' }, 'documentId'), 'abc');
    assert.equal(lookupOwnPath({ a: 1 }, 'b'), undefined);
  });

  it('rejects prototype paths', () => {
    assert.throws(() => parseDotPath('__proto__'));
    assert.throws(() => parseDotPath('constructor'));
  });
});
