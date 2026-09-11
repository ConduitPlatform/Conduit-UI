import { describe, expect, it } from 'vitest';
import type { EmbeddingsStatus } from './capabilities';
import {
  collectOverviewWarnings,
  storageQueueSourceLink,
  workersEnabledFromStatus,
} from './overview-view';

function status(partial: Partial<EmbeddingsStatus> = {}): EmbeddingsStatus {
  return {
    enabled: true,
    ready: true,
    capabilities: {
      supported: true,
      storage: true,
      indexing: true,
      search: true,
      provider: 'postgres',
    },
    generationQueue: {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      paused: 0,
    },
    backfillQueue: {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      paused: 0,
    },
    warnings: [],
    ...partial,
  };
}

describe('storage queue health', () => {
  it('warns when storage extraction jobs have failed', () => {
    const warnings = collectOverviewWarnings({
      status: status({
        storageQueue: {
          waiting: 1,
          active: 0,
          completed: 0,
          failed: 2,
          delayed: 0,
          paused: 0,
        },
      }),
    });
    expect(warnings).toEqual(
      expect.arrayContaining([
        {
          title: 'Failed extraction jobs',
          description:
            '2 failed storage extraction jobs remain until they succeed or are retried.',
          variant: 'warning',
          href: '/embeddings/configs',
          actionLabel: 'Open Configs',
        },
      ])
    );
  });

  it('links a unique storage source and clears when the queue recovers', () => {
    const sources = [
      {
        _id: 'src_storage',
        label: 'Invoices',
        kind: 'conduit-storage' as const,
        state: 'ready' as const,
        partitionSubject: 'Team:org',
        provider: 'openai-compatible',
        model: 'text-embedding-3-small',
        dimensions: 1536,
        similarity: 'cosine' as const,
        metadataAllowlist: [],
      },
    ];
    expect(storageQueueSourceLink(sources)).toEqual({
      href: '/embeddings/sources/src_storage',
      actionLabel: 'Open Invoices',
    });
    const failed = collectOverviewWarnings({
      status: status({
        storageQueue: {
          waiting: 0,
          active: 0,
          completed: 0,
          failed: 2,
          delayed: 0,
          paused: 0,
        },
      }),
      catalogueQueryable: true,
      sources,
    });
    expect(failed.some(item => item.title === 'Embeddings not ready')).toBe(
      false
    );
    expect(failed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Failed extraction jobs',
          href: '/embeddings/sources/src_storage',
        }),
      ])
    );
    expect(
      collectOverviewWarnings({
        status: status({
          storageQueue: {
            waiting: 0,
            active: 0,
            completed: 0,
            failed: 0,
            delayed: 0,
            paused: 0,
          },
        }),
      }).some(item => item.title === 'Failed extraction jobs')
    ).toBe(false);
  });
});

describe('status readiness', () => {
  it('uses status.enabled for workers, not status.ready', () => {
    expect(
      workersEnabledFromStatus({
        status: status({ enabled: false, ready: false }),
        settingsEnabled: true,
      })
    ).toBe(false);
    expect(
      workersEnabledFromStatus({
        status: status({ enabled: true, ready: false }),
      })
    ).toBe(true);
    expect(workersEnabledFromStatus({ settingsEnabled: true })).toBe(true);
    expect(workersEnabledFromStatus({})).toBeUndefined();
  });

  it('keeps module unreadiness when the catalogue is not queryable', () => {
    const warnings = collectOverviewWarnings({
      status: status({ enabled: true, ready: false, warnings: ['internal'] }),
      workersEnabled: true,
    });
    expect(warnings).toEqual([
      {
        title: 'Embeddings not ready',
        description:
          'Workers are enabled, but the embeddings module is not ready.',
        variant: 'warning',
      },
    ]);
  });

  it('skips module unreadiness when the catalogue is queryable', () => {
    const warnings = collectOverviewWarnings({
      status: status({ enabled: true, ready: false }),
      workersEnabled: true,
      catalogueQueryable: true,
    });
    expect(warnings.some(item => item.title === 'Embeddings not ready')).toBe(
      false
    );
  });
});
