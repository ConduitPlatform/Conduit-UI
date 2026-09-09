'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CancelBackfillDialog } from '@/components/embeddings/backfills/cancel-backfill-dialog';
import { Button } from '@/components/ui/button';
import { cancelBackfill, resumeBackfill } from '@/lib/api/embeddings';
import { toast } from '@/lib/hooks/use-toast';
import {
  BackfillRun,
  canCancelBackfill,
  isResumeEligible,
} from '@/lib/models/embeddings/backfill';
import { formatEmbeddingsApiError } from '@/lib/models/embeddings/errors';

type BackfillActionsProps = {
  run: BackfillRun;
  compact?: boolean;
};

export function BackfillActions({
  run,
  compact = false,
}: BackfillActionsProps) {
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const canCancel = canCancelBackfill(run.state);
  const canResume = isResumeEligible(run.state);

  if (!canCancel && !canResume) return null;

  const onCancel = async () => {
    setPending(true);
    try {
      await cancelBackfill(run._id);
      toast({ title: 'Backfill canceled' });
      setCancelOpen(false);
      router.refresh();
    } catch (error) {
      toast({
        title: 'Could not cancel backfill',
        description: formatEmbeddingsApiError(error),
        variant: 'destructive',
      });
    } finally {
      setPending(false);
    }
  };

  const onResume = async () => {
    setPending(true);
    try {
      await resumeBackfill(run._id);
      toast({ title: 'Backfill resumed' });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Could not resume backfill',
        description: formatEmbeddingsApiError(error),
        variant: 'destructive',
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      {canCancel ? (
        <Button
          type="button"
          variant="destructive"
          size={compact ? 'sm' : 'default'}
          disabled={pending}
          aria-label={compact ? `Cancel ${run.schemaName} run` : 'Cancel run'}
          onClick={() => setCancelOpen(true)}
        >
          Cancel run
        </Button>
      ) : null}
      {canResume ? (
        <Button
          type="button"
          size={compact ? 'sm' : 'default'}
          disabled={pending}
          aria-label={compact ? `Resume ${run.schemaName} run` : 'Resume run'}
          onClick={() => void onResume()}
        >
          {pending ? 'Resuming…' : 'Resume run'}
        </Button>
      ) : null}
      <CancelBackfillDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        pending={pending}
        onConfirm={() => void onCancel()}
      />
    </>
  );
}
