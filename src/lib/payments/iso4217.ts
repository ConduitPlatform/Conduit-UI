import { codes } from 'currency-codes';

const allowed = new Set(codes());

export function isValidIso4217Code(code: string | undefined | null): boolean {
  if (code === undefined || code === null) return false;
  const trimmed = code.trim();
  if (trimmed === '') return false;
  return allowed.has(trimmed.toUpperCase());
}
