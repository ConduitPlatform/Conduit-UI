'use client';

import * as React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-medium text-muted-foreground">
          JSON Preview
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="h-8 w-8"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <pre className="p-4 text-xs font-mono overflow-x-auto">
          <code className="text-muted-foreground">{jsonString}</code>
        </pre>
      </ScrollArea>
    </div>
  );
}
