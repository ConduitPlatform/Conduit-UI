import { lookupOwnPath, MAX_TEMPLATE_BYTES } from './path.ts';

const PLACEHOLDER = /\{\{\s*payload\.([A-Za-z_][A-Za-z0-9_.]*)\s*\}\}/g;
const EXACT_PLACEHOLDER = /^\{\{\s*payload\.([A-Za-z_][A-Za-z0-9_.]*)\s*\}\}$/;
const MAX_DEPTH = 10;

export function renderMessageTemplate(
  template: unknown,
  payload: unknown
): unknown {
  const serialized = JSON.stringify(template);
  if (!serialized || serialized.length > MAX_TEMPLATE_BYTES) {
    throw new Error('Message template is invalid or too large');
  }
  return renderValue(template, payload, 0);
}

function renderValue(value: unknown, payload: unknown, depth: number): unknown {
  if (depth > MAX_DEPTH) {
    throw new Error('Message template is nested too deeply');
  }
  if (typeof value === 'string') {
    return interpolateString(value, payload);
  }
  if (Array.isArray(value)) {
    return value.map(item => renderValue(item, payload, depth + 1));
  }
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const output: Record<string, unknown> = {};
    for (const key of Object.keys(record)) {
      output[key] = renderValue(record[key], payload, depth + 1);
    }
    return output;
  }
  return value;
}

function interpolateString(value: string, payload: unknown): unknown {
  const exact = value.trim().match(EXACT_PLACEHOLDER);
  if (exact) {
    const resolved = lookupOwnPath(payload, exact[1]);
    if (resolved === undefined) {
      throw new Error(`Placeholder payload.${exact[1]} was not found`);
    }
    return resolved;
  }

  return value.replace(PLACEHOLDER, (_match, path: string) => {
    const resolved = lookupOwnPath(payload, path);
    if (resolved === undefined) {
      throw new Error(`Placeholder payload.${path} was not found`);
    }
    if (resolved === null || typeof resolved !== 'object') {
      return String(resolved);
    }
    return JSON.stringify(resolved);
  });
}
