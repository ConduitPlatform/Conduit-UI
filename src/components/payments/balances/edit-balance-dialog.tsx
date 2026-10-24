'use client';

import { useEffect, useState } from 'react';
import type { CustomerBalance } from '@/lib/models/payments';
import { updateBalance } from '@/lib/api/payments';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/lib/hooks/use-toast';

interface EditBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: CustomerBalance | null;
  onSuccess: () => void;
}

export function EditBalanceDialog({
  open,
  onOpenChange,
  balance,
  onSuccess,
}: EditBalanceDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (!balance || !open) return;
    setAmount(String(balance.amount));
  }, [balance, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balance?._id) return;
    const n = Number(amount);
    if (Number.isNaN(n) || n <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Enter a positive number, or delete the balance instead.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      await updateBalance(balance._id, { amount: n });
      toast({ title: 'Updated', description: 'Balance amount saved.' });
      onSuccess();
      onOpenChange(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update balance.',
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
          <DialogTitle>Edit balance</DialogTitle>
          <DialogDescription>
            Update the credit amount for{' '}
            <span className="font-medium">{balance?.creditType}</span>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="balance-amount">Amount</Label>
            <Input
              id="balance-amount"
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
