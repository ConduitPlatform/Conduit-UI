'use client';

import { DataTable } from '@/components/database/tables/data-table';
import { useColumns } from '@/components/database/tables/columns';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/hooks/use-toast';

type ModelDataTableProps = {
  documents: {
    documents: any[];
    count: number;
  };
  model: string;
};

export default function ModelDataTable({
  documents,
  model,
}: ModelDataTableProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState<string>(searchParams.get('search') ?? '');

  const triggerQuerySearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === '') {
      params.delete('search');
      router.push(`${pathname}?${params.toString()}`);
      return;
    }
    try {
      JSON.parse(value);
    } catch (e) {
      toast({
        title: 'Database',
        description: 'Search: Invalid JSON format',
      });
      return;
    }
    params.set('search', value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col h-full col-span-full overflow-scroll">
      <div className="flex justify-between items-center gap-x-2 py-2.5 px-4">
        <CodeEditor
          placeholder="Type query: { field: 'value'}"
          padding={15}
          language="json"
          value={value}
          style={{
            background: 'transparent',
            color: 'white',
            fontSize: '16px',
          }}
          className="rounded-md bg-transparent text-white text-base border border-input px-3 py-2 w-full"
          onChange={e => setValue(e.currentTarget.value)}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => triggerQuerySearch()}
        >
          Find
        </Button>
      </div>

      <DataTable
        docs={documents.documents}
        count={documents.count}
        columns={useColumns(documents.documents, model)}
      />
    </div>
  );
}
