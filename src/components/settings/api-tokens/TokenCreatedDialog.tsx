'use client';

import { useState } from 'react';
import { AlertTriangle, Check, Copy } from 'lucide-react';
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
import { CreateTokenResponse } from '@/lib/models/api-tokens';

interface TokenCreatedDialogProps {
  token: CreateTokenResponse | null;
  onClose: () => void;
}

export function TokenCreatedDialog({
  token,
  onClose,
}: TokenCreatedDialogProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    if (!token) return;

    try {
      await navigator.clipboard.writeText(token.token);
      setCopied(true);
      toast({
        title: 'Copied',
        description: 'Token copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy token',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={!!token} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Token Created Successfully</DialogTitle>
          <DialogDescription>
            Your API token &quot;{token?.name}&quot; has been created.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-500">
              Copy your token now. It won&apos;t be shown again!
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-muted p-3 font-mono text-sm break-all">
                {token?.token}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              Use this token in your MCP configuration or API requests:
            </p>
            <code className="block mt-2 text-sm font-mono">
              Authorization: Bearer &lt;your-token&gt;
            </code>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose}>I&apos;ve copied it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
