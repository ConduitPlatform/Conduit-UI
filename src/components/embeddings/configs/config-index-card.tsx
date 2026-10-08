'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  Clock,
  type LucideIcon,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  configIndexStateLabel,
  MatchingIndexView,
  similarityLabel,
} from '@/lib/models/embeddings/index-state';
import { cn } from '@/lib/utils';

const STATE_ICON: Record<MatchingIndexView['state'], LucideIcon> = {
  ready: CheckCircle2,
  pending: Clock,
  failed: AlertTriangle,
  missing: AlertTriangle,
  unknown: CircleHelp,
};

const STATE_CLASS: Record<MatchingIndexView['state'], string> = {
  ready: 'text-status-healthy',
  pending: 'text-status-warning',
  failed: 'text-status-critical',
  missing: 'text-status-critical',
  unknown: 'text-status-unknown',
};

type ConfigIndexCardProps = {
  index: MatchingIndexView;
};

export function ConfigIndexCard({ index }: ConfigIndexCardProps) {
  const Icon = STATE_ICON[index.state];
  const warning = indexWarning(index);

  return (
    <Card>
      <CardHeader className="gap-1">
        <CardTitle>Matching index</CardTitle>
        <p className="text-sm text-muted-foreground text-pretty">
          Embeddings provisions this index. It is read-only here.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex min-h-8 items-center gap-2">
          <Icon
            className={cn('size-4', STATE_CLASS[index.state])}
            aria-hidden
          />
          <span className={cn('text-sm font-medium', STATE_CLASS[index.state])}>
            {configIndexStateLabel(index.state)}
          </span>
          {index.name ? (
            <span className="text-xs text-muted-foreground">
              {index.queryable ? 'Queryable' : 'Not queryable'}
            </span>
          ) : null}
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <IndexFact label="Name" value={index.name ?? '—'} />
          <IndexFact
            label="Generation"
            value={index.generation > 0 ? String(index.generation) : '—'}
          />
          <IndexFact label="Field" value={index.field} />
          <IndexFact label="Dimensions" value={String(index.dimensions)} />
          <IndexFact
            label="Similarity"
            value={similarityLabel(index.similarity)}
          />
          <IndexFact label="Method" value={index.method} />
        </dl>
        {warning ? (
          <Alert
            variant={index.state === 'unknown' ? 'warning' : 'destructive'}
          >
            <AlertTriangle className="size-4" />
            <AlertTitle>{warning.title}</AlertTitle>
            <AlertDescription>
              {warning.description}{' '}
              {warning.href ? (
                <Link
                  href={warning.href}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {warning.action}
                </Link>
              ) : null}
            </AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}

function IndexFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums text-pretty">{value}</dd>
    </div>
  );
}

function indexWarning(
  index: MatchingIndexView
):
  | { title: string; description: string; href?: string; action?: string }
  | undefined {
  switch (index.state) {
    case 'ready':
      return undefined;
    case 'pending':
      return {
        title: 'Index is not queryable yet',
        description:
          'Keep this config disabled until the matching index becomes ready.',
      };
    case 'failed':
      return {
        title: 'Matching index failed',
        description: index.name
          ? `${index.name} failed. Inspect Database indexes for this schema.`
          : 'The matching index failed. Inspect Database indexes for this schema.',
        href: '/database/models',
        action: 'Open Database',
      };
    case 'missing':
      return {
        title: 'No matching index',
        description:
          'No index matches this field, dimensions, similarity, and method yet. Save the config to provision one.',
      };
    case 'unknown':
      return {
        title: 'Index status unavailable',
        description: 'Index lookup failed. Refresh this page and try again.',
      };
    default: {
      const exhaustive: never = index.state;
      return exhaustive;
    }
  }
}
