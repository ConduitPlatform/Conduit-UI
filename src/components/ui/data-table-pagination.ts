export const DATA_TABLE_PAGE_SIZE = 10;

export function getServerPageCount(
  count: number,
  pageSize = DATA_TABLE_PAGE_SIZE
): number {
  if (pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(count / pageSize));
}
