'use client';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import JsonViewer from './JsonViewer';
import { Files } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogsData } from '@/lib/models/logs-viewer';
import {
  getFormattedDate,
  getFormattedMessage,
  getFormattedMetadata,
  logBadgeBackgroundColorMap,
} from '@/lib/models/logs-viewer/utils';

type LogsAccordionListProps = {
  className?: string;
  logs: LogsData[];
};

export function LogsAccordionList({ className, logs }: LogsAccordionListProps) {
  const [value, setValue] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const iconClass = 'w-4 h-4 flex-shrink-0 text-current';

  const handleCopyToClipboard = async (json: object) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(json, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  if (logs.length === 0) {
    return (
      <div className="mx-auto mt-5 text-muted-foreground">
        <p> There no available logs</p>
      </div>
    );
  }

  return (
    <Accordion
      type="single"
      collapsible
      value={value}
      onValueChange={setValue}
      className={cn('w-full overflow-x-auto main-scrollbar p-5', className)}
    >
      {logs.map(({ level, message, timestamp, module }, index) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="my-2 transition-opacity duration-200 border rounded-md bg-background border-input"
        >
          <AccordionTrigger
            className={cn(
              'px-3 py-2 hover:no-underline text-medium justify-start',
              value === `item-${index}`
                ? 'border-b border-b-input rounded-t-md bg-secondary'
                : 'rounded-md hover:bg-secondary'
            )}
          >
            <div className="flex items-start w-full gap-3">
              {getFormattedDate(timestamp)}
              <Badge className={logBadgeBackgroundColorMap[level]}>
                {level}
              </Badge>
              <Badge className="bg-muted-foreground">{module}</Badge>{' '}
              {getFormattedMessage(message)}
            </div>
          </AccordionTrigger>
          <AccordionContent className="relative pb-0">
            <JsonViewer json={getFormattedMetadata(message)} />
            {copied ? (
              <span className="absolute text-sm font-normal top-3 right-6 text-muted-foreground">
                Copied!
              </span>
            ) : (
              <Button
                onClick={() =>
                  handleCopyToClipboard(getFormattedMetadata(message))
                }
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-1 right-3 text-muted-foreground hover:text-primary"
              >
                <Files className={iconClass} />
                <span className="sr-only">Copy log&apos;s metadata</span>
              </Button>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

