import { format, isValid } from 'date-fns';
import { isActiveBackfillState, isBackfillRunState } from './backfill.ts';
import type {
  BackfillListQuery,
  BackfillRun,
  BackfillRunState,
} from './backfill.ts';

export const DEFAULT_BACKFILL_BATCH_SIZE = 100;
export const MIN_BACKFILL_BATCH_SIZE = 1;
export const MAX_BACKFILL_BATCH_SIZE = 500;
export const DEFAULT_BACKFILL_LIST_LIMIT = 10;
export const MAX_BACKFILL_LIST_LIMIT = 100;
export const BACKFILL_POLL_MS = 3000;
export const MAX_BACKFILL_ERROR_DISPLAY = 1024;
export const MAX_BACKFILL_FILTER_CHARS = 4 * 1024;

export type BackfillSearchParams = Record<
  string,
  string | string[] | undefined
>;

export type BackfillListUrlState = {
  schema?: string;
  config?: string;
  state?: BackfillRunState;
  skip: number;
  limit: number;
};

export type FilterParseResult =
  | { ok: true; filter?: Record<string, unknown> }
  | { ok: false; error: string };

export type BackfillProgress = {
  scanned: number;
  queued: number;
  processed: number;
  failed: number;
  done: number;
  percent?: number;
  caption: string;
  scanning: boolean;
};

export type TimelineStatus = 'done' | 'current' | 'pending';

export type BackfillTimelineItem = {
  id: 'created' | 'started' | 'drain' | 'finished';
  label: string;
  at?: string;
  status: TimelineStatus;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function readSearchParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) {
    const first = value[0];
    return first && first.length > 0 ? first : undefined;
  }
  if (typeof value === 'string' && value.length > 0) return value;
  return undefined;
}

function parseBoundedInt(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number
): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || !Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function parseBackfillListParams(
  params: BackfillSearchParams
): BackfillListUrlState {
  const schema =
    readSearchParam(params.schema) ?? readSearchParam(params.schemaName);
  const config =
    readSearchParam(params.config) ?? readSearchParam(params.configId);
  const stateRaw = readSearchParam(params.state);
  const state = isBackfillRunState(stateRaw) ? stateRaw : undefined;
  return {
    schema,
    config,
    state,
    skip: parseBoundedInt(readSearchParam(params.skip), 0, 0, 1_000_000),
    limit: parseBoundedInt(
      readSearchParam(params.limit),
      DEFAULT_BACKFILL_LIST_LIMIT,
      1,
      MAX_BACKFILL_LIST_LIMIT
    ),
  };
}

export function toBackfillListQuery(
  state: BackfillListUrlState
): BackfillListQuery {
  return {
    schemaName: state.schema,
    configId: state.config,
    state: state.state,
    skip: state.skip,
    limit: state.limit,
  };
}

export function backfillTimestamp(run: BackfillRun): number {
  const raw = run.updatedAt ?? run.createdAt ?? run.startedAt;
  if (!raw) return 0;
  const time = Date.parse(raw);
  return Number.isFinite(time) ? time : 0;
}

export function sortBackfillRuns(runs: BackfillRun[]): BackfillRun[] {
  return [...runs].sort((left, right) => {
    const leftActive = isActiveBackfillState(left.state) ? 0 : 1;
    const rightActive = isActiveBackfillState(right.state) ? 0 : 1;
    if (leftActive !== rightActive) return leftActive - rightActive;
    if (leftActive === 0 && left.state !== right.state) {
      return left.state === 'queued' ? -1 : 1;
    }
    return backfillTimestamp(right) - backfillTimestamp(left);
  });
}

export function mergeActiveBackfillRuns(args: {
  pageRuns: BackfillRun[];
  queuedRuns: BackfillRun[];
  runningRuns: BackfillRun[];
  skip: number;
  state?: BackfillRunState;
}): BackfillRun[] {
  if (args.state) return sortBackfillRuns(args.pageRuns);
  const active = sortBackfillRuns([...args.queuedRuns, ...args.runningRuns]);
  const activeIds = new Set(active.map(run => run._id));
  const rest = args.pageRuns.filter(run => !activeIds.has(run._id));
  if (args.skip > 0) return sortBackfillRuns(rest);
  return [...active, ...sortBackfillRuns(rest)];
}

export function hasActiveBackfillRuns(runs: BackfillRun[]): boolean {
  return runs.some(run => isActiveBackfillState(run.state));
}

export function backfillProgress(run: BackfillRun): BackfillProgress {
  const scanned = run.scannedCount;
  const queued = run.queuedCount;
  const processed = run.processedCount;
  const failed = run.failedCount;
  const done = processed + failed;
  const scanning = isActiveBackfillState(run.state) && queued <= 0;
  const percent =
    queued > 0 ? Math.min(100, Math.round((done / queued) * 100)) : undefined;
  let caption: string;
  if (scanning) {
    caption = 'Scanning. Progress is of queued documents, not the collection.';
  } else if (queued <= 0) {
    caption = 'No documents queued';
  } else {
    caption = `${done.toLocaleString()} of ${queued.toLocaleString()} queued`;
  }
  return {
    scanned,
    queued,
    processed,
    failed,
    done,
    percent,
    caption,
    scanning,
  };
}

