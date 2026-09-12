import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isAxiosNotFoundError } from './api-error.ts';

describe('isAxiosNotFoundError', () => {
  it('detects 404 on the error or its cause chain', () => {
    const axios404 = { response: { status: 404 } };
    assert.equal(isAxiosNotFoundError(axios404), true);
    assert.equal(
      isAxiosNotFoundError(
        Object.assign(new Error('Server Components render'), { cause: axios404 })
      ),
      true
    );
    assert.equal(isAxiosNotFoundError({ response: { status: 500 } }), false);
  });
});
