const SEGMENT_LABELS: Record<string, string> = {
  templates: 'Templates',
  logs: 'Logs & Devices',
  settings: 'Settings',
};

const MODULE_SEGMENT_LABELS: Record<string, Record<string, string>> = {
  communications: {
    test: 'Test Send',
  },
  embeddings: {
    configs: 'Configs',
    backfills: 'Backfills',
    test: 'Test Search',
    sources: 'Sources',
    settings: 'Settings',
  },
};

function titleCaseSegment(segment: string): string {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatBreadcrumbSegment(
  segment: string,
  moduleSlug?: string,
  previousSegment?: string
): string {
  const moduleLabels = moduleSlug
    ? MODULE_SEGMENT_LABELS[moduleSlug]
    : undefined;
  const known = moduleLabels?.[segment] ?? SEGMENT_LABELS[segment];
  if (known) return known;

  if (moduleSlug === 'embeddings') {
    if (segment === 'new') {
      return previousSegment === 'sources' ? 'New source' : 'New config';
    }
    if (previousSegment === 'configs') return 'Config';
    if (previousSegment === 'backfills') return 'Backfill';
    if (previousSegment === 'sources') return 'Source';
  }

  return titleCaseSegment(segment);
}
