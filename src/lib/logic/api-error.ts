type AxiosLikeError = {
  response?: {
    status?: number;
    data?: { message?: string; error?: string; name?: string };
  };
  message?: string;
};

export function isAxiosLikeError(err: unknown): err is AxiosLikeError {
  return Boolean(err && typeof err === 'object' && 'response' in err);
}

export function getAxiosResponseStatus(err: unknown): number | undefined {
  if (!isAxiosLikeError(err)) return undefined;
  return err.response?.status;
}

export function isAxiosNotFoundError(err: unknown): boolean {
  return getAxiosResponseStatus(err) === 404;
}

function errorDigest(err: unknown): string | undefined {
  if (!err || typeof err !== 'object' || !('digest' in err)) return undefined;
  const digest = (err as { digest?: unknown }).digest;
  return typeof digest === 'string' ? digest : undefined;
}

export function isNextNavigationError(err: unknown): boolean {
  const digest = errorDigest(err);
  if (!digest) return false;
  return (
    digest.startsWith('NEXT_REDIRECT') ||
    digest.startsWith('NEXT_NOT_FOUND') ||
    digest.startsWith('NEXT_HTTP_ERROR_FALLBACK')
  );
}

const DYNAMIC_RENDERING_DIGESTS = new Set([
  'DYNAMIC_SERVER_USAGE',
  'BAILOUT_TO_CLIENT_SIDE_RENDERING',
  'HANGING_PROMISE_REJECTION',
  'NEXT_PRERENDER_INTERRUPTED',
]);

function isDynamicRenderingError(err: unknown): boolean {
  const digest = errorDigest(err);
  if (digest && DYNAMIC_RENDERING_DIGESTS.has(digest)) return true;
  if (!err || typeof err !== 'object' || !('message' in err)) return false;
  const message = (err as { message?: unknown }).message;
  if (typeof message !== 'string') return false;
  return (
    message.includes(
      'needs to bail out of prerendering at this point because it used'
    ) &&
    message.includes(
      'Learn more: https://nextjs.org/docs/messages/ppr-caught-error'
    )
  );
}

/**
 * Next.js interrupts rendering with special errors (`redirect`, `notFound`,
 * `cookies()` during static generation). Callers that translate failures into
 * plain `Error`s must rethrow these first, or `next build` treats the route
 * as a failed prerender.
 */
export function rethrowNextControlFlowError(err: unknown): void {
  if (isNextNavigationError(err) || isDynamicRenderingError(err)) throw err;
  if (err instanceof Error && err.cause !== undefined) {
    rethrowNextControlFlowError(err.cause);
  }
}

export function formatAdminApiError(err: unknown): string {
  if (isAxiosLikeError(err)) {
    const data = err.response?.data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (data?.name && err.response?.status) {
      return `${data.name} (${err.response.status})`;
    }
    return err.message ?? 'Request failed';
  }
  return err instanceof Error ? err.message : 'Request failed';
}

export async function withAdminApiError<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    rethrowNextControlFlowError(err);
    throw new Error(formatAdminApiError(err));
  }
}

export function formatCommunicationsApiError(err: unknown): string {
  if (isAxiosLikeError(err)) {
    if (err.response?.status === 404) {
      return 'Unified templates API not available — upgrade Conduit to a build that includes CommunicationTemplate CRUD';
    }
    return formatAdminApiError(err);
  }
  return err instanceof Error ? err.message : 'Request failed';
}

export function formatEmailTemplatesApiError(err: unknown): string {
  if (isAxiosLikeError(err)) {
    return (
      err.response?.data?.message ??
      err.message ??
      'Failed to load email templates'
    );
  }
  return err instanceof Error ? err.message : 'Failed to load email templates';
}
