'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { DocumentEditor } from './document-editor';
import { DeclaredSchema } from '@/lib/models/database';

interface DocumentEditorButtonProps {
  document: any;
  schema: DeclaredSchema;
}

export function DocumentEditorButton({
  document,
  schema,
}: DocumentEditorButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="whitespace-nowrap"
      >
        <Edit className="h-4 w-4 mr-1" />
        Edit
      </Button>
      <DocumentEditor
        document={document}
        schema={schema}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
