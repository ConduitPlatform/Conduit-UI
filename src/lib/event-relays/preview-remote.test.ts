import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildEventRelayPreviewRequestBody,
  parseEventRelayPreviewResponse,
} from './preview-remote.ts';

describe('event relay preview remote contract', () => {
  it('builds the Admin API request body', () => {
    const body = buildEventRelayPreviewRequestBody({
      messageTemplate: { id: '{{payload.documentId}}' },
      samplePayload: { documentId: 'abc' },
    });
    assert.deepEqual(body, {
      messageTemplate: { id: '{{payload.documentId}}' },
      samplePayload: { documentId: 'abc' },
    });
    assert.equal('template' in body, false);
    assert.equal('sample' in body, false);
  });

  it('unwraps rendered from the Admin API response', () => {
    const rendered = parseEventRelayPreviewResponse({
      rendered: { id: 'abc', status: 'paid' },
    });
    assert.deepEqual(rendered, { id: 'abc', status: 'paid' });
  });

  it('rejects responses without rendered', () => {
    assert.throws(() => parseEventRelayPreviewResponse({ payload: {} }));
    assert.throws(() => parseEventRelayPreviewResponse(null));
  });
});
