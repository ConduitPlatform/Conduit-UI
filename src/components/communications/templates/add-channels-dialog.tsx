'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { migrateFromEmailTemplate } from '@/lib/api/communications/templates';
import { MigrationResponse } from '@/lib/models/communications/template-row';
import { formatCommunicationsApiError } from '@/lib/logic/communications-api-error';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/lib/hooks/use-toast';
import { Loader2 } from 'lucide-react';

type AddChannelsDialogProps = {
  emailTemplateId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddChannelsDialog({
  emailTemplateId,
  open,
  onOpenChange,
}: AddChannelsDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [preview, setPreview] = useState<MigrationResponse | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !emailTemplateId) {
      setPreview(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoadingPreview(true);
    setError(null);

    migrateFromEmailTemplate({ emailTemplateId, dryRun: true })
      .then(response => {
        if (!cancelled) {
          setPreview(response);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(formatCommunicationsApiError(err));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingPreview(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, emailTemplateId]);

  const handleConfirm = async () => {
    if (!emailTemplateId) return;

    setIsMigrating(true);
    try {
      await migrateFromEmailTemplate({
        emailTemplateId,
        deleteSource: false,
      });
      toast({
        title: 'Communications',
        description: 'Unified template created',
      });
      onOpenChange(false);
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

  const plannedItem = preview?.planned[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add channels</DialogTitle>
          <DialogDescription>
            Create a unified copy of this email template so you can add push and
            SMS content. The source email template will be kept.
          </DialogDescription>
        </DialogHeader>

        {isLoadingPreview && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading preview…
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Preview failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {plannedItem && !isLoadingPreview && (
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Source: </span>
              <span className="font-medium">{plannedItem.sourceName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Channels: </span>
              <span>{plannedItem.target.channels.join(', ')}</span>
            </div>
            {plannedItem.target.variables &&
              plannedItem.target.variables.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Variables: </span>
                  <span>{plannedItem.target.variables.join(', ')}</span>
                </div>
              )}
            {plannedItem.warning && (
              <Alert>
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>{plannedItem.warning}</AlertDescription>
              </Alert>
            )}
            {plannedItem.skipped && (
              <Alert>
                <AlertTitle>Skipped</AlertTitle>
                <AlertDescription>
                  A unified template with this name already exists.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isMigrating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              isLoadingPreview ||
              isMigrating ||
              !!error ||
              !plannedItem ||
              plannedItem.skipped
            }
          >
            {isMigrating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create unified copy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
