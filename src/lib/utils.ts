import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createQueryString = (
  queryParams: { name: string; value: string }[],
  current?: string
) => {
  const params = new URLSearchParams(current);
  for (const p of queryParams) {
    params.set(p.name, p.value);
  }
  return params.toString();
};

/**
 * Converts cents to dollars and formats as currency string
 * @param cents - Amount in cents
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCentsToCurrency(
  cents: number,
  currency: string = 'USD'
): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(dollars);
}

/**
 * Converts dollars to cents for storage
 * @param dollars - Amount in dollars
 * @returns Amount in cents
 */
export function convertDollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Formats minor units (cents) as a major-unit string for editable price fields (initial value only).
 */
export function formatCentsToMajorString(cents: number): string {
  if (!Number.isFinite(cents)) return '';
  return (cents / 100).toFixed(2);
}

/**
 * Parses user-typed decimals for price, VAT %, etc.
 * Supports 9.99, 9,99, 1.234,56 (EU), 1,234.56 (US).
 * Returns null for empty or unparseable input.
 */
export function parseMoneyInputString(input: string): number | null {
  let s = input.trim().replace(/\s/g, '');
  if (s === '') return null;

  const commaCount = (s.match(/,/g) ?? []).length;
  const dotCount = (s.match(/\./g) ?? []).length;

  if (commaCount > 0 && dotCount > 0) {
    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');
    if (lastComma > lastDot) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (commaCount > 0 && dotCount === 0) {
    if (commaCount > 1) {
      s = s.replace(/,/g, '');
    } else {
      const parts = s.split(',');
      const a = parts[0];
      const b = parts[1];
      if (b === undefined) return null;
      if (b.length === 3 && /^\d+$/.test(a) && /^\d{3}$/.test(b)) {
        s = a + b;
      } else {
        s = `${a}.${b}`;
      }
    }
  } else if (dotCount > 1) {
    const last = s.lastIndexOf('.');
    s = s.slice(0, last).replace(/\./g, '') + '.' + s.slice(last + 1);
  }

  const n = Number.parseFloat(s);
  if (Number.isNaN(n)) return null;
  return n;
}
