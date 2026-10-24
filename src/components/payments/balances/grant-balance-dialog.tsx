'use client';

import { useState } from 'react';
import { grantBalance } from '@/lib/api/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/lib/hooks/use-toast';

interface GrantBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function GrantBalanceDialog({
  open,
  onOpenChange,
  onSuccess,
}: GrantBalanceDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    creditType: '',
    amount: 0,
    expiry: '',
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await grantBalance({
        userId: formData.userId,
        creditType: formData.creditType,
        amount: formData.amount,
        expiry: formData.expiry || undefined,
      });
      toast({
        title: 'Success',
        description: 'Balance granted successfully',
      });
      onSuccess();
      setFormData({
        userId: '',
        creditType: '',
        amount: 0,
        expiry: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to grant balance',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Grant Balance</DialogTitle>
          <DialogDescription>
            Grant virtual currency balance to a customer.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              value={formData.userId}
              onChange={e => handleChange('userId', e.target.value)}
              placeholder="Enter user ID"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="creditType">Credit Type</Label>
            <Input
              id="creditType"
              value={formData.creditType}
              onChange={e => handleChange('creditType', e.target.value)}
              placeholder="e.g., minutes, tokens, credits"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              value={formData.amount}
              onChange={e =>
                handleChange('amount', parseInt(e.target.value) || 0)
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry">Expiry Date (Optional)</Label>
            <Input
              id="expiry"
              type="datetime-local"
              value={formData.expiry}
              onChange={e => handleChange('expiry', e.target.value)}
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
              {loading ? 'Granting...' : 'Grant Balance'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
