export const prepareSort = (sort: { asc: boolean; index: string | null }) => {
  if (sort.index) {
    return `${sort.asc ? '-' : ''}${sort.index}`;
  }
};
