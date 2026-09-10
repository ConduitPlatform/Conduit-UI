export type SemanticSearchInput = {
  schemaName?: string;
  sourceId?: string;
  text: string;
  targetField?: string;
  filter?: Record<string, unknown> | string;
  limit?: number;
  scope?: string;
};

export const SEARCH_TARGET_XOR_MESSAGE =
  'Search requires exactly one of schemaName or sourceId.';

export const SEARCH_TEXT_REQUIRED_MESSAGE = 'Query text is required.';

export function assertSemanticSearchInput(data: SemanticSearchInput): {
  schemaName?: string;
  sourceId?: string;
  text: string;
} {
  const schemaName = data.schemaName?.trim() || undefined;
  const sourceId = data.sourceId?.trim() || undefined;
  const text = data.text.trim();
  if (!text) {
    throw new Error(SEARCH_TEXT_REQUIRED_MESSAGE);
  }
  if (Boolean(schemaName) === Boolean(sourceId)) {
    throw new Error(SEARCH_TARGET_XOR_MESSAGE);
  }
  return { schemaName, sourceId, text };
}

export type SemanticSearchHit = {
  document: Record<string, unknown>;
  score: number;
  distance?: number;
  metric?: string;
  provider?: string;
};

export type SemanticSearchResponse = {
  hits: SemanticSearchHit[];
};
