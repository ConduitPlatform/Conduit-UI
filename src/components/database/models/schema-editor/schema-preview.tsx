'use client';

import * as React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Copy, Check } from 'lucide-react';
import { toast } from '@/lib/hooks/use-toast';

type SchemaPreviewProps = {
  schemaName: string;
  fields: Record<string, any>;
};

export function SchemaPreview({ schemaName, fields }: SchemaPreviewProps) {
  const [copied, setCopied] = React.useState(false);

  const jsonString = React.useMemo(() => {
    return JSON.stringify(
      {
        name: schemaName || 'SchemaName',
        fields,
      },
      null,
      2
    );
  }, [schemaName, fields]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast({ title: 'Copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  return (
    <TooltipProvider delayDuration={250}>
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            JSON Preview
          </h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-8 w-8"
                aria-label={copied ? 'JSON copied' : 'Copy JSON'}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copied ? 'Copied' : 'Copy JSON'}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <pre className="overflow-x-auto p-4 font-mono text-xs slashed-zero">
            <code className="text-muted-foreground">{jsonString}</code>
          </pre>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
