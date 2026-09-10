import { describe, expect, it } from 'vitest';
import type { EmbeddingsStatus } from './capabilities';
import {
  collectOverviewWarnings,
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
          title: 'Storage extraction queue',
          description: '2 storage extraction jobs failed.',
          variant: 'warning',
        },
      ])
    );
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

  it('warns when workers are on but status.ready is false', () => {
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
});
