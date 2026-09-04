import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { lookupOwnPath } from './path.ts';
import { renderMessageTemplate } from './template.ts';
import { previewEventRelay } from './preview.ts';

describe('event relay preview helpers', () => {
  it('resolves the resource id and rendered payload', () => {
    const result = previewEventRelay({
      resourceIdPath: '_id',
      messageTemplate: { id: '{{payload._id}}', status: '{{payload.status}}' },
      samplePayload: { _id: 'order-1', status: 'paid' },
    });
    assert.equal(result.error, undefined);
    assert.equal(result.resourceId, 'order-1');
    assert.deepEqual(result.payload, { id: 'order-1', status: 'paid' });
  });

  it('fails closed on missing fields and prototype paths', () => {
    assert.equal(lookupOwnPath({ a: 1 }, 'b'), undefined);
    assert.throws(() =>
      renderMessageTemplate({ x: '{{payload.missing}}' }, {})
    );
    const preview = previewEventRelay({
      resourceIdPath: '__proto__',
      messageTemplate: { id: '{{payload._id}}' },
      samplePayload: { _id: '1' },
    });
    assert.equal(typeof preview.error, 'string');
  });
});
