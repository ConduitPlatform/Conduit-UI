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

type Alert = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  cancelText?: string;
  actionText?: string;
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
  const addAlert = (alert: Alert) => {
    setAlert(alert);
    setOpen(true);
  };
  useEffect(() => {
    if (!isOpen) setAlert(undefined);
  }, [open]);

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
              <AlertDialogDescription>
                {alert.description ??
                  "You'll lose your changes if you don't save them."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => alert.onDecision(true)}>
                {alert.cancelText ?? 'Cancel'}
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => alert.onDecision(false)}>
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
