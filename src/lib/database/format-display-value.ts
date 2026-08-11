import moment from 'moment';

/**
 * Coerce arbitrary document/schema values into a string safe to render as a
 * React child or controlled input value. Prevents React error #31 when APIs
 * return nested objects (e.g. `{ startDate, endDate, nights }`).
 */
export function formatDisplayValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
      const parsed = moment(value);
      return parsed.isValid() ? parsed.format('MMM D, YYYY HH:mm') : value;
    }
    return value;
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;

    if (record.$date != null) {
      return moment(record.$date as moment.MomentInput).format(
        'MMM D, YYYY HH:mm'
      );
    }

    if (typeof record.$oid === 'string') {
      return record.$oid;
    }

    if (Array.isArray(value)) {
      return `[${value.length} items]`;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return Object.prototype.toString.call(value);
    }
  }

  return String(value);
}

/** Compact label for table cells (truncates long JSON). */
export function formatCellDisplayValue(value: unknown, maxLength = 50): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  const formatted = formatDisplayValue(value);
  if (formatted.length <= maxLength) {
    return formatted;
  }
  return `${formatted.substring(0, maxLength)}...`;
}

/** Normalize schema field defaults for text inputs. */
export function normalizeFieldDefault(value: unknown): string | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
