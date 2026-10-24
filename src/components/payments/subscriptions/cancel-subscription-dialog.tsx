'use client';

import { useState } from 'react';
import type { Subscription } from '@/lib/models/payments';
import { cancelSubscription } from '@/lib/api/payments';
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

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: Subscription | null;
  onSuccess: () => void;
}

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  subscription,
  onSuccess,
}: CancelSubscriptionDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!subscription?._id) return;
    setLoading(true);
    try {
      await cancelSubscription(subscription._id);
      toast({ title: 'Canceled', description: 'Subscription was canceled.' });
      onSuccess();
      onOpenChange(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Could not cancel subscription.',
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
          <DialogTitle>Cancel subscription?</DialogTitle>
          <DialogDescription>
            This sets status to canceled and deactivates the subscription on the
            server. This cannot be undone from the admin UI.
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
            onClick={handleCancel}
          >
            {loading ? 'Canceling…' : 'Cancel subscription'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
