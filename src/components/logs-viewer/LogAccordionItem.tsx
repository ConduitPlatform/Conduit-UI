import { memo } from 'react';
import { CheckCheck, ClipboardCopy, ScrollText } from 'lucide-react';

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { LogsData } from '@/lib/models/logs-viewer';
import {
  formatLogDate,
  formatLogModule,
  getFormattedMessage,
  getFormattedMetadata,
  getLogDate,
  parseLogSummary,
} from '@/lib/models/logs-viewer/utils';
import type { HttpMethod, LogSummary } from '@/lib/models/logs-viewer/utils';
import { cn } from '@/lib/utils';

import JsonViewer from './JsonViewer';

const levelStyles: Record<string, { badge: string; rail: string }> = {
  critical: {
    badge:
      'border-log-critical/40 bg-log-critical/10 text-log-critical hover:bg-log-critical/15',
    rail: 'before:bg-log-critical',
  },
  warning: {
    badge:
      'border-log-warning/40 bg-log-warning/10 text-log-warning hover:bg-log-warning/15',
    rail: 'before:bg-log-warning',
  },
  error: {
    badge:
      'border-log-critical/40 bg-log-critical/10 text-log-critical hover:bg-log-critical/15',
    rail: 'before:bg-log-critical',
  },
  info: {
    badge:
      'border-log-info/40 bg-log-info/10 text-log-info hover:bg-log-info/15',
    rail: 'before:bg-log-info',
  },
  debug: {
    badge:
      'border-log-debug/40 bg-log-debug/10 text-log-debug hover:bg-log-debug/15',
    rail: 'before:bg-log-debug',
  },
  unknown: {
    badge:
      'border-log-unknown/40 bg-log-unknown/10 text-log-unknown hover:bg-log-unknown/15',
    rail: 'before:bg-log-unknown',
  },
};

const methodStyles: Record<HttpMethod, string> = {
  GET: 'text-http-get',
  POST: 'text-http-post',
  PUT: 'text-http-put',
  PATCH: 'text-http-patch',
  DELETE: 'text-http-delete',
  HEAD: 'text-http-head',
  OPTIONS: 'text-http-options',
};

type LogAccordionItemProps = {
  itemId: string;
  log: LogsData;
  isCopied: boolean;
  onCopy: (id: string, metadata: Record<string, unknown>) => void;
};

function getStatusStyle(statusCode: number) {
  if (statusCode >= 500) return 'text-status-critical';
  if (statusCode >= 400) return 'text-status-warning';
  if (statusCode >= 300) return 'text-status-info';
  if (statusCode >= 200) return 'text-status-healthy';
  return 'text-status-unknown';
}

function LogMessage({ summary }: Readonly<{ summary: LogSummary }>) {
  switch (summary.type) {
    case 'http':
      return (
        <span className="flex min-w-0 items-center gap-2 font-mono text-xs">
          <span
            className={cn(
              'w-12 shrink-0 font-semibold tracking-wider',
              methodStyles[summary.method]
            )}
          >
            {summary.method}
          </span>
          <span className="min-w-0 flex-1 truncate text-foreground">
            {summary.path}
          </span>
          <span
            className={cn(
              'shrink-0 tabular-nums font-medium',
              getStatusStyle(summary.statusCode)
            )}
          >
            {summary.statusCode}
          </span>
          <span className="hidden w-14 shrink-0 text-right tabular-nums text-muted-foreground xl:block">
            {summary.duration}
          </span>
        </span>
      );
    case 'text':
      return (
        <span className="block min-w-0 truncate text-[13px] text-foreground">
          {summary.text}
        </span>
      );
    default: {
      const exhaustiveCheck: never = summary;
      return exhaustiveCheck;
    }
  }
}

