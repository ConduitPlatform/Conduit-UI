'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Lock } from 'lucide-react';
import { DocumentEditor } from './document-editor';
import { DeclaredSchema } from '@/lib/models/database';

interface DocumentEditorButtonProps {
  document: any;
  schema: DeclaredSchema;
}

// Utility function to check if editing is allowed (simplified version)
const canEditDocument = (schema: DeclaredSchema): boolean => {
  const permissions = schema.modelOptions?.conduit?.permissions;
  const isDatabaseModule = schema.ownerModule === 'database';

  // If database module owns the schema, full permissions
  if (isDatabaseModule) {
    return true;
  }

  if (!permissions) {
    return false;
  }

  const canModify = permissions.canModify || 'Nothing';
  return canModify !== 'Nothing';
};

export function DocumentEditorButton({
  document,
  schema,
}: DocumentEditorButtonProps) {
  const [open, setOpen] = useState(false);

  // Check permissions
  const canEdit = useMemo(() => canEditDocument(schema), [schema]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="whitespace-nowrap"
        disabled={!canEdit}
        title={
          !canEdit
            ? `Cannot edit: Schema owned by ${schema.ownerModule} module`
            : 'Edit document'
        }
      >
        {!canEdit ? (
          <Lock className="h-4 w-4 mr-1" />
        ) : (
          <Edit className="h-4 w-4 mr-1" />
        )}
        {!canEdit ? 'Locked' : 'Edit'}
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
