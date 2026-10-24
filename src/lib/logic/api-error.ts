type AxiosResponseBody =
  | { message?: string; error?: string; name?: string }
  | string;

type AxiosLikeError = {
  response?: {
    status?: number;
    data?: AxiosResponseBody;
  };
  message?: string;
};

function readResponseBody(
  err: unknown
): { status?: number; data?: AxiosResponseBody } | undefined {
  for (const candidate of collectErrorChain(err)) {
    if (!isAxiosLikeError(candidate) || !candidate.response) continue;
    return candidate.response;
  }
  return undefined;
}

function readResponseMessage(
  data: AxiosResponseBody | undefined
): string | undefined {
  if (!data || typeof data === 'string') return undefined;
  if (data.message) return data.message;
  if (data.error) return data.error;
  return undefined;
}

function isRouterHtmlNotFound(data: AxiosResponseBody | undefined): boolean {
  return (
    typeof data === 'string' && /Cannot (GET|POST|PATCH|DELETE)/.test(data)
  );
}

export function isAxiosLikeError(err: unknown): err is AxiosLikeError {
  return Boolean(err && typeof err === 'object' && 'response' in err);
}

function collectErrorChain(err: unknown): unknown[] {
  const chain: unknown[] = [];
  const seen = new Set<unknown>();
  let current: unknown = err;
  while (current !== undefined && current !== null && !seen.has(current)) {
    seen.add(current);
    chain.push(current);
    if (typeof current !== 'object' || !('cause' in current)) {
      break;
    }
    current = (current as { cause?: unknown }).cause;
  }
  return chain;
}

export function getAxiosResponseStatus(err: unknown): number | undefined {
  for (const candidate of collectErrorChain(err)) {
    if (!isAxiosLikeError(candidate)) continue;
    const status = candidate.response?.status;
    if (status !== undefined) return status;
  }
  return undefined;
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
    const message = readResponseMessage(data);
    if (message) return message;
    if (data && typeof data !== 'string' && data.name && err.response?.status) {
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

const MISSING_TEMPLATE_ROUTE_MESSAGE =
  'Template routes returned 404. They are served by the Admin API when the communications module is running.';

function formatMissingTemplateRoute(
  err: unknown,
  fallback: string
): string | undefined {
  if (getAxiosResponseStatus(err) !== 404) return undefined;
  const data = readResponseBody(err)?.data;
  if (isRouterHtmlNotFound(data)) return MISSING_TEMPLATE_ROUTE_MESSAGE;
  const apiMessage = readResponseMessage(data);
  if (apiMessage) return apiMessage;
  return fallback;
}

export function formatCommunicationsApiError(err: unknown): string {
  const missingRoute = formatMissingTemplateRoute(
    err,
    'Unified templates API unavailable. This Conduit build needs CommunicationTemplate admin routes.'
  );
  if (missingRoute) return missingRoute;
  if (isAxiosLikeError(err)) {
    return formatAdminApiError(err);
  }
  return err instanceof Error ? err.message : 'Request failed';
}

export function formatEmailTemplatesApiError(err: unknown): string {
  const missingRoute = formatMissingTemplateRoute(
    err,
    'The Admin API returned 404 for GET /email/templates. The communications module needs to be serving email template routes.'
  );
  if (missingRoute) return missingRoute;
  if (isAxiosLikeError(err)) {
    return (
      readResponseMessage(err.response?.data) ??
      err.message ??
      'Failed to load email templates'
    );
  }
  return err instanceof Error ? err.message : 'Failed to load email templates';
}
