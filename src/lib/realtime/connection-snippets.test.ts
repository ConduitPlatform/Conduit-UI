import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildAdminJavascriptSnippet,
  buildClientJavascriptSnippet,
  buildPostmanConnection,
  socketEndpoint,
  subscribePayload,
} from './connection-snippets.ts';

describe('subscribePayload', () => {
  it('scopes client authorized schemas to a document id', () => {
    assert.deepEqual(subscribePayload('Order', true), {
      schema: 'Order',
      documentId: '<documentId>',
    });
    assert.deepEqual(subscribePayload('Order', false), { schema: 'Order' });
  });
});

describe('buildClientJavascriptSnippet', () => {
  it('targets the schema namespace and subscribe payload', () => {
    const snippet = buildClientJavascriptSnippet({
      socketUrl: 'http://localhost:3001',
      schemaName: 'LiveUpdateProbe',
      documentScoped: false,
    });
    assert.match(snippet, /http:\/\/localhost:3001\/database\//);
    assert.match(snippet, /path: "\/realtime"/);
    assert.match(snippet, /"schema":"LiveUpdateProbe"/);
  });
});

describe('buildAdminJavascriptSnippet', () => {
  it('uses the admin socket origin', () => {
    const snippet = buildAdminJavascriptSnippet({
      socketUrl: 'http://localhost:3031',
      schemaName: 'LiveUpdateProbe',
    });
    assert.match(snippet, /http:\/\/localhost:3031\/database\//);
    assert.match(snippet, /adminToken/);
  });
});

describe('buildPostmanConnection', () => {
  it('matches the Socket.IO handshake used in Data Explorer', () => {
    const connection = buildPostmanConnection({
      adminSocketUrl: 'http://localhost:3031',
      schemaName: 'LiveUpdateProbe',
    });
    assert.equal(connection.serverUrl, 'http://localhost:3031/database/');
    assert.equal(connection.path, '/realtime');
    assert.equal(connection.clientVersion, 'v4');
    assert.equal(connection.subscribeEvent, 'subscribe');
    assert.match(connection.subscribeBody, /LiveUpdateProbe/);
    assert.deepEqual(
      connection.headers.map(header => header.key),
      ['masterkey', 'Authorization']
    );
  });
});

describe('socketEndpoint', () => {
  it('always ends with the database namespace', () => {
    assert.equal(
      socketEndpoint('http://localhost:3031/'),
      'http://localhost:3031/database/'
    );
  });
});
