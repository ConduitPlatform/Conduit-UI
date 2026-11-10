'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAlerts } from '@/components/providers/AlertProvider';
import type { ActionFailure, ActionResult } from '@/lib/api/action-result';
import { toast } from '@/lib/hooks/use-toast';

export type MutationStatus = 'idle' | 'confirming' | 'saving' | 'error';

export type MutationOutcome =
  | { ok: true }
  | { ok: false; cancelled: true }
  | { ok: false; failure: ActionFailure };

type RunOptions = {
  confirm: {
    title: string;
    description: ReactNode;
    actionText: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
    confirmPhrase?: string;
  };
  perform: () => Promise<ActionResult<unknown>>;
  success: { title: string; description?: string };
  failure: {
    title: string;
    description: string | ((failure: ActionFailure) => string);
  };
  /** Return true when the caller already showed the error (for example on a field). */
  onFailure?: (failure: ActionFailure) => boolean;
  /** A 404 on a route this UI just gained is an old Conduit, not a missing user. */
  unsupportedOn404?: boolean;
};

function failureDescription(
  failure: ActionFailure,
  description: RunOptions['failure']['description'],
  unsupportedOn404: boolean
): string {
  if (
    unsupportedOn404 &&
    (failure.status === 404 || failure.code === 'NOT_FOUND')
  ) {
    return 'Not supported by this Conduit version';
  }
  return typeof description === 'function' ? description(failure) : description;
}

/** Confirm, run a server action, toast, and refresh. One status for the whole flow. */
export function useUserMutation() {
  const { addAlert } = useAlerts();
  const router = useRouter();
  const [status, setStatus] = useState<MutationStatus>('idle');

  const run = useCallback(
    (options: RunOptions) =>
      new Promise<MutationOutcome>(resolve => {
        setStatus('confirming');
        addAlert({
          title: options.confirm.title,
          description: options.confirm.description,
          actionText: options.confirm.actionText,
          cancelText: options.confirm.cancelText ?? 'Cancel',
          variant: options.confirm.variant,
          confirmPhrase: options.confirm.confirmPhrase,
          onDecision: cancel => {
            if (cancel) {
              setStatus('idle');
              resolve({ ok: false, cancelled: true });
              return;
            }
            setStatus('saving');
            options
              .perform()
              .then(result => {
                if (result.ok) {
                  toast({
                    title: options.success.title,
                    description: options.success.description,
                  });
                  router.refresh();
                  setStatus('idle');
                  resolve({ ok: true });
                  return;
                }
                if (options.onFailure?.(result) !== true) {
                  toast({
                    title: options.failure.title,
                    description: failureDescription(
                      result,
                      options.failure.description,
                      options.unsupportedOn404 === true
                    ),
                    variant: 'destructive',
                  });
                }
                setStatus('error');
                resolve({ ok: false, failure: result });
              })
              .catch((error: unknown) => {
                const failure: ActionFailure = {
                  ok: false,
                  code: 'UNKNOWN',
                  message:
                    error instanceof Error ? error.message : 'Request failed',
                };
                toast({
                  title: options.failure.title,
                  description: failureDescription(
                    failure,
                    options.failure.description,
                    false
                  ),
                  variant: 'destructive',
                });
                setStatus('error');
                resolve({ ok: false, failure });
              });
          },
        });
      }),
    [addAlert, router]
  );

  return { status, run };
}
