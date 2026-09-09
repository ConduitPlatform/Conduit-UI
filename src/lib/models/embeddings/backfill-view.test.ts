import { describe, expect, it } from 'vitest';
import { canCancelBackfill, isResumeEligible } from './backfill';
import {
  backfillProgress,
  backfillTimeline,
  defaultBackfillBatchSize,
  hasActiveBackfillRuns,
  mergeActiveBackfillRuns,
  parseBackfillListParams,
  parseBatchSizeInput,
  parseOperatorFilterJson,
  sanitizeBackfillErrorDisplay,
  sortBackfillRuns,
  toBackfillListQuery,
  startBackfillConfigs,
  startBackfillSchemas,
  uniqueSchemaNames,
} from './backfill-view';
import type { BackfillRun, BackfillRunState } from './backfill';

function run(
  partial: Partial<BackfillRun> & { _id: string; state: BackfillRunState }
): BackfillRun {
  return {
    schemaName: 'Article',
    batchSize: 100,
    onlyMissing: true,
    scannedCount: 0,
    queuedCount: 0,
    processedCount: 0,
    failedCount: 0,
    ...partial,
  };
}

describe('backfill list URL state', () => {
  it('reads schema, config, state, skip, and limit, including aliases', () => {
    const parsed = parseBackfillListParams({
      schemaName: 'Article',
      configId: 'cfg_1',
      state: 'running',
      skip: '20',
      limit: '25',
    });
    expect(parsed).toEqual({
      schema: 'Article',
      config: 'cfg_1',
      state: 'running',
      skip: 20,
      limit: 25,
    });
    expect(toBackfillListQuery(parsed)).toEqual({
      schemaName: 'Article',
      configId: 'cfg_1',
      state: 'running',
      skip: 20,
      limit: 25,
    });
  });

  it('prefers schema and config over aliases and ignores invalid state', () => {
    const parsed = parseBackfillListParams({
      schema: 'Post',
      schemaName: 'Article',
      config: 'cfg_2',
      configId: 'cfg_1',
      state: 'nope',
      skip: '-4',
      limit: '999',
    });
    expect(parsed.schema).toBe('Post');
    expect(parsed.config).toBe('cfg_2');
    expect(parsed.state).toBeUndefined();
    expect(parsed.skip).toBe(0);
    expect(parsed.limit).toBe(100);
  });
});

