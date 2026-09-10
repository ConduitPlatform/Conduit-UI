import type { EmbeddingConfigListRow } from '@/lib/models/embeddings/index-state';
import {
  sourceDisplayName,
  sourceIndexState,
  sourceKindLabel,
  sourceStateLabel,
  storageSelectorSummary,
  type EmbeddingSource,
} from '@/lib/models/embeddings/source';

export type EmbeddingCatalogRow =
  | {
      type: 'schema';
      id: string;
      href: string;
      title: string;
      schema: EmbeddingConfigListRow;
    }
  | {
      type: 'source';
      id: string;
      href: string;
      title: string;
      source: EmbeddingSource;
    };

export function schemaCatalogRow(
  row: EmbeddingConfigListRow
): EmbeddingCatalogRow {
  return {
    type: 'schema',
    id: row.config._id,
    href: `/embeddings/configs/${row.config._id}`,
    title: row.config.schemaName,
    schema: row,
  };
}

export function sourceCatalogRow(source: EmbeddingSource): EmbeddingCatalogRow {
  return {
    type: 'source',
    id: source._id,
    href: `/embeddings/sources/${source._id}`,
    title: sourceDisplayName(source),
    source,
  };
}

export function catalogRowTypeLabel(row: EmbeddingCatalogRow): string {
  return row.type === 'schema'
    ? 'Database schema'
    : sourceKindLabel(row.source.kind);
}

export function catalogRowStatus(row: EmbeddingCatalogRow): string {
  if (row.type === 'schema') {
    return row.schema.config.enabled ? 'Enabled' : 'Disabled';
  }
  return sourceStateLabel(row.source.state);
}

export function catalogRowIndex(row: EmbeddingCatalogRow): string {
  if (row.type === 'schema') {
    return row.schema.indexState;
  }
  return sourceIndexState(row.source);
}

export function catalogRowTarget(row: EmbeddingCatalogRow): string {
  if (row.type === 'schema') return row.schema.config.targetField;
  if (row.source.kind === 'conduit-storage') {
    return storageSelectorSummary(row.source.selectors);
  }
  return row.source.partitionSubject;
}

export function catalogRowProfile(row: EmbeddingCatalogRow): string {
  if (row.type === 'schema') {
    return `${row.schema.config.provider}/${row.schema.config.model}`;
  }
  return `${row.source.provider}/${row.source.model}`;
}
