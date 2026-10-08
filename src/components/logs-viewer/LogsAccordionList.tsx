'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowUp, ScrollText } from 'lucide-react';

import { Accordion } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/lib/hooks/use-toast';
import type { LogsData } from '@/lib/models/logs-viewer';
import { cn } from '@/lib/utils';

import { LogAccordionItem } from './LogAccordionItem';

const NEAR_TOP_PX = 80;

type LogsAccordionListProps = {
  className?: string;
  logs: LogsData[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

function LogsListSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-4" aria-hidden>
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={`log-skeleton-${index}`}
          className="relative grid min-h-10 grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-2 overflow-hidden rounded-md border border-border bg-surface-1 px-3 before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-border-strong lg:grid-cols-[10.75rem_auto_auto_minmax(0,1fr)]"
        >
          <Skeleton className="hidden h-4 w-36 shrink-0 lg:block" />
          <Skeleton className="h-5 w-12 shrink-0 rounded-full" />
          <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
          <Skeleton className="h-4 min-w-0 flex-1" />
        </div>
      ))}
    </div>
  );
}

export function LogsAccordionList({
  className,
  logs,
  isLoading = false,
  error = null,
  onRetry,
}: Readonly<LogsAccordionListProps>) {
  const [value, setValue] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [followLatest, setFollowLatest] = useState(true);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const updateFollowLatest = useCallback(() => {
    const container = logsContainerRef.current;
    if (!container) return;
    setFollowLatest(container.scrollTop <= NEAR_TOP_PX);
  }, []);

  const scrollToLatest = useCallback(() => {
    const container = logsContainerRef.current;
    if (!container) return;
    container.scrollTop = 0;
    setFollowLatest(true);
  }, []);

  const handleCopyToClipboard = useCallback(
    async (id: string, json: Record<string, unknown>) => {
      try {
        await navigator.clipboard.writeText(JSON.stringify(json, null, 2));
        setCopiedId(id);
        toast({
          title: 'Copied',
          description: 'Log metadata copied to clipboard.',
        });
        window.setTimeout(() => {
          setCopiedId(current => (current === id ? null : current));
        }, 2000);
      } catch {
        toast({
          variant: 'destructive',
          title: 'Copy failed',
          description: 'Could not copy log metadata.',
        });
      }
    },
    [toast]
  );

  useEffect(() => {
    if (followLatest && !value) {
      scrollToLatest();
    }
  }, [followLatest, logs, scrollToLatest, value]);

  return (
    <div className={cn('relative min-h-0 flex-1 overflow-hidden', className)}>
      <div
        ref={logsContainerRef}
        data-vaul-no-drag=""
        onScroll={updateFollowLatest}
        className="absolute inset-x-0 top-0 overflow-x-hidden overflow-y-auto overscroll-contain touch-pan-y main-scrollbar"
        style={{ bottom: 'var(--snap-point-height, 0px)' }}
      >
        {isLoading ? (
          <LogsListSkeleton />
        ) : (
          <>
            {error ? (
              <div className="p-4">
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Could not load logs</AlertTitle>
                  <AlertDescription className="flex flex-col gap-2">
                    <p>{error}</p>
                    {onRetry ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-fit"
                        onClick={onRetry}
                      >
                        Retry
                      </Button>
                    ) : null}
                  </AlertDescription>
                </Alert>
              </div>
            ) : null}
            {!error && logs.length === 0 ? (
              <EmptyState
                icon={ScrollText}
                title="No logs for this query"
                description="Adjust the time range, filters, or search and try again."
                className="py-12"
              />
            ) : null}
            {logs.length > 0 ? (
              <Accordion
                type="single"
                collapsible
                value={value}
                onValueChange={setValue}
                className="flex w-full min-w-0 flex-col gap-2 px-4 py-3"
              >
                {logs.map((log, index) => {
                  const itemId = `item-${log.timestamp}-${index}`;

                  return (
                    <LogAccordionItem
                      key={itemId}
                      itemId={itemId}
                      log={log}
                      isCopied={copiedId === itemId}
                      onCopy={handleCopyToClipboard}
                    />
                  );
                })}
              </Accordion>
            ) : null}
          </>
        )}
      </div>
      {!followLatest && logs.length > 0 && !isLoading ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="absolute right-4 bottom-3 shadow-2"
          style={{
            transform: 'translateY(calc(var(--snap-point-height, 0px) * -1))',
          }}
          onClick={scrollToLatest}
        >
          <ArrowUp className="size-4" />
          Jump to latest
        </Button>
      ) : null}
    </div>
  );
}
