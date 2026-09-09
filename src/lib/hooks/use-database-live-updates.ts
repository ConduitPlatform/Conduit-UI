'use client';

import * as React from 'react';
import { io, type Socket } from 'socket.io-client';
import { issueAdminRealtimeTicket } from '@/lib/api/realtime/ticket';
import {
  parseDatabaseChangeEvent,
  shouldCountChange,
} from '@/lib/realtime/change-events';

export type LiveConnectionState =
  | 'idle'
  | 'connecting'
  | 'live'
  | 'reconnecting'
  | 'error';

const RETRY_BASE_MS = 1_000;
const RETRY_MAX_MS = 15_000;

export function useDatabaseLiveUpdates(options: {
  schemaName: string;
  enabled: boolean;
}) {
  const { schemaName, enabled } = options;
  const [connectionState, setConnectionState] =
    React.useState<LiveConnectionState>('idle');
  const [pendingUpdates, setPendingUpdates] = React.useState(0);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!enabled || schemaName.trim() === '') {
      setConnectionState('idle');
      setPendingUpdates(0);
      setErrorMessage(null);
      return;
    }

    let cancelled = false;
    let socket: Socket | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;
    let everConnected = false;

    const disconnectSocket = () => {
      if (!socket) return;
      socket.removeAllListeners();
      socket.disconnect();
      socket = undefined;
    };

    const connect = async () => {
      if (cancelled) return;
      setConnectionState(everConnected ? 'reconnecting' : 'connecting');
      try {
        const ticket = await issueAdminRealtimeTicket();
        if (cancelled) return;
        disconnectSocket();
        socket = io(`${ticket.socketUrl}${ticket.namespace}`, {
          path: ticket.path,
          auth: { token: ticket.token },
          transports: ['websocket', 'polling'],
          reconnection: false,
        });

        socket.on('connect', () => {
          everConnected = true;
          attempt = 0;
          setErrorMessage(null);
          setConnectionState('live');
          socket?.emit('subscribe', { schema: schemaName });
        });

        socket.on('change', (data: unknown) => {
          const event = parseDatabaseChangeEvent(data);
          if (!event || !shouldCountChange(event, schemaName)) return;
          setPendingUpdates(count => count + 1);
        });

        socket.on('conduit_error', (data: unknown) => {
          const message =
            data &&
            typeof data === 'object' &&
            'message' in data &&
            typeof data.message === 'string'
              ? data.message
              : 'Live updates failed';
          setErrorMessage(message);
          setConnectionState('error');
        });

        socket.on('connect_error', () => {
          scheduleReconnect();
        });

        socket.on('disconnect', reason => {
          if (cancelled || reason === 'io client disconnect') return;
          scheduleReconnect();
        });
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Live updates failed'
        );
        scheduleReconnect();
      }
    };

    const scheduleReconnect = () => {
      if (cancelled || retryTimer) return;
      disconnectSocket();
      setConnectionState(everConnected ? 'reconnecting' : 'error');
      const delay = Math.min(RETRY_MAX_MS, RETRY_BASE_MS * 2 ** attempt);
      attempt += 1;
      retryTimer = setTimeout(() => {
        retryTimer = undefined;
        void connect();
      }, delay);
    };

    void connect();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      disconnectSocket();
    };
  }, [enabled, schemaName]);

  const consumePendingUpdates = React.useCallback(() => {
    setPendingUpdates(0);
  }, []);

  return {
    connectionState,
    pendingUpdates,
    errorMessage,
    consumePendingUpdates,
  };
}
