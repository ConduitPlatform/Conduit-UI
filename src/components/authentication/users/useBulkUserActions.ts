'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAlerts } from '@/components/providers/AlertProvider';
import { blockUserResult, deleteUserResult } from '@/lib/api/authentication';
import {
  BULK_CONCURRENCY,
  BULK_LIMIT,
  bulkDeletePhrase,
  runBulk,
  type BulkFailure,
} from '@/lib/authentication/bulk';
import { toast } from '@/lib/hooks/use-toast';
import type { User } from '@/lib/models/User';

export type BulkActionName = 'delete' | 'block' | 'unblock';

export type BulkFailureDetail = BulkFailure & { label: string };

export type BulkStatus =
  | { kind: 'idle' }
  | { kind: 'running'; action: BulkActionName; done: number; total: number }
  | {
      kind: 'finished';
      action: BulkActionName;
      ok: string[];
      failed: BulkFailureDetail[];
    };

function userLabel(user: User): string {
  return user.email || user._id;
}

function noun(count: number): string {
  return count === 1 ? 'user' : 'users';
}

function pastTense(action: BulkActionName): string {
  if (action === 'delete') return 'deleted';
  if (action === 'block') return 'blocked';
  return 'unblocked';
}

/** Per-user block, unblock, and delete over the current selection. */
export function useBulkUserActions(onSettled?: (failedIds: string[]) => void) {
  const { addAlert } = useAlerts();
  const router = useRouter();
  const [status, setStatus] = useState<BulkStatus>({ kind: 'idle' });
  const running = useRef(false);

  const execute = useCallback(
    async (
      action: BulkActionName,
      users: readonly User[],
      perform: (
        user: User
      ) => Promise<{ ok: true } | { ok: false; message: string }>
    ) => {
      if (running.current) return;
      if (users.length === 0 || users.length > BULK_LIMIT) {
        toast({
          title: users.length > BULK_LIMIT ? 'Too many users' : 'Nothing to do',
          description:
            users.length > BULK_LIMIT
              ? `Select at most ${BULK_LIMIT} users.`
              : 'Select at least one user.',
          variant: 'destructive',
        });
        return;
      }
      running.current = true;
      const total = users.length;
      setStatus({ kind: 'running', action, done: 0, total });
      const byId = new Map(users.map(user => [user._id, user]));
      try {
        const result = await runBulk(
          users.map(user => user._id),
          async id => {
            const user = byId.get(id);
            if (!user) throw new Error('User is no longer on this page');
            const outcome = await perform(user);
            if (!outcome.ok) throw new Error(outcome.message);
          },
          {
            concurrency: BULK_CONCURRENCY,
            onProgress: (done, progressTotal) =>
              setStatus({
                kind: 'running',
                action,
                done,
                total: progressTotal,
              }),
          }
        );
        const failed: BulkFailureDetail[] = result.failed.map(failure => {
          const user = byId.get(failure.id);
          return { ...failure, label: user ? userLabel(user) : failure.id };
        });
        setStatus({ kind: 'finished', action, ok: result.ok, failed });
        if (failed.length === 0) {
          toast({ title: `${total} ${noun(total)} ${pastTense(action)}` });
        } else if (result.ok.length === 0) {
          toast({
            title: `Could not ${action} ${total} ${noun(total)}`,
            description: failed[0]?.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: `${result.ok.length} of ${total} users ${pastTense(action)}. ${failed.length} failed`,
            variant: 'destructive',
          });
        }
        onSettled?.(failed.map(failure => failure.id));
        router.refresh();
      } finally {
        running.current = false;
      }
    },
    [onSettled, router]
  );

  const block = useCallback(
    (users: readonly User[]) => {
      const targets = users.filter(user => user.active);
      const skipped = users.length - targets.length;
      if (targets.length === 0) return;
      const count = `${targets.length} ${noun(targets.length)}`;
      addAlert({
        title: `Block ${count}`,
        description:
          skipped > 0
            ? `They are signed out everywhere and cannot sign in until unblocked. ${skipped} already blocked will be skipped.`
            : 'They are signed out everywhere and cannot sign in until unblocked.',
        actionText: `Block ${count}`,
        cancelText: 'Cancel',
        onDecision: cancel => {
          if (cancel) return;
          void execute('block', targets, async user => {
            const result = await blockUserResult(user._id, true);
            return result.ok
              ? { ok: true }
              : { ok: false, message: result.message };
          });
        },
      });
    },
    [addAlert, execute]
  );

  const unblock = useCallback(
    (users: readonly User[]) => {
      const targets = users.filter(user => !user.active);
      const skipped = users.length - targets.length;
      if (targets.length === 0) return;
      const count = `${targets.length} ${noun(targets.length)}`;
      addAlert({
        title: `Unblock ${count}`,
        description:
          skipped > 0
            ? `They will be able to sign in again. ${skipped} already active will be skipped.`
            : 'They will be able to sign in again.',
        actionText: `Unblock ${count}`,
        cancelText: 'Cancel',
        onDecision: cancel => {
          if (cancel) return;
          void execute('unblock', targets, async user => {
            const result = await blockUserResult(user._id, false);
            return result.ok
              ? { ok: true }
              : { ok: false, message: result.message };
          });
        },
      });
    },
    [addAlert, execute]
  );

  const remove = useCallback(
    (users: readonly User[]) => {
      if (users.length === 0) return;
      const labels = users.map(userLabel);
      const shown = labels.slice(0, 5);
      const rest = labels.length - shown.length;
      const summary =
        rest > 0 ? `${shown.join(', ')} and ${rest} more` : shown.join(', ');
      const count = `${users.length} ${noun(users.length)}`;
      addAlert({
        title: `Delete ${count}`,
        description: `${summary}\n\nThis permanently deletes the accounts, their sessions, realm memberships and team memberships. This cannot be undone.`,
        actionText: `Delete ${count}`,
        cancelText: 'Cancel',
        variant: 'destructive',
        confirmPhrase: bulkDeletePhrase(users.length),
        onDecision: cancel => {
          if (cancel) return;
          void execute('delete', users, async user => {
            const result = await deleteUserResult(user._id);
            return result.ok
              ? { ok: true }
              : { ok: false, message: result.message };
          });
        },
      });
    },
    [addAlert, execute]
  );

  return { status, block, unblock, remove };
}