function LogDetails({
  itemId,
  message,
  isCopied,
  onCopy,
  dateTime,
  formattedDate,
}: Readonly<{
  itemId: string;
  message: string;
  isCopied: boolean;
  onCopy: LogAccordionItemProps['onCopy'];
  dateTime?: string;
  formattedDate: string;
}>) {
  const metadata = getFormattedMetadata(message);
  const copyMetadata =
    typeof metadata === 'string' ? { message: metadata } : metadata;

  return (
    <>
      <div className="flex min-h-10 items-center justify-between gap-3 border-y border-border bg-surface-1/60 px-3">
        <div className="flex min-w-0 items-center gap-2">
          <ScrollText className="size-4 shrink-0 text-muted-foreground" />
          <span className="hidden shrink-0 text-xs font-medium text-foreground sm:inline">
            Log details
          </span>
          <time
            dateTime={dateTime}
            className="whitespace-nowrap tabular-nums text-xs text-muted-foreground sm:hidden"
          >
            {formattedDate}
          </time>
        </div>
        <Button
          onClick={() => onCopy(itemId, copyMetadata)}
          aria-label={isCopied ? 'Log metadata copied' : 'Copy log metadata'}
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 text-xs text-muted-foreground hover:text-foreground"
        >
          {isCopied ? (
            <CheckCheck data-icon="inline-start" />
          ) : (
            <ClipboardCopy data-icon="inline-start" />
          )}
          {isCopied ? (
            'Copied'
          ) : (
            <>
              Copy
              <span className="hidden sm:inline"> metadata</span>
            </>
          )}
        </Button>
      </div>
      {typeof metadata === 'string' ? (
        <p className="m-3 rounded-md border border-border bg-code-bg p-3 font-mono text-xs text-muted-foreground">
          {metadata}
        </p>
      ) : (
        <div className="min-w-0 max-w-full overflow-x-auto overscroll-contain main-scrollbar">
          <JsonViewer json={metadata} />
        </div>
      )}
    </>
  );
}

export const LogAccordionItem = memo(function LogAccordionItem({
  itemId,
  log,
  isCopied,
  onCopy,
}: Readonly<LogAccordionItemProps>) {
  const { level, message, timestamp, module } = log;
  const formattedMessage = getFormattedMessage(message) || message;
  const summary = parseLogSummary(formattedMessage);
  const levelKey = (level || 'unknown').toLowerCase();
  const levelStyle = levelStyles[levelKey] ?? levelStyles.unknown;
  const logDate = getLogDate(timestamp);
  const formattedDate = formatLogDate(logDate);

  return (
    <AccordionItem
      value={itemId}
      className={cn(
        'relative min-w-0 overflow-hidden rounded-md border border-border bg-surface-1 transition-colors before:absolute before:inset-y-0 before:left-0 before:w-0.5 data-[state=open]:border-border-strong data-[state=open]:bg-surface-2 data-[state=open]:shadow-1',
        levelStyle.rail
      )}
    >
      <AccordionTrigger className="min-h-10 min-w-0 gap-1 py-0 pr-1 pl-3 text-left text-sm font-normal transition-colors hover:bg-surface-2 hover:no-underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset data-[state=closed]:rounded-md data-[state=open]:rounded-t-md [&>svg]:mx-0.5 [&>svg]:size-8 [&>svg]:rounded-sm [&>svg]:p-2">
        <div className="grid min-w-0 flex-1 grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[10.75rem_auto_auto_minmax(0,1fr)]">
          <time
            dateTime={logDate?.toISOString()}
            className="hidden shrink-0 tabular-nums text-xs text-muted-foreground sm:block"
          >
            {formattedDate}
          </time>
          <Badge
            className={cn(
              'shrink-0 px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase',
              levelStyle.badge
            )}
          >
            {level || 'unknown'}
          </Badge>
          <Badge
            variant="secondary"
            className="min-w-0 max-w-24 shrink-0 truncate px-2 py-0.5 text-[11px] font-normal"
          >
            {formatLogModule(module)}
          </Badge>
          <LogMessage summary={summary} />
        </div>
      </AccordionTrigger>
      <AccordionContent className="min-w-0 bg-code-bg/30 pb-0">
        <LogDetails
          itemId={itemId}
          message={message}
          isCopied={isCopied}
          onCopy={onCopy}
          dateTime={logDate?.toISOString()}
          formattedDate={formattedDate}
        />
      </AccordionContent>
    </AccordionItem>
  );
});
