import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseLogSummary } from './utils.ts';

describe('parseLogSummary', () => {
  it('parses an HTTP request summary', () => {
    assert.deepEqual(parseLogSummary('GET /config/router 200 13ms'), {
      type: 'http',
      method: 'GET',
      path: '/config/router',
      statusCode: 200,
      duration: '13ms',
    });
  });

  it('preserves query strings and alternative duration units', () => {
    assert.deepEqual(
      parseLogSummary(
        'PATCH /database/records/abc-123?populate=owner%2Cteam 204 1.24s'
      ),
      {
        type: 'http',
        method: 'PATCH',
        path: '/database/records/abc-123?populate=owner%2Cteam',
        statusCode: 204,
        duration: '1.24s',
      }
    );
  });

  it('returns non-HTTP messages without altering them', () => {
    const message = 'Worker completed scheduled cleanup in 8 batches';

    assert.deepEqual(parseLogSummary(message), {
      type: 'text',
      text: message,
    });
  });
});
