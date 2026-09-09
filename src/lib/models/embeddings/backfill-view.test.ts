import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { canCancelBackfill, isResumeEligible } from './backfill.ts';
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
  uniqueSchemaNames,
} from './backfill-view.ts';
import type { BackfillRun, BackfillRunState } from './backfill.ts';

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
    assert.deepEqual(parsed, {
      schema: 'Article',
      config: 'cfg_1',
      state: 'running',
      skip: 20,
      limit: 25,
    });
    assert.deepEqual(toBackfillListQuery(parsed), {
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
    assert.equal(parsed.schema, 'Post');
    assert.equal(parsed.config, 'cfg_2');
    assert.equal(parsed.state, undefined);
    assert.equal(parsed.skip, 0);
    assert.equal(parsed.limit, 100);
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
    assert.deepEqual(
      sorted.map(item => item._id),
      ['wait', 'run', 'done', 'fail']
    );
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
    assert.deepEqual(
      first.map(item => item._id),
      ['q', 'r', 'old']
    );
    const next = mergeActiveBackfillRuns({
      pageRuns: [queued, older],
      queuedRuns: [queued],
      runningRuns: [running],
      skip: 10,
    });
    assert.deepEqual(
      next.map(item => item._id),
      ['old']
    );
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
    assert.equal(progress.done, 50);
    assert.equal(progress.percent, 50);
    assert.equal(progress.scanning, false);
    assert.match(progress.caption, /50 of 100 queued/);
    assert.doesNotMatch(progress.caption.toLowerCase(), /collection/);
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
    assert.equal(progress.percent, undefined);
    assert.equal(progress.scanning, true);
    assert.match(progress.caption, /Scanning/);
    assert.match(progress.caption, /not the collection/);
  });

  it('detects active runs for polling', () => {
    assert.equal(
      hasActiveBackfillRuns([run({ _id: '1', state: 'completed' })]),
      false
    );
    assert.equal(
      hasActiveBackfillRuns([run({ _id: '1', state: 'queued' })]),
      true
    );
  });
});

describe('start dialog parsing', () => {
  it('accepts empty or object filters and rejects arrays or invalid JSON', () => {
    assert.deepEqual(parseOperatorFilterJson(''), {
      ok: true,
      filter: undefined,
    });
    assert.deepEqual(parseOperatorFilterJson(' {"status":"draft"} '), {
      ok: true,
      filter: { status: 'draft' },
    });
    assert.deepEqual(parseOperatorFilterJson('[1]'), {
      ok: false,
      error: 'Filter must be a JSON object.',
    });
    assert.equal(parseOperatorFilterJson('{').ok, false);
  });

  it('bounds batch size to configured max', () => {
    assert.equal(defaultBackfillBatchSize(40), 40);
    assert.equal(defaultBackfillBatchSize(500), 100);
    assert.deepEqual(parseBatchSizeInput('100', 500), {
      ok: true,
      batchSize: 100,
    });
    assert.equal(parseBatchSizeInput('0', 500).ok, false);
    assert.equal(parseBatchSizeInput('501', 500).ok, false);
  });
});

describe('detail helpers', () => {
  it('allows cancel on queued or running and resume on failed or canceled', () => {
    assert.equal(canCancelBackfill('queued'), true);
    assert.equal(canCancelBackfill('running'), true);
    assert.equal(canCancelBackfill('completed'), false);
    assert.equal(isResumeEligible('failed'), true);
    assert.equal(isResumeEligible('canceled'), true);
    assert.equal(isResumeEligible('completed'), false);
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
    assert.equal(items[1]?.status, 'done');
    assert.equal(items[2]?.status, 'current');
    assert.equal(items[3]?.status, 'pending');
    assert.equal(sanitizeBackfillErrorDisplay('  boom\u0000  '), 'boom');
    assert.equal(sanitizeBackfillErrorDisplay(''), undefined);
  });

  it('collects schema names from configs and runs', () => {
    assert.deepEqual(
      uniqueSchemaNames(
        [{ schemaName: 'Post' }, { schemaName: 'Article' }],
        [run({ _id: '1', state: 'queued', schemaName: 'Comment' })]
      ),
      ['Article', 'Comment', 'Post']
    );
  });
});
