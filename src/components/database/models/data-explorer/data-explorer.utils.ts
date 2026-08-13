import { formatDisplayValue } from '@/lib/database/format-display-value';

export function filterDocumentsByQuickSearch(
  documents: any[],
  quickSearch: string
): any[] {
  if (!quickSearch) return documents;
  const searchLower = quickSearch.toLowerCase();
  return documents.filter(doc =>
    Object.values(doc).some(value =>
      formatDisplayValue(value).toLowerCase().includes(searchLower)
    )
  );
}