describe('active-first ordering', () => {
  it('places queued then running ahead of history by recency', () => {
    const sorted = sortBackfillRuns([
      run({
        _id: 'done',
        state: 'completed',
        createdAt: '2026-01-04T00:00:00.000Z',
      }),
      run({
        _id: 'run',
        state: 'running',
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
      run({
        _id: 'wait',
        state: 'queued',
        createdAt: '2026-01-02T00:00:00.000Z',
      }),
      run({
        _id: 'fail',
        state: 'failed',
        createdAt: '2026-01-03T00:00:00.000Z',
      }),
    ]);
    expect(sorted.map(item => item._id)).toEqual([
      'wait',
      'run',
      'done',
      'fail',
    ]);
  });

  it('prepends active runs on the first page and hides them later', () => {
    const queued = run({ _id: 'q', state: 'queued' });
    const running = run({ _id: 'r', state: 'running' });
    const older = run({
      _id: 'old',
      state: 'completed',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    const first = mergeActiveBackfillRuns({
      pageRuns: [older, queued],
      queuedRuns: [queued],
      runningRuns: [running],
      skip: 0,
    });
    expect(first.map(item => item._id)).toEqual(['q', 'r', 'old']);
    const next = mergeActiveBackfillRuns({
      pageRuns: [queued, older],
      queuedRuns: [queued],
      runningRuns: [running],
      skip: 10,
    });
    expect(next.map(item => item._id)).toEqual(['old']);
  });
});

describe('queued progress', () => {
  it('uses processed plus failed over queued and does not treat scan as completion', () => {
    const progress = backfillProgress(
      run({
        _id: '1',
        state: 'running',
        scannedCount: 5000,
        queuedCount: 100,
        processedCount: 40,
        failedCount: 10,
      })
    );
    expect(progress.done).toBe(50);
    expect(progress.percent).toBe(50);
    expect(progress.scanning).toBe(false);
    expect(progress.caption).toMatch(/50 of 100 queued/);
    expect(progress.caption.toLowerCase()).not.toMatch(/collection/);
  });

  it('labels scanning when queued is still empty', () => {
    const progress = backfillProgress(
      run({
        _id: '1',
        state: 'running',
        scannedCount: 12,
        queuedCount: 0,
      })
    );
    expect(progress.percent).toBeUndefined();
    expect(progress.scanning).toBe(true);
    expect(progress.caption).toMatch(/Scanning/);
    expect(progress.caption).toMatch(/not the collection/);
  });

  it('detects active runs for polling', () => {
    expect(hasActiveBackfillRuns([run({ _id: '1', state: 'completed' })])).toBe(
      false
    );
    expect(hasActiveBackfillRuns([run({ _id: '1', state: 'queued' })])).toBe(
      true
    );
  });
});

describe('start dialog parsing', () => {
  it('accepts empty or object filters and rejects arrays or invalid JSON', () => {
    expect(parseOperatorFilterJson('')).toEqual({
      ok: true,
      filter: undefined,
    });
    expect(parseOperatorFilterJson(' {"status":"draft"} ')).toEqual({
      ok: true,
      filter: { status: 'draft' },
    });
    expect(parseOperatorFilterJson('[1]')).toEqual({
      ok: false,
      error: 'Filter must be a JSON object.',
    });
    expect(parseOperatorFilterJson('{').ok).toBe(false);
  });

  it('bounds batch size to configured max', () => {
    expect(defaultBackfillBatchSize(40)).toBe(40);
    expect(defaultBackfillBatchSize(500)).toBe(100);
    expect(parseBatchSizeInput('100', 500)).toEqual({
      ok: true,
      batchSize: 100,
    });
    expect(parseBatchSizeInput('0', 500).ok).toBe(false);
    expect(parseBatchSizeInput('501', 500).ok).toBe(false);
  });
});

describe('detail helpers', () => {
  it('allows cancel on queued or running and resume on failed or canceled', () => {
    expect(canCancelBackfill('queued')).toBe(true);
    expect(canCancelBackfill('running')).toBe(true);
    expect(canCancelBackfill('completed')).toBe(false);
    expect(isResumeEligible('failed')).toBe(true);
    expect(isResumeEligible('canceled')).toBe(true);
    expect(isResumeEligible('completed')).toBe(false);
  });

  it('builds a running drain timeline and sanitizes error text', () => {
    const items = backfillTimeline(
      run({
        _id: '1',
        state: 'running',
        createdAt: '2026-01-01T00:00:00.000Z',
        startedAt: '2026-01-01T00:01:00.000Z',
        drainStartedAt: '2026-01-01T00:02:00.000Z',
      })
    );
    expect(items[1]?.status).toBe('done');
    expect(items[2]?.status).toBe('current');
    expect(items[3]?.status).toBe('pending');
    expect(sanitizeBackfillErrorDisplay('  boom\u0000  ')).toBe('boom');
    expect(sanitizeBackfillErrorDisplay('')).toBeUndefined();
  });

  it('reaches Drain when the API omits drainStartedAt', () => {
    const running = backfillTimeline(
      run({
        _id: '1',
        state: 'running',
        startedAt: '2026-01-01T00:01:00.000Z',
        queuedCount: 40,
        processedCount: 10,
      })
    );
    expect(running[1]?.status).toBe('done');
    expect(running[2]?.id).toBe('drain');
    expect(running[2]?.status).toBe('current');

    const completed = backfillTimeline(
      run({
        _id: '2',
        state: 'completed',
        startedAt: '2026-01-01T00:01:00.000Z',
        finishedAt: '2026-01-01T00:03:00.000Z',
        queuedCount: 40,
        processedCount: 40,
      })
    );
    expect(completed[2]?.status).toBe('done');
  });

  it('excludes disabled configs from the start picker', () => {
    const enabled = { schemaName: 'Article', enabled: true };
    const disabled = { schemaName: 'Post', enabled: false };
    expect(startBackfillConfigs([enabled, disabled])).toEqual([enabled]);
    expect(startBackfillSchemas([enabled, disabled])).toEqual(['Article']);
  });

  it('collects schema names from configs and runs', () => {
    expect(
      uniqueSchemaNames(
        [{ schemaName: 'Post' }, { schemaName: 'Article' }],
        [run({ _id: '1', state: 'queued', schemaName: 'Comment' })]
      )
    ).toEqual(['Article', 'Comment', 'Post']);
  });
});
