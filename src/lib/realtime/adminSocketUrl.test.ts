import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  deriveAdminSocketUrl,
  deriveClientSocketUrl,
} from './adminSocketUrl.ts';

describe('deriveAdminSocketUrl', () => {
  it('uses an explicit socket URL when provided', () => {
    assert.equal(
      deriveAdminSocketUrl(
        'http://localhost:3030',
        'http://sockets.example:4000/'
      ),
      'http://sockets.example:4000'
    );
  });

  it('maps the default admin API port 3030 to 3031', () => {
    assert.equal(
      deriveAdminSocketUrl('http://localhost:3030'),
      'http://localhost:3031'
    );
  });

  it('keeps proxied origins that are not on port 3030', () => {
    assert.equal(
      deriveAdminSocketUrl('https://admin.example.com'),
      'https://admin.example.com'
    );
    assert.equal(
      deriveAdminSocketUrl('http://localhost:8080/v1'),
      'http://localhost:8080'
    );
  });
});

describe('deriveClientSocketUrl', () => {
  it('maps the default client API port 3000 to 3001', () => {
    assert.equal(
      deriveClientSocketUrl('http://localhost:3000'),
      'http://localhost:3001'
    );
  });

  it('maps standalone router hostUrl on 3030 to client socket 3001', () => {
    assert.equal(
      deriveClientSocketUrl('http://localhost:3030'),
      'http://localhost:3001'
    );
  });

  it('keeps proxied client origins that are not on port 3000', () => {
    assert.equal(
      deriveClientSocketUrl('https://api.example.com'),
      'https://api.example.com'
    );
  });
});
