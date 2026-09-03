'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import JsonViewer from './JsonViewer';
import { Files, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogsData } from '@/lib/models/logs-viewer';
import {
  getFormattedDate,
  getFormattedMessage,
  getFormattedMetadata,
} from '@/lib/models/logs-viewer/utils';

const badgeBackgroundColorVariants = {
  critical:
    'border-log-critical/40 bg-log-critical/10 text-log-critical hover:bg-log-critical/15',
  warning:
    'border-log-warning/40 bg-log-warning/10 text-log-warning hover:bg-log-warning/15',
  info: 'border-log-info/40 bg-log-info/10 text-log-info hover:bg-log-info/15',
  debug:
    'border-log-debug/40 bg-log-debug/10 text-log-debug hover:bg-log-debug/15',
  unknown:
    'border-log-unknown/40 bg-log-unknown/10 text-log-unknown hover:bg-log-unknown/15',
};

type LogsAccordionListProps = {
  className?: string;
  logs: LogsData[];
};

export function LogsAccordionList({
  className,
  logs,
}: Readonly<LogsAccordionListProps>) {
  const [value, setValue] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const iconClass = 'w-4 h-4 shrink-0 text-current';

  const handleCopyToClipboard = async (json: object) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(json, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy: ', error);
    }
  };

  useEffect(() => {
    if (logsContainerRef.current && !value) {
      logsContainerRef.current.scrollTop =
        logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (logs.length === 0) {
    return (
      <p className="mt-5 text-center text-foreground-muted">
        {' '}
        There no available logs
      </p>
    );
  }

  return (
    <Accordion
      ref={logsContainerRef}
      type="single"
      collapsible
      value={value}
      onValueChange={setValue}
      className={cn(
        'w-full px-5 pt-5 pb-1 overflow-y-auto main-scrollbar h-full',
        className
      )}
    >
      {logs.map(({ level, message, timestamp, module }, index) => {
        return (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="my-2 rounded-md border border-border bg-surface-1 transition-opacity duration-200"
          >
            <AccordionTrigger
              className={cn(
                'px-3 py-2 hover:no-underline text-medium justify-start',
                value === `item-${index}`
                  ? 'rounded-t-md border-b border-b-border bg-surface-2'
                  : 'rounded-md hover:bg-surface-2'
              )}
            >
              <div className="flex items-start w-full gap-3">
                {getFormattedDate(timestamp)}
                <Badge
                  className={cn(
                    badgeBackgroundColorVariants[
                      level as keyof typeof badgeBackgroundColorVariants
                    ]
                  )}
                >
                  {level}
                </Badge>
                <Badge className="bg-surface-3 text-foreground-muted hover:bg-surface-3">
                  {module}
                </Badge>{' '}
                {getFormattedMessage(message)}
              </div>
            </AccordionTrigger>
            <AccordionContent className="relative pb-0">
              <JsonViewer json={getFormattedMetadata(message)} />
              {copied ? (
                <span className="absolute text-sm font-normal top-3 right-6 text-foreground">
                  <CheckCheck className={iconClass} />
                </span>
              ) : (
                <Button
                  onClick={() =>
                    handleCopyToClipboard(getFormattedMetadata(message))
                  }
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-3 text-foreground-muted hover:text-primary"
                >
                  <Files className={iconClass} />
                  <span className="sr-only">Copy log&apos;s metadata</span>
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
