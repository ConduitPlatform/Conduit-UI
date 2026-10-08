export const BACKFILL_RUN_STATES = [
  'queued',
  'running',
  'completed',
  'failed',
  'canceled',
] as const;

export type BackfillRunState = (typeof BACKFILL_RUN_STATES)[number];

export const ACTIVE_BACKFILL_STATES: readonly BackfillRunState[] = [
  'queued',
  'running',
];

export type BackfillFilter = Record<string, unknown>;

export type BackfillRun = {
  _id: string;
  schemaName: string;
  configId?: string;
  state: BackfillRunState;
  cursor?: string;
  batchSize: number;
  onlyMissing: boolean;
  filter?: BackfillFilter;
  scannedCount: number;
  queuedCount: number;
  processedCount: number;
  failedCount: number;
  startedAt?: string;
  finishedAt?: string;
  drainStartedAt?: string;
  error?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BackfillListQuery = {
  schemaName?: string;
  state?: BackfillRunState;
  configId?: string;
  skip?: number;
  limit?: number;
};

export type BackfillListResponse = {
  runs: BackfillRun[];
  count: number;
};

export type StartBackfillInput = {
  schemaName: string;
  batchSize?: number;
  configId?: string;
  onlyMissing?: boolean;
  filter?: BackfillFilter | string;
};

export type StartBackfillResult = {
  queued: number;
  runs: BackfillRun[];
  warnings: string[];
};

export function isBackfillRunState(value: unknown): value is BackfillRunState {
  return (
    typeof value === 'string' &&
    (BACKFILL_RUN_STATES as readonly string[]).includes(value)
  );
}

export function isActiveBackfillState(state: BackfillRunState): boolean {
  return ACTIVE_BACKFILL_STATES.includes(state);
}

export function canCancelBackfill(state: BackfillRunState): boolean {
  switch (state) {
    case 'queued':
    case 'running':
      return true;
    case 'completed':
    case 'failed':
    case 'canceled':
      return false;
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}

export function isResumeEligible(state: BackfillRunState): boolean {
  switch (state) {
    case 'failed':
    case 'canceled':
      return true;
    case 'queued':
    case 'running':
    case 'completed':
      return false;
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}
