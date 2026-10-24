import moment from 'moment';

/** Stringify a value for React children / controlled inputs. */
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

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (typeof value === 'object') {
    const record = value as { $date?: unknown; $oid?: unknown };

    if (record.$date != null) {
      return moment(record.$date as string | number | Date).format(
        'MMM D, YYYY HH:mm'
      );
    }

    if (typeof record.$oid === 'string') {
      return record.$oid;
    }

    if (Array.isArray(value)) {
      return `[${value.length} items]`;
    }

    return JSON.stringify(value);
  }

  return String(value);
}

/** Compact table-cell label (truncates long JSON). */
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

/** Coerce schema field defaults into text-input strings. */
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
  return JSON.stringify(value);
}
