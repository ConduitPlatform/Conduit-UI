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

type DeleteConfigDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pending?: boolean;
};

export function DeleteConfigDialog({
  open,
  onOpenChange,
  onConfirm,
  pending = false,
}: DeleteConfigDialogProps) {
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
          <AlertDialogTitle>Delete this config?</AlertDialogTitle>
          <AlertDialogDescription>
            This deletes the embedding configuration. Vector fields and indexes
            on the schema are retained.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={pending}
            onClick={event => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {pending ? 'Deleting…' : 'Delete config'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
