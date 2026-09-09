import { describe, expect, it } from 'vitest';
import {
  EMBEDDINGS_REQUEST_FAILED,
  EMBEDDINGS_SERVICE_UNAVAILABLE,
  formatEmbeddingsApiError,
  isEmbeddingsNotFound,
} from './errors';

describe('formatEmbeddingsApiError', () => {
  it('maps HTTP statuses to stable operator copy', () => {
    expect(
      formatEmbeddingsApiError({
        response: { status: 400, data: { message: 'Index is not queryable' } },
        message: 'Request failed with status code 400',
      })
    ).toBe('The request was rejected. Check the values and try again.');
    expect(
      formatEmbeddingsApiError({
        response: { status: 404, data: { error: 'missing' } },
      })
    ).toBe('The requested embeddings resource was not found.');
    expect(
      formatEmbeddingsApiError({
        response: { status: 500, data: { error: { message: 'stack at fn' } } },
      })
    ).toBe(EMBEDDINGS_SERVICE_UNAVAILABLE);
    expect(
      formatEmbeddingsApiError({
        response: { data: {} },
        message: 'Network Error',
      })
    ).toBe(EMBEDDINGS_REQUEST_FAILED);
    expect(
      formatEmbeddingsApiError({
        response: { status: 503, data: { message: 'Provider request failed' } },
        message: 'Request failed with status code 503',
      })
    ).toBe(EMBEDDINGS_SERVICE_UNAVAILABLE);
    expect(
      formatEmbeddingsApiError(new Error('Request failed with status code 503'))
    ).toBe(EMBEDDINGS_SERVICE_UNAVAILABLE);
  });

  it('keeps operator-safe thrown messages and hides internals', () => {
    expect(
      formatEmbeddingsApiError(new Error('Filter must be a JSON object.'))
    ).toBe('Filter must be a JSON object.');
    expect(
      formatEmbeddingsApiError(new Error('ECONNREFUSED 127.0.0.1:5512'))
    ).toBe(EMBEDDINGS_REQUEST_FAILED);
    expect(formatEmbeddingsApiError('nope')).toBe(EMBEDDINGS_REQUEST_FAILED);
  });
});

describe('isEmbeddingsNotFound', () => {
  it('detects axios-like 404 responses only', () => {
    expect(isEmbeddingsNotFound({ response: { status: 404 } })).toBe(true);
    expect(isEmbeddingsNotFound({ response: { status: 400 } })).toBe(false);
    expect(isEmbeddingsNotFound(new Error('missing'))).toBe(false);
  });
});
