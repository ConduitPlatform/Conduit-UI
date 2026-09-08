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

type MaterialEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  recreatesIndex: boolean;
  createsNewConfig: boolean;
  pending?: boolean;
};

export function MaterialEditDialog({
  open,
  onOpenChange,
  onConfirm,
  recreatesIndex,
  createsNewConfig,
  pending = false,
}: MaterialEditDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Save material changes?</AlertDialogTitle>
          <AlertDialogDescription>
            Saving these changes can replace the matching vector index and
            requires a backfill. Existing vectors stay stale until that backfill
            completes.
            {recreatesIndex
              ? ' Wait until the index is queryable before searching or backfilling.'
              : null}
            {createsNewConfig
              ? ' Changing the target field creates a new configuration. The previous target field config is kept.'
              : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={pending} onClick={onConfirm}>
            {pending ? 'Saving…' : 'Save changes'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
