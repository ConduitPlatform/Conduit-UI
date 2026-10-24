import {
  formatAdminApiError,
  isAxiosNotFoundError,
  isNextNavigationError,
} from '../logic/api-error.ts';
import type { EventRelayPreviewRemoteResult } from '../models/Router.ts';

export type EventRelayPreviewInput = {
  messageTemplate: unknown;
  samplePayload: unknown;
};

export type EventRelayPreviewRequestBody = {
  messageTemplate: unknown;
  samplePayload: unknown;
};

export type EventRelayPreviewResponseBody = {
  rendered: unknown;
};

export function buildEventRelayPreviewRequestBody(
  input: EventRelayPreviewInput
): EventRelayPreviewRequestBody {
  return {
    messageTemplate: input.messageTemplate,
    samplePayload: input.samplePayload,
  };
}

export function parseEventRelayPreviewResponse(
  data: unknown
): EventRelayPreviewResponseBody['rendered'] {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Preview response is invalid');
  }
  const record = data as Record<string, unknown>;
  if (!('rendered' in record)) {
    throw new Error('Preview response is missing rendered');
  }
  return record.rendered;
}

export function coerceEventRelayPreviewRemoteError(
  err: unknown
): EventRelayPreviewRemoteResult {
  if (isNextNavigationError(err)) {
    throw err;
  }
  if (isAxiosNotFoundError(err)) {
    return { status: 'unavailable' };
  }
  if (err instanceof Error && err.message.startsWith('Preview response')) {
    return { status: 'error', message: err.message };
  }
  return { status: 'error', message: formatAdminApiError(err) };
}
