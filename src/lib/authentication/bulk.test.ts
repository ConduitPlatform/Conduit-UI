import { describe, expect, it } from 'vitest';
import { bulkDeletePhrase, runBulk } from '@/lib/authentication/bulk';

describe('runBulk', () => {
  it('caps how many calls run at once and splits ok from failed', async () => {
    let active = 0;
    let maxActive = 0;
    const result = await runBulk(
      ['a', 'b', 'c', 'd', 'e', 'f'],
      async id => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        await new Promise(resolve => setTimeout(resolve, 15));
        active -= 1;
        if (id === 'c' || id === 'e') throw new Error(`nope ${id}`);
      },
      { concurrency: 4 }
    );

    expect(maxActive).toBeLessThanOrEqual(4);
    expect(maxActive).toBeGreaterThan(1);
    expect(result.ok.sort()).toEqual(['a', 'b', 'd', 'f']);
    expect(result.failed).toEqual([
      { id: 'c', message: 'nope c' },
      { id: 'e', message: 'nope e' },
    ]);
  });

  it('records a rejection that is not an Error', async () => {
    const result = await runBulk(['a'], async () => {
      throw 'blocked';
    });
    expect(result).toEqual({
      ok: [],
      failed: [{ id: 'a', message: 'blocked' }],
    });
  });

  it('builds the typed delete phrase from the count', () => {
    expect(bulkDeletePhrase(7)).toBe('delete 7 users');
    expect(bulkDeletePhrase(1)).toBe('delete 1 user');
  });
});
