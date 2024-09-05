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
