'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { LiveConnectionState } from '@/lib/hooks/use-database-live-updates';

type LiveUpdatesStatusProps = {
  connectionState: LiveConnectionState;
  pendingUpdates: number;
  errorMessage?: string | null;
  onApplyUpdates: () => void;
};

const STATE_LABEL: Record<Exclude<LiveConnectionState, 'idle'>, string> = {
  connecting: 'Connecting',
  live: 'Live',
  reconnecting: 'Reconnecting',
  error: 'Unavailable',
};

export function LiveUpdatesStatus({
  connectionState,
  pendingUpdates,
  errorMessage,
  onApplyUpdates,
}: LiveUpdatesStatusProps) {
  if (connectionState === 'idle') return null;

  const statusHint =
    connectionState === 'error'
      ? errorMessage || 'Live updates are unavailable'
      : connectionState === 'live'
        ? 'Listening for document changes. The table does not refresh until you apply updates.'
        : 'Connecting to live updates.';

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className="inline-flex min-h-8 items-center gap-2 px-2 text-xs font-medium text-muted-foreground"
              aria-live="polite"
            >
              <span
                className={cn(
                  'size-2 rounded-full',
                  connectionState === 'live' && 'bg-status-healthy',
                  connectionState === 'connecting' && 'bg-status-info',
                  connectionState === 'reconnecting' && 'bg-status-warning',
                  connectionState === 'error' && 'bg-status-critical'
                )}
              />
              {STATE_LABEL[connectionState]}
            </span>
          </TooltipTrigger>
          <TooltipContent>{statusHint}</TooltipContent>
        </Tooltip>

        {pendingUpdates > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="min-h-8 gap-2 tabular-nums"
                onClick={onApplyUpdates}
              >
                {pendingUpdates}{' '}
                {pendingUpdates === 1
                  ? 'update available'
                  : 'updates available'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Refresh the current filtered page. Open documents stay as they
              are.
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
