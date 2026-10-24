import { describe, expect, it } from 'vitest';
import { getServerPageCount } from './data-table-pagination';

describe('getServerPageCount', () => {
  it('keeps Next on page 1 when the list is empty', () => {
    expect(getServerPageCount(0)).toBe(1);
    expect(getServerPageCount(10)).toBe(1);
    expect(getServerPageCount(11)).toBe(2);
  });
});
