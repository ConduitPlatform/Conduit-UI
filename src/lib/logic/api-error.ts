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

export function isNextNavigationError(err: unknown): boolean {
  if (!err || typeof err !== 'object' || !('digest' in err)) return false;
  const digest = (err as { digest?: string }).digest;
  if (typeof digest !== 'string') return false;
  return (
    digest.startsWith('NEXT_REDIRECT') || digest.startsWith('NEXT_NOT_FOUND')
  );
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
