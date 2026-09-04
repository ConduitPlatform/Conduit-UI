export const RESERVED_SOCKET_EVENTS = new Set([
  'connect',
  'disconnect',
  'connect_error',
  'error',
  'join-room',
  'leave-room',
  'conduit_error',
  'subscribe',
  'unsubscribe',
  'ping',
  'pong',
]);

export const FORBIDDEN_PATH_SEGMENTS = new Set([
  '__proto__',
  'constructor',
  'prototype',
]);

export const MAX_PATH_SEGMENTS = 8;
export const MAX_TEMPLATE_BYTES = 16 * 1024;

const PATH_SEGMENT = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function parseDotPath(path: string): string[] {
  const trimmed = path.trim();
  if (!trimmed) {
    throw new Error('Path is required');
  }
  const segments = trimmed.split('.');
  if (segments.length > MAX_PATH_SEGMENTS) {
    throw new Error(`Path exceeds ${MAX_PATH_SEGMENTS} segments`);
  }
  for (const segment of segments) {
    if (FORBIDDEN_PATH_SEGMENTS.has(segment) || !PATH_SEGMENT.test(segment)) {
      throw new Error('Path contains an invalid segment');
    }
  }
  return segments;
}

export function lookupOwnPath(source: unknown, path: string): unknown {
  const segments = parseDotPath(path);
  let current: unknown = source;
  for (const segment of segments) {
    if (current === null || typeof current !== 'object') {
      return undefined;
    }
    if (!Object.prototype.hasOwnProperty.call(current, segment)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}
