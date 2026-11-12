import { format, isValid } from 'date-fns';

const REGISTERED_EMPTY = '—';

function asDate(value: unknown): Date | undefined {
  if (value instanceof Date) return isValid(value) ? value : undefined;
  if (typeof value !== 'string' && typeof value !== 'number') return undefined;
  if (value === '') return undefined;
  const date = new Date(value);
  return isValid(date) ? date : undefined;
}

/** `PP` date, or an em dash when the row has no usable timestamp. */
export function formatRegistered(createdAt: unknown): string {
  const date = asDate(createdAt);
  return date ? format(date, 'PP') : REGISTERED_EMPTY;
}

/** Full ISO timestamp for the cell `title`. Absent when the date cannot be shown. */
export function registeredTitle(createdAt: unknown): string | undefined {
  return asDate(createdAt)?.toISOString();
}

export function statusLabel(active: boolean): 'Active' | 'Blocked' {
  return active ? 'Active' : 'Blocked';
}
