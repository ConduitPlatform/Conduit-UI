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
    ).toBe('Index is not queryable');
    expect(
      formatEmbeddingsApiError({
        response: {
          status: 400,
          data: { message: 'Storage authorization is not configured.' },
        },
        message: 'Request failed with status code 400',
      })
    ).toBe('Storage authorization is not configured.');
    expect(
      formatEmbeddingsApiError({
        response: {
          status: 400,
          data: { message: 'ECONNREFUSED 127.0.0.1:5512' },
        },
        message: 'Request failed with status code 400',
      })
    ).toBe('The request was rejected. Check the values and try again.');
    expect(
      formatEmbeddingsApiError({
        response: {
          status: 412,
          data: { message: 'Schema is not extendable' },
        },
      })
    ).toBe('Schema is not extendable');
    expect(
      formatEmbeddingsApiError({
        response: { status: 412, data: {} },
      })
    ).toBe('The request was rejected. Check the values and try again.');
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
      formatEmbeddingsApiError(
        new Error(
          "Field 'embedding' already exists on schema 'Article' and is not a compatible embeddings extension"
        )
      )
    ).toBe(
      "Field 'embedding' already exists on schema 'Article' and is not a compatible embeddings extension"
    );
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
