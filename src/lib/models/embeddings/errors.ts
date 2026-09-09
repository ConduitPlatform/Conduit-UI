type AxiosLikeError = {
  response?: {
    status?: number;
    data?: unknown;
  };
  message?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAxiosLikeError(err: unknown): err is AxiosLikeError {
  return Boolean(err && typeof err === 'object' && 'response' in err);
}

function readBackendMessage(data: unknown): string | undefined {
  if (typeof data === 'string' && data.trim().length > 0) return data;
  if (!isRecord(data)) return undefined;
  if (typeof data.message === 'string' && data.message.trim().length > 0) {
    return data.message;
  }
  if (typeof data.error === 'string' && data.error.trim().length > 0) {
    return data.error;
  }
  if (isRecord(data.error) && typeof data.error.message === 'string') {
    const nested = data.error.message.trim();
    if (nested.length > 0) return nested;
  }
  return undefined;
}

export function isEmbeddingsNotFound(err: unknown): boolean {
  if (!isAxiosLikeError(err)) return false;
  return err.response?.status === 404;
}

export const EMBEDDINGS_SERVICE_UNAVAILABLE =
  'The embeddings service is temporarily unavailable. Check that workers are enabled and the provider is reachable, then retry.';

function readErrorMessage(err: unknown): string | undefined {
  if (isAxiosLikeError(err) && typeof err.message === 'string') {
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return undefined;
}

function isServiceUnavailable(err: unknown): boolean {
  if (isAxiosLikeError(err) && err.response?.status === 503) return true;
  const message = readErrorMessage(err);
  return typeof message === 'string' && /status code 503/.test(message);
}

export function formatEmbeddingsApiError(err: unknown): string {
  if (isServiceUnavailable(err)) return EMBEDDINGS_SERVICE_UNAVAILABLE;
  if (isAxiosLikeError(err)) {
    return (
      readBackendMessage(err.response?.data) ?? err.message ?? 'Request failed'
    );
  }
  return err instanceof Error ? err.message : 'Request failed';
}

export function settledValue<T>(
  result: PromiseSettledResult<T>
): T | undefined {
  return result.status === 'fulfilled' ? result.value : undefined;
}

export function settledError(
  result: PromiseSettledResult<unknown>
): string | undefined {
  if (result.status !== 'rejected') return undefined;
  return formatEmbeddingsApiError(result.reason);
}
