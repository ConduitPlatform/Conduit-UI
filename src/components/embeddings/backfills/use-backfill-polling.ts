'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BACKFILL_POLL_MS } from '@/lib/models/embeddings/backfill-view';

export function useBackfillPolling(active: boolean) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;

    let timer: ReturnType<typeof setInterval> | undefined;

    const tick = () => {
      if (document.hidden) return;
      router.refresh();
    };

    const start = () => {
      if (timer) return;
      timer = setInterval(tick, BACKFILL_POLL_MS);
    };

    const stop = () => {
      if (!timer) return;
      clearInterval(timer);
      timer = undefined;
    };

    const onVisibility = () => {
      if (document.hidden) {
        stop();
        return;
      }
      tick();
      start();
    };

    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [active, router]);
}
