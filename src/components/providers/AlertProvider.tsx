'use client';
import * as React from 'react';
import { useContext, useEffect } from 'react';
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
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Alert = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  cancelText?: string;
  actionText?: string;
  variant?: 'default' | 'destructive';
  /** The action stays disabled until the input matches this phrase. */
  confirmPhrase?: string;
  onDecision: (cancel: boolean) => void;
};

type AlertProvider = {
  addAlert: (alert: Alert) => void;
};

const initialState: AlertProvider = {
  addAlert: () => {
    throw new Error('Not implemented');
  },
};

const AlertContext = React.createContext(initialState);
export const useAlerts = () => useContext(AlertContext);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alert, setAlert] = React.useState<Alert | undefined>(undefined);
  const [isOpen, setOpen] = React.useState(false);
  const [phrase, setPhrase] = React.useState('');
  const addAlert = (next: Alert) => {
    setPhrase('');
    setAlert(next);
    setOpen(true);
  };
  useEffect(() => {
    if (!isOpen) setAlert(undefined);
  }, [isOpen]);
  const phraseMatches = !alert?.confirmPhrase || phrase === alert.confirmPhrase;

  return (
    <AlertContext.Provider
      value={{
        addAlert,
      }}
    >
      {alert && (
        <AlertDialog open={isOpen} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {alert.title ?? 'Are you sure?'}
              </AlertDialogTitle>
              <AlertDialogDescription className="whitespace-pre-line text-pretty">
                {alert.description ??
                  "You'll lose your changes if you don't save them."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            {alert.confirmPhrase && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="alert-confirm-phrase">
                  Type {alert.confirmPhrase} to confirm
                </Label>
                <Input
                  id="alert-confirm-phrase"
                  value={phrase}
                  onChange={event => setPhrase(event.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => alert.onDecision(true)}>
                {alert.cancelText ?? 'Cancel'}
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={!phraseMatches}
                className={cn(
                  alert.variant === 'destructive' &&
                    buttonVariants({ variant: 'destructive' })
                )}
                onClick={() => alert.onDecision(false)}
              >
                {alert.actionText ?? 'Continue'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {children}
    </AlertContext.Provider>
  );
}
