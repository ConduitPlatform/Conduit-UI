import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { deriveAdminSocketUrl } from './adminSocketUrl.ts';

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
