'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { migrateFromEmailTemplate } from '@/lib/api/communications/templates';
import { formatCommunicationsApiError } from '@/lib/logic/api-error';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/hooks/use-toast';
import { Layers, Loader2 } from 'lucide-react';

type BulkAddChannelsButtonProps = {
  emailTemplateCount: number;
};

export function BulkAddChannelsButton({
  emailTemplateCount,
}: BulkAddChannelsButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isMigrating, setIsMigrating] = useState(false);

  if (emailTemplateCount <= 0) {
    return null;
  }

  const handleBulkMigrate = async () => {
    setIsMigrating(true);
    try {
      const response = await migrateFromEmailTemplate({
        skipExisting: true,
      });
      const createdCount = response.count ?? response.created?.length ?? 0;
      toast({
        title: 'Communications',
        description: `Created ${createdCount} unified template${createdCount === 1 ? '' : 's'}`,
      });
      router.refresh();
    } catch (err) {
      toast({
        title: 'Communications',
        description: formatCommunicationsApiError(err),
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="secondary" type="button" disabled={isMigrating}>
          {isMigrating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Layers className="mr-2 h-4 w-4" />
          )}
          Add channels to all ({emailTemplateCount})
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create unified copies</AlertDialogTitle>
          <AlertDialogDescription>
            Create unified copies for {emailTemplateCount} email template
            {emailTemplateCount === 1 ? '' : 's'}. Templates that already have a
            unified counterpart will be skipped. Source email templates will be
            kept.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isMigrating}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleBulkMigrate} disabled={isMigrating}>
            {isMigrating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create copies
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
