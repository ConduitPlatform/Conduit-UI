'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SourceEditForm } from '@/components/embeddings/sources/source-edit-form';
import { SourceStatusCard } from '@/components/embeddings/sources/source-status-card';
import { SourceActionDialog } from '@/components/embeddings/sources/source-action-dialog';
import { IngestInstructions } from '@/components/embeddings/sources/ingest-instructions';
import {
  PageActions,
  PageDescription,
  PageHeader,
  PageTitle,
} from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/hooks/use-toast';
import { formatEmbeddingsApiError } from '@/lib/models/embeddings/errors';
import {
  disableEmbeddingSource,
  enableEmbeddingSource,
  purgeEmbeddingSource,
  reconcileEmbeddingSource,
  revokeEmbeddingSource,
} from '@/lib/api/embeddings';
import {
  canDisableEmbeddingSource,
  canEnableEmbeddingSource,
  canReconcileEmbeddingSource,
  canRevokeEmbeddingSource,
  enableSourceFeedback,
  sourceDisplayName,
  sourceKindLabel,
  storageLimitExplanations,
  storageSelectorSummary,
  type EmbeddingSource,
  type EmbeddingSourceStatus,
  type StorageExtractionLimits,
} from '@/lib/models/embeddings/source';
import { ConfigProviderChoice } from '@/lib/models/embeddings/config-catalogue';
import type {
  ContainerOption,
  TeamOption,
} from '@/lib/api/embeddings/source-options';

type SourceAction = 'disable' | 'enable' | 'revoke' | 'purge' | 'reconcile';

type SourceDetailProps = {
  source: EmbeddingSource;
  status?: EmbeddingSourceStatus;
  statusError?: string;
  providers: ConfigProviderChoice[];
  modelBlocked: boolean;
  teams: TeamOption[];
  containers: ContainerOption[];
  limits: StorageExtractionLimits;
  teamsError?: string;
  containersError?: string;
  teamsTruncated?: boolean;
  containersTruncated?: boolean;
  teamsTotal?: number;
  containersTotal?: number;
};

export function SourceDetail({
  source,
  status,
  statusError,
  providers,
  modelBlocked,
  teams,
  containers,
  limits,
  teamsError,
  containersError,
  teamsTruncated,
  containersTruncated,
  teamsTotal,
  containersTotal,
}: SourceDetailProps) {
  const router = useRouter();
  const [action, setAction] = useState<SourceAction | null>(null);
  const [pending, setPending] = useState(false);
  const canReconcile = canReconcileEmbeddingSource(source);
  const canDisable = canDisableEmbeddingSource(source.state);
  const canEnable = canEnableEmbeddingSource(source.state);
  const canRevoke = canRevokeEmbeddingSource(source.state);

  const runAction = async () => {
    if (!action) return;
    setPending(true);
    try {
      switch (action) {
        case 'disable':
          await disableEmbeddingSource(source._id);
          toast({ title: 'Source disabled' });
          break;
        case 'enable': {
          const result = await enableEmbeddingSource(source._id);
          toast(enableSourceFeedback(result));
          break;
        }
        case 'revoke':
          await revokeEmbeddingSource(source._id);
          toast({ title: 'Source revoked' });
          break;
        case 'purge':
          await purgeEmbeddingSource(source._id);
          toast({ title: 'Source purged' });
          router.push('/embeddings/configs');
          return;
        case 'reconcile': {
          const result = await reconcileEmbeddingSource(source._id);
          toast({
            title: 'Reconcile queued',
            description: `${result.queued} jobs from ${result.scanned} scanned files.`,
          });
          break;
        }
        default: {
          const exhaustive: never = action;
          return exhaustive;
        }
      }
      setAction(null);
      router.refresh();
    } catch (error) {
      toast({
        title: 'Action failed',
        description: formatEmbeddingsApiError(error),
        variant: 'destructive',
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader className="flex-col items-start gap-3 lg:flex-row lg:items-center">
        <div className="min-w-0">
          <PageTitle className="text-balance">
            {sourceDisplayName(source)}
          </PageTitle>
          <PageDescription>
            {sourceKindLabel(source.kind)}
            {source.kind === 'conduit-storage'
              ? ` · ${storageSelectorSummary(source.selectors)}`
              : ` · ${source.partitionSubject}`}
          </PageDescription>
        </div>
        <PageActions className="flex-wrap">
          <Button variant="outline" asChild>
            <Link href={`/embeddings/test?sourceId=${source._id}`}>
              Test Search
            </Link>
          </Button>
          {canReconcile ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setAction('reconcile')}
            >
              Reconcile
            </Button>
          ) : null}
          {canDisable ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setAction('disable')}
            >
              Disable
            </Button>
          ) : null}
          {canEnable ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setAction('enable')}
            >
              Enable
            </Button>
          ) : null}
          {canRevoke ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setAction('revoke')}
            >
              Revoke
            </Button>
          ) : null}
          <Button
            type="button"
            variant="destructive"
            onClick={() => setAction('purge')}
          >
            Purge
          </Button>
        </PageActions>
      </PageHeader>
      <SourceStatusCard status={status} error={statusError} />
      {source.kind === 'conduit-storage' ? (
        <section className="space-y-2 text-sm text-muted-foreground">
          {storageLimitExplanations(limits).map(item => (
            <p key={item.label}>
              <span className="font-medium text-foreground">{item.label}.</span>{' '}
              {item.detail}
            </p>
          ))}
        </section>
      ) : (
        <IngestInstructions source={source} />
      )}
      <SourceEditForm
        source={source}
        providers={providers}
        modelBlocked={modelBlocked}
        teams={teams}
        containers={containers}
        teamsError={teamsError}
        containersError={containersError}
        teamsTruncated={teamsTruncated}
        containersTruncated={containersTruncated}
        teamsTotal={teamsTotal}
        containersTotal={containersTotal}
      />
      <SourceActionDialog
        action={action}
        pending={pending}
        onOpenChange={open => {
          if (!open) setAction(null);
        }}
        onConfirm={() => {
          void runAction();
        }}
      />
    </div>
  );
}
