export const CONTAINER_PAGE_SIZE = 100;
export const CONTAINER_PAGE_CAP = 1000;

export type PagedOption = {
  id: string;
  name: string;
};

export async function collectPagedItems<T>(args: {
  pageSize?: number;
  pageCap?: number;
  fetchPage: (
    skip: number,
    limit: number
  ) => Promise<{ items: T[]; total: number }>;
}): Promise<{ items: T[]; total: number; truncated: boolean }> {
  const pageSize = args.pageSize ?? CONTAINER_PAGE_SIZE;
  const pageCap = args.pageCap ?? CONTAINER_PAGE_CAP;
  const first = await args.fetchPage(0, pageSize);
  const items = [...first.items];
  const total = first.total;
  while (items.length < total && items.length < pageCap) {
    const page = await args.fetchPage(items.length, pageSize);
    if (page.items.length === 0) break;
    items.push(...page.items);
  }
  return {
    items: items.slice(0, pageCap),
    total,
    truncated: Math.min(items.length, pageCap) < total,
  };
}

export function withLockedContainer<T extends PagedOption>(
  items: T[],
  lockedName?: string
): T[] {
  if (!lockedName || items.some(item => item.name === lockedName)) {
    return items;
  }
  return [{ id: lockedName, name: lockedName } as T, ...items];
}
