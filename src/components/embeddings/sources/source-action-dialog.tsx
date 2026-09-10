'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export type SourceAction =
  | 'disable'
  | 'enable'
  | 'revoke'
  | 'purge'
  | 'reconcile';

const COPY: Record<
  SourceAction,
  { title: string; description: string; confirm: string; pending: string }
> = {
  disable: {
    title: 'Disable this source?',
    description:
      'Pauses ingest and search. You can enable the source again later. Access relations stay in place.',
    confirm: 'Disable source',
    pending: 'Disabling…',
  },
  enable: {
    title: 'Enable this source?',
    description:
      'Resumes ingest and search for this paused source. Revoked or failed sources cannot be enabled here.',
    confirm: 'Enable source',
    pending: 'Enabling…',
  },
  revoke: {
    title: 'Revoke this source?',
    description:
      'Access relations are deleted. Ingest and search fail closed afterwards.',
    confirm: 'Revoke source',
    pending: 'Revoking…',
  },
  purge: {
    title: 'Purge this source?',
    description:
      'This deletes the source, its documents, and chunk index data. This cannot be undone.',
    confirm: 'Purge source',
    pending: 'Purging…',
  },
  reconcile: {
    title: 'Reconcile storage files?',
    description:
      'Matching files are queued for ingest and stale documents are queued for delete. This also covers backfill.',
    confirm: 'Reconcile',
    pending: 'Reconciling…',
  },
};

type SourceActionDialogProps = {
  action: SourceAction | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pending?: boolean;
};

export function SourceActionDialog({
  action,
  onOpenChange,
  onConfirm,
  pending = false,
}: SourceActionDialogProps) {
  const copy = action ? COPY[action] : COPY.disable;
  const destructive = action === 'purge' || action === 'revoke';
  return (
    <AlertDialog
      open={action != null}
      onOpenChange={next => {
        if (pending && !next) return;
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
          <AlertDialogDescription>{copy.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={
              destructive
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : undefined
            }
            disabled={pending}
            onClick={event => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {pending ? copy.pending : copy.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
