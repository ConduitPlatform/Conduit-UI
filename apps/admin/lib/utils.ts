import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//checks if string objects have empty string or undefined as value
export const isObjectNotEmpty = <T extends Record<string, string | number>>(value: T): boolean => {
  for (const key in value) {
    if (typeof value[key] === 'string' && (value[key] === '' || value[key] === undefined)) {
      return false;
    }
  }
  return true;
};
