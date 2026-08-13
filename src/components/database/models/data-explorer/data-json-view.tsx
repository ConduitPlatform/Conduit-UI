'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import {
  JsonView,
  allExpanded,
  darkStyles,
  defaultStyles,
} from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { toast } from '@/lib/hooks/use-toast';
import { DataExplorerPagination } from './data-explorer-pagination';
import { filterDocumentsByQuickSearch } from './data-explorer.utils';

type ExpandMode = 'nested' | 'all';

type DataJsonViewProps = {
  documents: any[];
  quickSearch: string;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

const customLightStyles = {
  ...defaultStyles,
  container: 'font-mono text-sm',
  label: 'text-primary',
  nullValue: 'text-json-null',
  stringValue: 'text-json-string wrap-break-word',
  booleanValue: 'text-json-boolean',
  numberValue: 'text-json-number font-medium',
};

const customDarkStyles = {
  ...darkStyles,
  container: 'font-mono text-sm',
  label: 'text-primary',
  nullValue: 'text-json-null',
  stringValue: 'text-json-string wrap-break-word',
  booleanValue: 'text-json-boolean',
  numberValue: 'text-json-number font-medium',
};

function expandDocumentsOnly(level: number): boolean {
  return level < 2;
}

export function DataJsonView({
  documents,
  quickSearch,
  currentPage,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: DataJsonViewProps) {
  const { theme } = useTheme();
  const [expandMode, setExpandMode] = React.useState<ExpandMode>('nested');
  const [copied, setCopied] = React.useState(false);

  const filteredDocuments = React.useMemo(
    () => filterDocumentsByQuickSearch(documents, quickSearch),
    [documents, quickSearch]
  );

  const styles = theme === 'dark' ? customDarkStyles : customLightStyles;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(filteredDocuments, null, 2)
      );
      setCopied(true);
      toast({ title: 'JSON copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-end gap-2 px-4 py-2 border-b bg-muted/20">
        <Button
          variant={expandMode === 'nested' ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setExpandMode('nested')}
        >
          Collapse nested
        </Button>
        <Button
          variant={expandMode === 'all' ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setExpandMode('all')}
        >
          Expand all
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={filteredDocuments.length === 0}
          className="gap-1.5"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          Copy JSON
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {filteredDocuments.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            {quickSearch
              ? 'No documents match your search'
              : 'No documents found'}
          </div>
        ) : (
          <JsonView
            data={filteredDocuments}
            shouldExpandNode={
              expandMode === 'all' ? allExpanded : expandDocumentsOnly
            }
            style={styles}
          />
        )}
      </div>

      <DataExplorerPagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalCount={totalCount}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
