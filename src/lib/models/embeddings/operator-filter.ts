export const FILTER_COMPARISON_OPERATORS = [
  '$eq',
  '$ne',
  '$gt',
  '$gte',
  '$lt',
  '$lte',
] as const;

export const FILTER_MEMBERSHIP_OPERATORS = ['$in', '$nin'] as const;

export const FILTER_LOGICAL_OPERATORS = ['$and'] as const;

export const MAX_FILTER_DEPTH = 3;
export const MAX_FILTER_KEYS = 16;
export const MAX_FILTER_IN_VALUES = 32;
export const MAX_FILTER_AND_BRANCHES = 8;
export const MAX_FILTER_CHARS = 4 * 1024;

export const FILTER_UNSAFE_MESSAGE =
  'Filter allows equality, comparisons, bounded $in/$nin, and $and only.';

const FILTER_FIELD = /^[A-Za-z_][A-Za-z0-9_]*$/;
const FILTER_RESERVED_FIELDS = new Set([
  '__proto__',
  'prototype',
  'constructor',
]);

export type FilterParseResult =
  | { ok: true; filter?: Record<string, unknown> }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFilterScalar(value: unknown): boolean {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

function isSafeFilterFieldName(field: string): boolean {
  return (
    FILTER_FIELD.test(field) &&
    !field.startsWith('$') &&
    !FILTER_RESERVED_FIELDS.has(field)
  );
}

function isComparisonOperator(
  operator: string
): operator is (typeof FILTER_COMPARISON_OPERATORS)[number] {
  return (FILTER_COMPARISON_OPERATORS as readonly string[]).includes(operator);
}

function isMembershipOperator(
  operator: string
): operator is (typeof FILTER_MEMBERSHIP_OPERATORS)[number] {
  return (FILTER_MEMBERSHIP_OPERATORS as readonly string[]).includes(operator);
}

function isSafeComparisonOperand(
  operator: string,
  comparison: unknown
): boolean {
  if (operator === '$eq' || operator === '$ne') {
    return isFilterScalar(comparison);
  }
  return typeof comparison === 'number' || typeof comparison === 'string';
}

function isSafeMembershipOperand(items: unknown): boolean {
  return (
    Array.isArray(items) &&
    items.length <= MAX_FILTER_IN_VALUES &&
    items.every(isFilterScalar)
  );
}

function isSafePredicate(value: unknown, depth: number): boolean {
  if (depth > MAX_FILTER_DEPTH) return false;
  if (isFilterScalar(value)) return true;
  if (!isRecord(value)) return false;
  if (Object.getPrototypeOf(value) !== Object.prototype) return false;
  const operators = Object.keys(value);
  if (!operators.length || operators.length > MAX_FILTER_KEYS) return false;
  for (const operator of operators) {
    if (isComparisonOperator(operator)) {
      if (!isSafeComparisonOperand(operator, value[operator])) return false;
      continue;
    }
    if (isMembershipOperator(operator)) {
      if (!isSafeMembershipOperand(value[operator])) return false;
      continue;
    }
    return false;
  }
  return true;
}

export function isSafeOperatorFilter(value: unknown, depth = 1): boolean {
  if (depth > MAX_FILTER_DEPTH) return false;
  if (!isRecord(value)) return false;
  if (Object.getPrototypeOf(value) !== Object.prototype) return false;
  const keys = Object.keys(value);
  if (keys.length > MAX_FILTER_KEYS) return false;
  for (const key of keys) {
    if (key === '$and') {
      const branches = value[key];
      if (
        !Array.isArray(branches) ||
        branches.length === 0 ||
        branches.length > MAX_FILTER_AND_BRANCHES
      ) {
        return false;
      }
      if (!branches.every(branch => isSafeOperatorFilter(branch, depth + 1))) {
        return false;
      }
      continue;
    }
    if (key.startsWith('$') || !isSafeFilterFieldName(key)) return false;
    if (!isSafePredicate(value[key], depth + 1)) return false;
  }
  return true;
}

export function parseOperatorFilterJson(raw: string): FilterParseResult {
  const trimmed = raw.trim();
  if (trimmed === '') return { ok: true, filter: undefined };
  if (trimmed.length > MAX_FILTER_CHARS) {
    return { ok: false, error: 'Filter is too large.' };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { ok: false, error: 'Filter is not valid JSON.' };
  }
  if (!isRecord(parsed)) {
    return { ok: false, error: 'Filter must be a JSON object.' };
  }
  if (!isSafeOperatorFilter(parsed)) {
    return { ok: false, error: FILTER_UNSAFE_MESSAGE };
  }
  return { ok: true, filter: parsed };
}
