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

export function formatEmbeddingsApiError(err: unknown): string {
  if (isAxiosLikeError(err)) {
    return (
      readBackendMessage(err.response?.data) ?? err.message ?? 'Request failed'
    );
  }
  return err instanceof Error ? err.message : 'Request failed';
}
