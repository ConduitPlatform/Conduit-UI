import { format } from 'date-fns';
import { describe, expect, it } from 'vitest';
import {
  formatRegistered,
  registeredTitle,
  statusLabel,
} from '@/lib/authentication/userColumns';

describe('user column formatters', () => {
  it('formats a registered date and titles it with the ISO timestamp', () => {
    const createdAt = '2026-01-15T15:00:00.000Z';
    expect(formatRegistered(createdAt)).toBe(format(new Date(createdAt), 'PP'));
    expect(formatRegistered(createdAt)).not.toBe('—');
    expect(registeredTitle(createdAt)).toBe(new Date(createdAt).toISOString());
  });

  it('renders an em dash for a missing or invalid date', () => {
    expect(formatRegistered(undefined)).toBe('—');
    expect(formatRegistered(null)).toBe('—');
    expect(formatRegistered('')).toBe('—');
    expect(formatRegistered('not-a-date')).toBe('—');
    expect(registeredTitle('not-a-date')).toBeUndefined();
  });

  it('names active and blocked accounts', () => {
    expect(statusLabel(true)).toBe('Active');
    expect(statusLabel(false)).toBe('Blocked');
  });
});
