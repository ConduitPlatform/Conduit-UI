import { describe, expect, it } from 'vitest';
import { formatEmbeddingsApiError, isEmbeddingsNotFound } from './errors';

describe('formatEmbeddingsApiError', () => {
  it('prefers backend message, then error, then the request message', () => {
    expect(
      formatEmbeddingsApiError({
        response: { data: { message: 'Index is not queryable' } },
        message: 'Request failed with status code 400',
      })
    ).toBe('Index is not queryable');
    expect(
      formatEmbeddingsApiError({
        response: { data: { error: 'Provider timeout' } },
      })
    ).toBe('Provider timeout');
    expect(
      formatEmbeddingsApiError({
        response: { data: { error: { message: 'Nested failure' } } },
      })
    ).toBe('Nested failure');
    expect(
      formatEmbeddingsApiError({
        response: { data: 'Plain body' },
      })
    ).toBe('Plain body');
    expect(
      formatEmbeddingsApiError({
        response: { data: {} },
        message: 'Network Error',
      })
    ).toBe('Network Error');
    expect(formatEmbeddingsApiError(new Error('boom'))).toBe('boom');
    expect(formatEmbeddingsApiError('nope')).toBe('Request failed');
  });
});

describe('isEmbeddingsNotFound', () => {
  it('detects axios-like 404 responses only', () => {
    expect(isEmbeddingsNotFound({ response: { status: 404 } })).toBe(true);
    expect(isEmbeddingsNotFound({ response: { status: 400 } })).toBe(false);
    expect(isEmbeddingsNotFound(new Error('missing'))).toBe(false);
  });
});
