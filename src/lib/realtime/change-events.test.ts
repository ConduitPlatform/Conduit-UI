import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  parseDatabaseChangeEvent,
  shouldCountChange,
} from './change-events.ts';

const validEvent = {
  version: 1,
  operation: 'insert',
  schema: 'Order',
  documentId: '64b64c4c4c4c4c4c4c4c4c4c',
  occurredAt: '2026-01-02T00:00:00.000Z',
  resumeToken: '{"_data":"token"}',
};

describe('parseDatabaseChangeEvent', () => {
  it('accepts a metadata-only payload', () => {
    assert.deepEqual(parseDatabaseChangeEvent(validEvent), validEvent);
    assert.deepEqual(
      parseDatabaseChangeEvent(JSON.stringify(validEvent)),
      validEvent
    );
  });

  it('rejects document fields, wrong versions, and malformed payloads', () => {
    assert.equal(parseDatabaseChangeEvent(null), null);
    assert.equal(parseDatabaseChangeEvent('{'), null);
    assert.equal(parseDatabaseChangeEvent({ ...validEvent, version: 2 }), null);
    assert.equal(
      parseDatabaseChangeEvent({ ...validEvent, operation: 'drop' }),
      null
    );
    assert.equal(parseDatabaseChangeEvent({ ...validEvent, schema: '' }), null);
  });
});

describe('shouldCountChange', () => {
  it('counts only events for the subscribed schema', () => {
    const event = parseDatabaseChangeEvent(validEvent)!;
    assert.equal(shouldCountChange(event, 'Order'), true);
    assert.equal(shouldCountChange(event, 'User'), false);
  });
});
