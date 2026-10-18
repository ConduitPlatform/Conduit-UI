import { isAxiosError } from 'axios';

/**
 * Typed result for server actions whose failures the UI must react to.
 *
 * Next.js strips the message of errors thrown from server actions in production
 * builds, so the backend's `conduitCode` (see the hermes REST error shape:
 * `{ name, status, message, conduitCode? }`) has to travel in the return value.
 *
 * This module is deliberately NOT a `'use server'` file: it exports types and sync
 * helpers. Server action files import `runAction` from here; client code imports only
 * the types and `unwrapActionResult`.
 */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; status?: number };

export type ActionFailure = Extract<ActionResult<never>, { ok: false }>;

/** Fallback codes when the response body carries no `conduitCode`. */
const STATUS_CODES: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHENTICATED',
  403: 'PERMISSION_DENIED',
  404: 'NOT_FOUND',
  409: 'ALREADY_EXISTS',
  412: 'FAILED_PRECONDITION',
  429: 'RESOURCE_EXHAUSTED',
};

function codeFromStatus(status: number | undefined): string {
  if (status === undefined) return 'NETWORK_ERROR';
  return STATUS_CODES[status] ?? (status >= 500 ? 'INTERNAL' : 'UNKNOWN');
}

/** Next.js control-flow errors (redirect, notFound) must keep propagating. */
function isNextControlFlowError(error: unknown): boolean {
  const digest = (error as { digest?: unknown } | null)?.digest;
  return typeof digest === 'string' && digest.startsWith('NEXT_');
}

/**
 * Runs a request and converts any axios failure into an `ActionFailure`, extracting
 * `conduitCode` and `message` from the response body (falling back to a code derived
 * from the HTTP status, then to `error.message`).
 */
export async function runAction<T>(
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    if (isAxiosError(error)) {
      const status = error.response?.status;
      const body = error.response?.data as
        | { conduitCode?: unknown; message?: unknown }
        | string
        | undefined;
      const record = typeof body === 'object' && body !== null ? body : {};
      const code =
        typeof record.conduitCode === 'string' && record.conduitCode !== ''
          ? record.conduitCode
          : codeFromStatus(status);
      const message =
        typeof record.message === 'string' && record.message !== ''
          ? record.message
          : error.message;
      return { ok: false, code, message, ...(status ? { status } : {}) };
    }
    return {
      ok: false,
      code: 'UNKNOWN',
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Error thrown by `unwrapActionResult`; keeps the code for callers that catch it. */
export class ActionError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = 'ActionError';
  }
}

/**
 * Client-side helper: returns `data` or throws an `ActionError` carrying the server
 * message. For call sites that only need to show the message (e.g. `useSettingsSave`).
 */
export function unwrapActionResult<T>(result: ActionResult<T>): T {
  if (result.ok) return result.data;
  throw new ActionError(result.code, result.message, result.status);
}
