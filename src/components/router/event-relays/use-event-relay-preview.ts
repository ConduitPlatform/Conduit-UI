'use client';

import { useEffect, useState } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import { previewEventRelayRemote } from '@/lib/api/router';
import { lookupOwnPath } from '@/lib/event-relays/path';

export type EventRelayPreviewState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'unavailable' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; payload: unknown; resourceId?: string };

function tryParseJson(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function useEventRelayPreview(options: {
  messageTemplate: string;
  samplePayload: string;
  resourceIdPath: string;
}): EventRelayPreviewState {
  const debounced = useDebounce(options, 400);
  const [state, setState] = useState<EventRelayPreviewState>({ kind: 'idle' });

  useEffect(() => {
    const template = tryParseJson(debounced.messageTemplate);
    if (template === null) {
      setState({ kind: 'idle' });
      return;
    }

    const sample = tryParseJson(debounced.samplePayload?.trim() || '{}');
    if (sample === null) {
      setState({ kind: 'idle' });
      return;
    }

    let cancelled = false;
    void (async () => {
      setState({ kind: 'loading' });
      const result = await previewEventRelayRemote({
        template,
        sample,
      });
      if (cancelled) return;

      if (result.status === 'unavailable') {
        setState({ kind: 'unavailable' });
        return;
      }
      if (result.status === 'error') {
        setState({ kind: 'error', message: result.message });
        return;
      }

      let resourceId: string | undefined;
      try {
        const resolved = lookupOwnPath(
          sample,
          debounced.resourceIdPath.trim() || 'documentId'
        );
        if (resolved !== undefined) {
          resourceId = String(resolved);
        }
      } catch {
        resourceId = undefined;
      }

      setState({
        kind: 'ready',
        payload: result.payload,
        resourceId,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return state;
}
