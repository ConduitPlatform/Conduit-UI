import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildEventRelayPreviewRequestBody,
  coerceEventRelayPreviewRemoteError,
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

  it('rethrows Next navigation errors for session redirect', () => {
    const redirectErr = Object.assign(new Error('NEXT_REDIRECT'), {
      digest: 'NEXT_REDIRECT;replace;/login?session-timeout=true',
    });
    assert.throws(
      () => coerceEventRelayPreviewRemoteError(redirectErr),
      redirectErr
    );
  });

  it('maps axios 404 to unavailable', () => {
    const result = coerceEventRelayPreviewRemoteError({
      response: { status: 404 },
    });
    assert.deepEqual(result, { status: 'unavailable' });
  });
});
