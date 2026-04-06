'use client';

import { useState } from 'react';
import type { Transaction } from '@/lib/models/payments';
import { cancelTransaction } from '@/lib/api/payments';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/lib/hooks/use-toast';

interface CancelTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  onSuccess: () => void;
}

export function CancelTransactionDialog({
  open,
  onOpenChange,
  transaction,
  onSuccess,
}: CancelTransactionDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!transaction?._id) return;
    setLoading(true);
    try {
      await cancelTransaction(transaction._id);
      toast({
        title: 'Canceled',
        description: 'Transaction status set to cancelled.',
      });
      onSuccess();
      onOpenChange(false);
    } catch {
      toast({
        title: 'Error',
        description:
          'Could not cancel (only prepared or successful transactions can be cancelled).',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel transaction?</DialogTitle>
          <DialogDescription>
            Marks the transaction as cancelled. The server only allows this for
            prepared or successful transactions.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Back
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? 'Working…' : 'Cancel transaction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
