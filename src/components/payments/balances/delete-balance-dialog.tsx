'use client';

import { useState } from 'react';
import type { CustomerBalance } from '@/lib/models/payments';
import { updateBalance } from '@/lib/api/payments';
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

interface DeleteBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: CustomerBalance | null;
  onSuccess: () => void;
}

export function DeleteBalanceDialog({
  open,
  onOpenChange,
  balance,
  onSuccess,
}: DeleteBalanceDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!balance?._id) return;
    setLoading(true);
    try {
      await updateBalance(balance._id, { amount: 0 });
      toast({ title: 'Removed', description: 'Balance entry deleted.' });
      onSuccess();
      onOpenChange(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Could not delete balance.',
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
          <DialogTitle>Delete balance?</DialogTitle>
          <DialogDescription>
            Removes this {balance?.creditType} balance ({balance?.amount ?? '—'}
            ). This uses the admin API (amount ≤ 0 deletes).
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={loading}
            onClick={handleDelete}
          >
            {loading ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
