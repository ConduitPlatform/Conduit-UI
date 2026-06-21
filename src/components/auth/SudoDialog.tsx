'use client';

import * as React from 'react';
import { useCallback, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderIcon } from 'lucide-react';
import { completeSudoTwoFactor, sudoReauthenticate } from '@/lib/api/auth';
import { toast } from '@/lib/hooks/use-toast';

type SudoDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  onSuccess: () => void | Promise<void>;
  onCancel: () => void;
};

export function SudoDialog({
  open,
  title = 'Confirm your identity',
  description = 'Re-enter your password to continue with this sensitive action.',
  onSuccess,
  onCancel,
}: SudoDialogProps) {
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [twoFaRequired, setTwoFaRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const reset = useCallback(() => {
    setPassword('');
    setCode('');
    setTwoFaRequired(false);
    setIsLoading(false);
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        reset();
        onCancel();
      }
    },
    [onCancel, reset]
  );

  const handleSuccess = useCallback(async () => {
    try {
      await onSuccess();
      reset();
    } catch {
      toast({
        title: 'Action failed',
        description: 'The operation could not be completed.',
        variant: 'destructive',
      });
    }
  }, [onSuccess, reset]);

  const handlePasswordSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsLoading(true);
      try {
        const result = await sudoReauthenticate(password);
        if (result.status === 'twoFaRequired') {
          setTwoFaRequired(true);
          setIsLoading(false);
          return;
        }
        await handleSuccess();
      } catch {
        toast({
          title: 'Authentication failed',
          description: 'Check your password and try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    },
    [handleSuccess, password]
  );

  const handleTwoFaSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsLoading(true);
      try {
        await completeSudoTwoFactor(code);
        await handleSuccess();
      } catch {
        toast({
          title: 'Verification failed',
          description: 'Check your authenticator code and try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    },
    [code, handleSuccess]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {twoFaRequired ? (
          <form onSubmit={handleTwoFaSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sudo-2fa-code">Authenticator code</Label>
              <Input
                id="sudo-2fa-code"
                type="text"
                autoComplete="one-time-code"
                value={code}
                onChange={event => setCode(event.target.value)}
                disabled={isLoading}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !code}>
                {isLoading ? (
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                ) : (
                  'Verify'
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sudo-password">Password</Label>
              <Input
                id="sudo-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                disabled={isLoading}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !password}>
                {isLoading ? (
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                ) : (
                  'Continue'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
