'use client';

import { useEffect, useState } from 'react';
import type { Subscription, SubscriptionStatus } from '@/lib/models/payments';
import { updateSubscription } from '@/lib/api/payments';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/lib/hooks/use-toast';
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from '@/lib/payments/display-helpers';

const STATUSES: SubscriptionStatus[] = [
  'active',
  'canceled',
  'expired',
  'overdue',
];

interface EditSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: Subscription | null;
  onSuccess: () => void;
}

export function EditSubscriptionDialog({
  open,
  onOpenChange,
  subscription,
  onSuccess,
}: EditSubscriptionDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<SubscriptionStatus>('active');
  const [activeUntil, setActiveUntil] = useState('');
  const [nextPayment, setNextPayment] = useState('');
  const [isTrial, setIsTrial] = useState(false);

  useEffect(() => {
    if (!subscription || !open) return;
    setStatus(subscription.status ?? 'active');
    setActiveUntil(toDatetimeLocalValue(subscription.activeUntil));
    setNextPayment(toDatetimeLocalValue(subscription.nextPayment));
    setIsTrial(!!subscription.isTrial);
  }, [subscription, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscription?._id) return;
    setLoading(true);
    try {
      const body: Parameters<typeof updateSubscription>[1] = {
        status,
        isTrial,
      };
      const au = fromDatetimeLocalValue(activeUntil);
      const np = fromDatetimeLocalValue(nextPayment);
      if (au) body.activeUntil = au;
      if (np) body.nextPayment = np;
      await updateSubscription(subscription._id, body);
      toast({ title: 'Success', description: 'Subscription updated.' });
      onSuccess();
      onOpenChange(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update subscription.',
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
          <DialogTitle>Edit subscription</DialogTitle>
          <DialogDescription>
            Adjust status, dates, or trial flag. Changes apply on the server
            immediately.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={v => setStatus(v as SubscriptionStatus)}
            >
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
            <Label htmlFor="activeUntil">Active until</Label>
            <Input
              id="activeUntil"
              type="datetime-local"
              value={activeUntil}
              onChange={e => setActiveUntil(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nextPayment">Next payment</Label>
            <Input
              id="nextPayment"
              type="datetime-local"
              value={nextPayment}
              onChange={e => setNextPayment(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="isTrial"
              checked={isTrial}
              onCheckedChange={setIsTrial}
            />
            <Label htmlFor="isTrial">Trial subscription</Label>
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
