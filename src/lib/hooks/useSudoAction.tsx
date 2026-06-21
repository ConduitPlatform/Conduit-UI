'use client';

import { useCallback, useRef, useState } from 'react';
import { hasSudoAccess } from '@/lib/api/auth';
import { SudoDialog } from '@/components/auth/SudoDialog';

export function useSudoAction() {
  const [sudoOpen, setSudoOpen] = useState(false);
  const pendingActionRef = useRef<(() => Promise<void>) | null>(null);
  const pendingRejectRef = useRef<((reason?: unknown) => void) | null>(null);

  const runWithSudo = useCallback(async (action: () => Promise<void>) => {
    const sudo = await hasSudoAccess();
    if (sudo) {
      return action();
    }

    return new Promise<void>((resolve, reject) => {
      pendingActionRef.current = async () => {
        await action();
        resolve();
      };
      pendingRejectRef.current = reject;
      setSudoOpen(true);
    });
  }, []);

  const handleSudoSuccess = useCallback(async () => {
    setSudoOpen(false);
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    pendingRejectRef.current = null;
    if (action) {
      await action();
    }
  }, []);

  const handleSudoCancel = useCallback(() => {
    setSudoOpen(false);
    pendingActionRef.current = null;
    pendingRejectRef.current?.();
    pendingRejectRef.current = null;
  }, []);

  const sudoDialog = (
    <SudoDialog
      open={sudoOpen}
      onSuccess={handleSudoSuccess}
      onCancel={handleSudoCancel}
    />
  );

  return { runWithSudo, sudoDialog };
}