export function backfillStateLabel(state: BackfillRunState): string {
  switch (state) {
    case 'queued':
      return 'Queued';
    case 'running':
      return 'Running';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'canceled':
      return 'Canceled';
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}

export function backfillStateClass(state: BackfillRunState): string {
  switch (state) {
    case 'queued':
      return 'text-status-warning';
    case 'running':
      return 'text-status-info';
    case 'completed':
      return 'text-status-healthy';
    case 'failed':
      return 'text-status-critical';
    case 'canceled':
      return 'text-status-unknown';
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}

export function parseOperatorFilterJson(raw: string): FilterParseResult {
  const trimmed = raw.trim();
  if (trimmed === '') return { ok: true, filter: undefined };
  if (trimmed.length > MAX_BACKFILL_FILTER_CHARS) {
    return { ok: false, error: 'Filter is too large.' };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { ok: false, error: 'Filter is not valid JSON.' };
  }
  if (!isRecord(parsed)) {
    return { ok: false, error: 'Filter must be a JSON object.' };
  }
  return { ok: true, filter: parsed };
}

export function maxAllowedBatchSize(configuredMax?: number): number {
  const configured =
    typeof configuredMax === 'number' && Number.isFinite(configuredMax)
      ? Math.trunc(configuredMax)
      : MAX_BACKFILL_BATCH_SIZE;
  return Math.min(
    MAX_BACKFILL_BATCH_SIZE,
    Math.max(MIN_BACKFILL_BATCH_SIZE, configured)
  );
}

export function defaultBackfillBatchSize(configuredMax?: number): number {
  return Math.min(
    DEFAULT_BACKFILL_BATCH_SIZE,
    maxAllowedBatchSize(configuredMax)
  );
}

export function parseBatchSizeInput(
  raw: string,
  configuredMax?: number
): { ok: true; batchSize: number } | { ok: false; error: string } {
  const max = maxAllowedBatchSize(configuredMax);
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || !Number.isFinite(parsed)) {
    return {
      ok: false,
      error: `Batch size must be an integer from ${MIN_BACKFILL_BATCH_SIZE} to ${max}.`,
    };
  }
  if (parsed < MIN_BACKFILL_BATCH_SIZE || parsed > max) {
    return {
      ok: false,
      error: `Batch size must be between ${MIN_BACKFILL_BATCH_SIZE} and ${max}.`,
    };
  }
  return { ok: true, batchSize: parsed };
}

export function sanitizeBackfillErrorDisplay(
  error: string | undefined
): string | undefined {
  if (!error) return undefined;
  const stripped = error
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim();
  if (!stripped) return undefined;
  return stripped.length > MAX_BACKFILL_ERROR_DISPLAY
    ? stripped.slice(0, MAX_BACKFILL_ERROR_DISPLAY)
    : stripped;
}

export function formatBackfillTimestamp(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (!isValid(date)) return '—';
  return format(date, 'MMM d, yyyy, HH:mm:ss');
}

function step(
  id: BackfillTimelineItem['id'],
  label: string,
  status: TimelineStatus,
  at?: string
): BackfillTimelineItem {
  return { id, label, at, status };
}

export function backfillTimeline(run: BackfillRun): BackfillTimelineItem[] {
  const created = step('created', 'Created', 'done', run.createdAt);
  switch (run.state) {
    case 'queued':
      return [
        { ...created, status: 'current' },
        step('started', 'Started', 'pending'),
        step('drain', 'Drain', 'pending'),
        step('finished', 'Finished', 'pending'),
      ];
    case 'running':
      return [
        created,
        step(
          'started',
          'Started',
          run.drainStartedAt ? 'done' : 'current',
          run.startedAt
        ),
        step(
          'drain',
          'Drain',
          run.drainStartedAt ? 'current' : 'pending',
          run.drainStartedAt
        ),
        step('finished', 'Finished', 'pending'),
      ];
    case 'completed':
      return [
        created,
        step('started', 'Started', 'done', run.startedAt),
        step(
          'drain',
          'Drain',
          run.drainStartedAt ? 'done' : 'pending',
          run.drainStartedAt
        ),
        step('finished', 'Finished', 'done', run.finishedAt),
      ];
    case 'failed':
      return [
        created,
        step(
          'started',
          'Started',
          run.startedAt ? 'done' : 'pending',
          run.startedAt
        ),
        step(
          'drain',
          'Drain',
          run.drainStartedAt ? 'done' : 'pending',
          run.drainStartedAt
        ),
        step('finished', 'Failed', 'current', run.finishedAt),
      ];
    case 'canceled':
      return [
        created,
        step(
          'started',
          'Started',
          run.startedAt ? 'done' : 'pending',
          run.startedAt
        ),
        step(
          'drain',
          'Drain',
          run.drainStartedAt ? 'done' : 'pending',
          run.drainStartedAt
        ),
        step('finished', 'Canceled', 'current', run.finishedAt),
      ];
    default: {
      const exhaustive: never = run.state;
      return exhaustive;
    }
  }
}

export function uniqueSchemaNames(
  configs: { schemaName: string }[],
  runs: BackfillRun[]
): string[] {
  const names = new Set<string>();
  for (const config of configs) names.add(config.schemaName);
  for (const run of runs) names.add(run.schemaName);
  return [...names].sort((left, right) => left.localeCompare(right));
}
