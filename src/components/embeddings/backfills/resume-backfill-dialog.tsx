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

type ResumeBackfillDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pending?: boolean;
};

export function ResumeBackfillDialog({
  open,
  onOpenChange,
  onConfirm,
  pending = false,
}: ResumeBackfillDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={next => {
        if (pending && !next) return;
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Resume this run?</AlertDialogTitle>
          <AlertDialogDescription>
            Resume queues remaining documents and uses provider quota. Confirm
            before continuing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Keep paused</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={event => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {pending ? 'Resuming…' : 'Resume run'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
