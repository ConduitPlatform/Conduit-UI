import { describe, expect, it } from 'vitest';
import { formatBreadcrumbSegment } from './breadcrumbs';

describe('formatBreadcrumbSegment', () => {
  it('uses embeddings route labels instead of raw ids', () => {
    expect(formatBreadcrumbSegment('configs', 'embeddings')).toBe('Configs');
    expect(formatBreadcrumbSegment('backfills', 'embeddings')).toBe(
      'Backfills'
    );
    expect(formatBreadcrumbSegment('test', 'embeddings')).toBe('Test Search');
    expect(formatBreadcrumbSegment('new', 'embeddings', 'configs')).toBe(
      'New config'
    );
    expect(formatBreadcrumbSegment('sources', 'embeddings')).toBe('Sources');
    expect(formatBreadcrumbSegment('new', 'embeddings', 'sources')).toBe(
      'New source'
    );
    expect(
      formatBreadcrumbSegment('src_storage', 'embeddings', 'sources')
    ).toBe('Source');
    expect(
      formatBreadcrumbSegment('cfg_product', 'embeddings', 'configs')
    ).toBe('Config');
    expect(formatBreadcrumbSegment('bf_3', 'embeddings', 'backfills')).toBe(
      'Backfill'
    );
  });

  it('keeps shared and communications labels', () => {
    expect(formatBreadcrumbSegment('settings')).toBe('Settings');
    expect(formatBreadcrumbSegment('test', 'communications')).toBe('Test Send');
    expect(formatBreadcrumbSegment('models', 'database')).toBe('Models');
  });
});
