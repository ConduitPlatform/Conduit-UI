import type {
  EmbeddingsQueueCounts,
  EmbeddingsStatus,
} from './capabilities.ts';
import { sourceDisplayName, type EmbeddingSource } from './source.ts';

export type OverviewWarning = {
  title: string;
  description: string;
  variant: 'warning' | 'destructive';
  href?: string;
  actionLabel?: string;
};

export function emptyEmbeddingsQueue(): EmbeddingsQueueCounts {
  return {
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    delayed: 0,
    paused: 0,
  };
}

export function addEmbeddingsQueues(
  left: EmbeddingsQueueCounts,
  right: EmbeddingsQueueCounts
): EmbeddingsQueueCounts {
  return {
    waiting: left.waiting + right.waiting,
    active: left.active + right.active,
    completed: left.completed + right.completed,
    failed: left.failed + right.failed,
    delayed: left.delayed + right.delayed,
    paused: left.paused + right.paused,
  };
}

export function workersEnabledFromStatus(args: {
  status?: Pick<EmbeddingsStatus, 'enabled'>;
  settingsEnabled?: boolean;
}): boolean | undefined {
  if (args.status) return args.status.enabled;
  return args.settingsEnabled;
}

export function storageQueueSourceLink(sources?: EmbeddingSource[]): {
  href: string;
  actionLabel: string;
} {
  const storage = (sources ?? []).filter(
    source => source.kind === 'conduit-storage'
  );
  if (storage.length === 1) {
    return {
      href: `/embeddings/sources/${storage[0]._id}`,
      actionLabel: `Open ${sourceDisplayName(storage[0])}`,
    };
  }
  return {
    href: '/embeddings/configs',
    actionLabel: 'Open Configs',
  };
}

export function collectOverviewWarnings(args: {
  status?: EmbeddingsStatus;
  capabilitiesError?: string;
  statusError?: string;
  configsError?: string;
  sourcesError?: string;
  settingsError?: string;
  backfillsError?: string;
  workersEnabled?: boolean;
  capabilitiesSupported?: boolean;
  capabilitiesReason?: string;
  catalogueQueryable?: boolean;
  sources?: EmbeddingSource[];
}): OverviewWarning[] {
  const warnings: OverviewWarning[] = [];

  if (args.capabilitiesSupported === false) {
    warnings.push({
      title: 'Vector capabilities unavailable',
      description:
        args.capabilitiesReason ??
        'This database does not support vector storage and search.',
      variant: 'destructive',
    });
  } else if (args.capabilitiesError) {
    warnings.push({
      title: 'Could not load capabilities',
      description: args.capabilitiesError,
      variant: 'warning',
    });
  }

  if (args.workersEnabled === false) {
    warnings.push({
      title: 'Workers disabled',
      description:
        'Overview stays available. Enable workers in Settings to process jobs.',
      variant: 'warning',
    });
  } else if (
    args.status?.enabled === true &&
    args.status.ready === false &&
    !args.catalogueQueryable
  ) {
    warnings.push({
      title: 'Embeddings not ready',
      description:
        'Workers are enabled, but the embeddings module is not ready.',
      variant: 'warning',
    });
  }

  if (args.statusError) {
    warnings.push({
      title: 'Status unavailable',
      description: args.statusError,
      variant: 'warning',
    });
  }

  if (args.settingsError) {
    warnings.push({
      title: 'Settings unavailable',
      description: args.settingsError,
      variant: 'warning',
    });
  }

  if (args.configsError) {
    warnings.push({
      title: 'Configs unavailable',
      description: args.configsError,
      variant: 'warning',
    });
  }

  if (args.sourcesError) {
    warnings.push({
      title: 'Generic sources unavailable',
      description: args.sourcesError,
      variant: 'warning',
    });
  }

  if (args.backfillsError) {
    warnings.push({
      title: 'Backfill count unavailable',
      description: args.backfillsError,
      variant: 'warning',
    });
  }

  const storageFailed = args.status?.storageQueue?.failed ?? 0;
  if (storageFailed > 0) {
    const link = storageQueueSourceLink(args.sources);
    warnings.push({
      title: 'Failed extraction jobs',
      description: `${storageFailed.toLocaleString()} failed storage extraction job${storageFailed === 1 ? '' : 's'} remain until they succeed or are retried.`,
      variant: 'warning',
      href: link.href,
      actionLabel: link.actionLabel,
    });
  }

  return warnings;
}
