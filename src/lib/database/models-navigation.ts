const MODELS_LIST_PATH = '/database/models';

/** Build href for a model detail page, optionally preserving list filter state. */
export function buildModelDetailHref(
  modelId: string,
  listQuery?: string
): string {
  const base = `${MODELS_LIST_PATH}/${modelId}`;
  if (!listQuery) return base;
  return `${base}?list=${encodeURIComponent(listQuery)}`;
}

/** Build href for the models list, optionally restoring filter/pagination state. */
export function buildModelsListHref(listQuery?: string): string {
  if (!listQuery) return MODELS_LIST_PATH;
  return `${MODELS_LIST_PATH}?${listQuery}`;
}

/** Merge a tab change into the current detail-page search params. */
export function buildModelDetailTabHref(
  modelId: string,
  tab: string,
  currentParams: URLSearchParams
): string {
  const next = new URLSearchParams(currentParams.toString());
  next.set('tab', tab);
  const qs = next.toString();
  return qs
    ? `${MODELS_LIST_PATH}/${modelId}?${qs}`
    : `${MODELS_LIST_PATH}/${modelId}`;
}
