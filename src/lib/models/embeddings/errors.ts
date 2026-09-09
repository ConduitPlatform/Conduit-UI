type AxiosLikeError = {
  response?: {
    status?: number;
    data?: unknown;
  };
  message?: string;
};

function isAxiosLikeError(err: unknown): err is AxiosLikeError {
  return Boolean(err && typeof err === 'object' && 'response' in err);
}

export function isEmbeddingsNotFound(err: unknown): boolean {
  if (!isAxiosLikeError(err)) return false;
  return err.response?.status === 404;
}

export const EMBEDDINGS_SERVICE_UNAVAILABLE =
  'The embeddings service is temporarily unavailable. Check that workers are enabled and the provider is reachable, then retry.';

export const EMBEDDINGS_REQUEST_FAILED =
  'The request failed. Retry, or check embeddings settings.';

function operatorErrorForStatus(status: number | undefined): string {
  switch (status) {
    case 400:
      return 'The request was rejected. Check the values and try again.';
    case 401:
      return 'Sign in again to continue.';
    case 403:
      return 'You do not have permission for this action.';
    case 404:
      return 'The requested embeddings resource was not found.';
    case 409:
      return 'This embeddings resource changed. Refresh and try again.';
    case 413:
      return 'The request is too large.';
    case 429:
      return 'Too many embeddings requests. Wait and retry.';
    case 500:
    case 502:
    case 503:
    case 504:
      return EMBEDDINGS_SERVICE_UNAVAILABLE;
    default:
      return EMBEDDINGS_REQUEST_FAILED;
  }
}

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

function isOperatorSafeMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed || trimmed.length > 240) return false;
  if (/[\n\r]/.test(trimmed)) return false;
  if (/\/(Users|home|var|tmp|src|node_modules)\b/i.test(trimmed)) return false;
  if (/\bat\s+\S+\s+\(/.test(trimmed)) return false;
  if (/status code \d+/i.test(trimmed)) return false;
  if (/ECONNREFUSED|ENOTFOUND|ECONNRESET|ETIMEDOUT/i.test(trimmed))
    return false;
  if (/\b(stack|trace)\b/i.test(trimmed)) return false;
  return true;
}

export function formatEmbeddingsApiError(err: unknown): string {
  if (isServiceUnavailable(err)) return EMBEDDINGS_SERVICE_UNAVAILABLE;
  if (isAxiosLikeError(err)) {
    return operatorErrorForStatus(err.response?.status);
  }
  if (err instanceof Error && isOperatorSafeMessage(err.message)) {
    return err.message;
  }
  return EMBEDDINGS_REQUEST_FAILED;
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
