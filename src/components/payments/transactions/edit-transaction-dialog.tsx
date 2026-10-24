'use client';

import { useEffect, useState } from 'react';
import type { Transaction } from '@/lib/models/payments';
import { updateTransaction } from '@/lib/api/payments';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/lib/hooks/use-toast';

const STATUSES = ['prepared', 'success', 'failed', 'cancelled'] as const;

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  onSuccess: () => void;
}

export function EditTransactionDialog({
  open,
  onOpenChange,
  transaction,
  onSuccess,
}: EditTransactionDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('prepared');
  const [price, setPrice] = useState<string>('');
  const [priceWithVat, setPriceWithVat] = useState<string>('');

  useEffect(() => {
    if (!transaction || !open) return;
    setStatus(transaction.status ?? 'prepared');
    setPrice(transaction.price != null ? String(transaction.price) : '');
    setPriceWithVat(
      transaction.priceWithVat != null ? String(transaction.priceWithVat) : ''
    );
  }, [transaction, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction?._id) return;
    setLoading(true);
    try {
      await updateTransaction(transaction._id, {
        status,
        price: price === '' ? undefined : Number(price),
        priceWithVat: priceWithVat === '' ? undefined : Number(priceWithVat),
      });
      toast({ title: 'Saved', description: 'Transaction updated.' });
      onSuccess();
      onOpenChange(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update transaction.',
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
          <DialogTitle>Edit transaction</DialogTitle>
          <DialogDescription>
            Amounts are in the same minor units as stored by the payments module
            (typically cents).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map(s => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tx-price">Price (minor units)</Label>
            <Input
              id="tx-price"
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tx-price-vat">Price with VAT (minor units)</Label>
            <Input
              id="tx-price-vat"
              type="number"
              value={priceWithVat}
              onChange={e => setPriceWithVat(e.target.value)}
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
