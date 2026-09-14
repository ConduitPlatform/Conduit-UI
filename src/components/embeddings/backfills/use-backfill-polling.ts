'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BACKFILL_POLL_MS } from '@/lib/models/embeddings/backfill-view';

export function useBackfillPolling(active: boolean) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const stop = () => {
      if (!timer) return;
      clearTimeout(timer);
      timer = undefined;
    };

    const loop = () => {
      if (cancelled || document.hidden) return;
      router.refresh();
      timer = setTimeout(loop, BACKFILL_POLL_MS);
    };

    const start = () => {
      if (timer || cancelled || document.hidden) return;
      timer = setTimeout(loop, BACKFILL_POLL_MS);
    };

    const onVisibility = () => {
      if (document.hidden) {
        stop();
        return;
      }
      router.refresh();
      start();
    };

    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [active, router]);
}
