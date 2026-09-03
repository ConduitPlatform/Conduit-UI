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
  container: `${defaultStyles.container} semantic-json-view font-mono text-sm`,
  label: `${defaultStyles.label} semantic-json-view__property`,
  clickableLabel: `${defaultStyles.clickableLabel} semantic-json-view__property`,
  nullValue: `${defaultStyles.nullValue} semantic-json-view__null`,
  undefinedValue: `${defaultStyles.undefinedValue} semantic-json-view__null`,
  stringValue: `${defaultStyles.stringValue} semantic-json-view__string wrap-break-word`,
  booleanValue: `${defaultStyles.booleanValue} semantic-json-view__boolean`,
  numberValue: `${defaultStyles.numberValue} semantic-json-view__number font-medium`,
  otherValue: `${defaultStyles.otherValue} semantic-json-view__value`,
  punctuation: `${defaultStyles.punctuation} semantic-json-view__punctuation`,
  expandIcon: `${defaultStyles.expandIcon} semantic-json-view__control`,
  collapseIcon: `${defaultStyles.collapseIcon} semantic-json-view__control`,
  collapsedContent: `${defaultStyles.collapsedContent} semantic-json-view__collapsed`,
};

const customDarkStyles = {
  ...darkStyles,
  container: `${darkStyles.container} semantic-json-view font-mono text-sm`,
  label: `${darkStyles.label} semantic-json-view__property`,
  clickableLabel: `${darkStyles.clickableLabel} semantic-json-view__property`,
  nullValue: `${darkStyles.nullValue} semantic-json-view__null`,
  undefinedValue: `${darkStyles.undefinedValue} semantic-json-view__null`,
  stringValue: `${darkStyles.stringValue} semantic-json-view__string wrap-break-word`,
  booleanValue: `${darkStyles.booleanValue} semantic-json-view__boolean`,
  numberValue: `${darkStyles.numberValue} semantic-json-view__number font-medium`,
  otherValue: `${darkStyles.otherValue} semantic-json-view__value`,
  punctuation: `${darkStyles.punctuation} semantic-json-view__punctuation`,
  expandIcon: `${darkStyles.expandIcon} semantic-json-view__control`,
  collapseIcon: `${darkStyles.collapseIcon} semantic-json-view__control`,
  collapsedContent: `${darkStyles.collapsedContent} semantic-json-view__collapsed`,
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
  const { resolvedTheme } = useTheme();
  const [expandMode, setExpandMode] = React.useState<ExpandMode>('nested');
  const [copied, setCopied] = React.useState(false);

  const filteredDocuments = React.useMemo(
    () => filterDocumentsByQuickSearch(documents, quickSearch),
    [documents, quickSearch]
  );

  const styles =
    resolvedTheme === 'dark' ? customDarkStyles : customLightStyles;

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
      <div className="flex items-center justify-end gap-2 border-b bg-surface-2 px-4 py-2">
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
