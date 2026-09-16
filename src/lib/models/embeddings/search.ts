export type SemanticSearchInput = {
  schemaName: string;
  text: string;
  targetField?: string;
  filter?: Record<string, unknown> | string;
  limit?: number;
};

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
