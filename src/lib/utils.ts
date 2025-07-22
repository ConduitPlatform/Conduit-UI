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
