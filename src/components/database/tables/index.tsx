'use client';

import { DataTable } from '@/components/database/tables/data-table';
import { useColumns } from '@/components/database/tables/columns';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/hooks/use-toast';
import { PlusIcon } from 'lucide-react';
import { DeclaredSchema } from '@/lib/models/database';

type ModelDataTableProps = {
  documents: {
    documents: any[];
    count: number;
  };
  schema: DeclaredSchema;
};

export default function ModelDataTable({
  documents: initialData,
  schema,
}: Readonly<ModelDataTableProps>) {
  const documents = useMemo(
    () => initialData.documents,
    [initialData.documents]
  );
  const count = useMemo(() => initialData.count, [initialData.count]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState<string>(searchParams.get('search') ?? '');
  const cols = useColumns(documents, schema);

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

  if (!count) {
    if (
      schema.ownerModule !== 'database' &&
      schema.modelOptions?.conduit?.permissions?.canCreate === false
    ) {
      return (
        <div className="h-full flex flex-col items-center justify-center space-y-4">
          <span className="text-gray-400 text-sm w-72">
            Nothing here, maybe try creating a new document for model{' '}
            {schema.name}.
          </span>
        </div>
      );
    }
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Button
          type="button"
          onClick={() => {
            router.push(`/database/models-new/${schema._id}?tab=data`);
            toast({
              title: 'Data explorer',
              description:
                'Use “New Document” on the Data tab to create a row.',
            });
          }}
        >
          <PlusIcon className="w-4 h-4" />
          <span>New document</span>
        </Button>
        <span className="text-gray-400 text-sm w-72">
          No documents were found. Create your first document for model{' '}
          {schema.name}.
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center gap-x-2 py-2.5 px-4 shrink-0">
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
      <div className="flex-1 overflow-hidden">
        <DataTable
          docs={documents}
          count={count}
          columns={cols}
          schema={schema}
        />
      </div>
    </div>
  );
}
