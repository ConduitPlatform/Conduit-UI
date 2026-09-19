import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildEventRelayClientSnippet,
  EVENT_RELAY_DOCS_SNIPPET,
} from './client-snippet.ts';

describe('event relay client snippet', () => {
  it('uses auth.token and subscribe on connect', () => {
    const snippet = buildEventRelayClientSnippet('order-updated');
    assert.match(snippet, /auth:\s*\{\s*token:\s*accessToken\s*\}/);
    assert.match(snippet, /socket\.on\('connect',\s*\(\)\s*=>\s*\{/);
    assert.match(snippet, /socket\.emit\('subscribe',\s*relayId,\s*resourceId\)/);
    assert.match(snippet, /socket\.on\('order-updated',\s*payload\s*=>\s*\{\}\)/);
  });

  it('does not use extraHeaders or a live-path unsubscribe', () => {
    for (const snippet of [
      buildEventRelayClientSnippet('x'),
      EVENT_RELAY_DOCS_SNIPPET,
    ]) {
      assert.equal(snippet.includes('extraHeaders'), false);
      assert.equal(snippet.includes("emit('unsubscribe'"), false);
    }
  });
});
