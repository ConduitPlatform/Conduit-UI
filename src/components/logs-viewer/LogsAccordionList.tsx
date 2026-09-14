'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import JsonViewer from './JsonViewer';
import {
  AlertCircle,
  ArrowDown,
  CheckCheck,
  Files,
  ScrollText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LogsData } from '@/lib/models/logs-viewer';
import {
  formatLogModule,
  getFormattedDate,
  getFormattedMessage,
  getFormattedMetadata,
  getLogDate,
} from '@/lib/models/logs-viewer/utils';
import { useToast } from '@/lib/hooks/use-toast';

const NEAR_BOTTOM_PX = 80;

const badgeBackgroundColorVariants: Record<string, string> = {
  critical:
    'border-log-critical/40 bg-log-critical/10 text-log-critical hover:bg-log-critical/15',
  warning:
    'border-log-warning/40 bg-log-warning/10 text-log-warning hover:bg-log-warning/15',
  error:
    'border-log-critical/40 bg-log-critical/10 text-log-critical hover:bg-log-critical/15',
  info: 'border-log-info/40 bg-log-info/10 text-log-info hover:bg-log-info/15',
  debug:
    'border-log-debug/40 bg-log-debug/10 text-log-debug hover:bg-log-debug/15',
  unknown:
    'border-log-unknown/40 bg-log-unknown/10 text-log-unknown hover:bg-log-unknown/15',
};

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
          className="flex items-center gap-2 rounded-md border border-border bg-surface-1 px-3 py-2"
        >
          <Skeleton className="h-4 w-28 shrink-0" />
          <Skeleton className="h-5 w-12 shrink-0 rounded-full" />
          <Skeleton className="h-5 w-24 shrink-0 rounded-full" />
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
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setFollowLatest(distanceFromBottom <= NEAR_BOTTOM_PX);
  }, []);

  const scrollToLatest = useCallback(() => {
    const container = logsContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
    setFollowLatest(true);
  }, []);

  const handleCopyToClipboard = async (id: string, json: object) => {
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
  };

  useEffect(() => {
    if (followLatest && !value) {
      scrollToLatest();
    }
  }, [followLatest, logs, scrollToLatest, value]);

  return (
    <div className={cn('relative min-h-0 flex-1 overflow-hidden', className)}>
      <div
        ref={logsContainerRef}
        onScroll={updateFollowLatest}
        className="h-full min-h-0 overflow-x-hidden overflow-y-scroll overscroll-contain main-scrollbar"
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
                  const { level, message, timestamp, module } = log;
                  const itemId = `item-${timestamp}-${index}`;
                  const metadata = getFormattedMetadata(message);
                  const levelKey = (level || 'unknown').toLowerCase();
                  const levelClass =
                    badgeBackgroundColorVariants[levelKey] ??
                    badgeBackgroundColorVariants.unknown;
                  const logDate = getLogDate(timestamp);
                  const formattedDate = getFormattedDate(timestamp);

                  return (
                    <AccordionItem
                      key={itemId}
                      value={itemId}
                      className="min-w-0 overflow-hidden rounded-md border border-border bg-surface-1"
                    >
                      <AccordionTrigger
                        className={cn(
                          'min-h-8 min-w-0 px-3 py-2 text-left text-sm font-normal hover:no-underline focus-visible:ring-2 focus-visible:ring-ring',
                          value === itemId
                            ? 'rounded-t-md border-b border-border bg-surface-2'
                            : 'rounded-md hover:bg-surface-2'
                        )}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <time
                            dateTime={logDate?.toISOString()}
                            className="hidden w-[11.5rem] shrink-0 tabular-nums text-xs text-muted-foreground sm:block"
                          >
                            {formattedDate}
                          </time>
                          <Badge
                            className={cn(
                              'shrink-0 font-normal capitalize',
                              levelClass
                            )}
                          >
                            {level || 'unknown'}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="min-w-0 max-w-28 shrink-0 truncate font-normal"
                          >
                            {formatLogModule(module)}
                          </Badge>
                          <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                            {getFormattedMessage(message) || message}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="relative min-w-0 pb-0">
                        <div className="flex items-center justify-between gap-2 px-3 pt-3 sm:hidden">
                          <time
                            dateTime={logDate?.toISOString()}
                            className="tabular-nums text-xs text-muted-foreground"
                          >
                            {formattedDate}
                          </time>
                        </div>
                        {typeof metadata === 'string' ? (
                          <p className="px-3 py-3 text-sm text-muted-foreground">
                            {metadata}
                          </p>
                        ) : (
                          <div className="min-w-0 max-w-full overflow-x-auto overscroll-contain main-scrollbar">
                            <JsonViewer json={metadata} />
                          </div>
                        )}
                        {copiedId === itemId ? (
                          <span className="absolute top-3 right-6 text-foreground">
                            <CheckCheck className="size-4" />
                            <span className="sr-only">Copied</span>
                          </span>
                        ) : (
                          <Button
                            onClick={() =>
                              handleCopyToClipboard(
                                itemId,
                                typeof metadata === 'string'
                                  ? { message: metadata }
                                  : metadata
                              )
                            }
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-3 text-muted-foreground hover:text-primary"
                          >
                            <Files className="size-4" />
                            <span className="sr-only">Copy log metadata</span>
                          </Button>
                        )}
                      </AccordionContent>
                    </AccordionItem>
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
          onClick={scrollToLatest}
        >
          <ArrowDown className="size-4" />
          Jump to latest
        </Button>
      ) : null}
    </div>
  );
}
