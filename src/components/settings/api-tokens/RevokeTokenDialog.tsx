'use client';

import { useState } from 'react';
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
import { useToast } from '@/lib/hooks/use-toast';
import { revokeApiToken } from '@/lib/api/api-tokens';
import { ApiToken } from '@/lib/models/api-tokens';

interface RevokeTokenDialogProps {
  token: ApiToken | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RevokeTokenDialog({
  token,
  onOpenChange,
  onSuccess,
}: RevokeTokenDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRevoke = async () => {
    if (!token) return;

    setLoading(true);
    try {
      await revokeApiToken(token._id);
      toast({
        title: 'Token revoked',
        description: `The token "${token.name}" has been revoked.`,
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke token',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={!!token} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke Token?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to revoke &quot;{token?.name}&quot;? Any
            applications using this token will immediately lose access.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRevoke}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Revoking...' : 'Revoke Token'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
