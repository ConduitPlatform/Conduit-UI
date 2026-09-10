import { describe, expect, it } from 'vitest';
import {
  CONTAINER_PAGE_CAP,
  CONTAINER_PAGE_SIZE,
  collectPagedItems,
  withLockedContainer,
} from './selector-pages';

describe('container paging', () => {
  it('pages past the first hundred and injects a locked value', async () => {
    const all = Array.from({ length: 105 }, (_, index) => ({
      id: `ctr_${index + 1}`,
      name: index === 104 ? 'archive-late' : `bin-${index + 1}`,
    }));
    const collected = await collectPagedItems({
      pageSize: CONTAINER_PAGE_SIZE,
      fetchPage: async (skip, limit) => ({
        items: all.slice(skip, skip + limit),
        total: all.length,
      }),
    });
    expect(collected.items).toHaveLength(105);
    expect(collected.items.at(-1)?.name).toBe('archive-late');
    expect(collected.truncated).toBe(false);
    expect(
      withLockedContainer(collected.items, 'locked-box').some(
        item => item.name === 'locked-box'
      )
    ).toBe(true);
    expect(
      withLockedContainer(collected.items, 'bin-1').some(
        item => item.name === 'bin-1'
      )
    ).toBe(true);
  });

  it('truncates only at the intentional high cap', async () => {
    const total = CONTAINER_PAGE_CAP + 25;
    const collected = await collectPagedItems({
      fetchPage: async (skip, limit) => ({
        items: Array.from(
          { length: Math.min(limit, total - skip) },
          (_, i) => ({
            id: `ctr_${skip + i}`,
            name: `bin-${skip + i}`,
          })
        ),
        total,
      }),
    });
    expect(collected.items).toHaveLength(CONTAINER_PAGE_CAP);
    expect(collected.total).toBe(total);
    expect(collected.truncated).toBe(true);
  });
});
