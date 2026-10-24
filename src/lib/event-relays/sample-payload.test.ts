import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildDefaultSamplePayload } from './sample-payload.ts';

describe('default event relay sample payload', () => {
  it('uses documentId for database realtime paths', () => {
    const json = buildDefaultSamplePayload('documentId');
    assert.match(json, /"documentId"/);
    assert.doesNotMatch(json, /"_id"/);
  });

  it('uses _id for CRUD bus paths', () => {
    const json = buildDefaultSamplePayload('_id');
    assert.match(json, /"_id"/);
    assert.doesNotMatch(json, /"documentId"/);
  });
});
