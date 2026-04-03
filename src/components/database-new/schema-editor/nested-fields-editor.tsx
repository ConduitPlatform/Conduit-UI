'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FieldsTable, FormField } from './fields-table';
import { Boxes } from 'lucide-react';

type NestedFieldsEditorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldName: string;
  fields: FormField[];
  onSave: (fields: FormField[]) => void;
  availableModels: string[];
};

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function NestedFieldsEditor({
  open,
  onOpenChange,
  fieldName,
  fields: initialFields,
  onSave,
  availableModels,
}: NestedFieldsEditorProps) {
  const [fields, setFields] = React.useState<FormField[]>(initialFields);

  // Reset fields when dialog opens with new data
  React.useEffect(() => {
    if (open) {
      setFields(
        initialFields.length > 0
          ? initialFields
          : [
              {
                id: generateId(),
                name: 'field1',
                type: 'String',
              },
            ]
      );
    }
  }, [open, initialFields]);

  const handleSave = () => {
    onSave(fields);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
              <Boxes className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <DialogTitle>Edit Nested Fields</DialogTitle>
              <DialogDescription>
                Define the structure for{' '}
                <code className="px-1 py-0.5 bg-muted rounded">
                  {fieldName}
                </code>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="pb-4">
            <FieldsTable
              fields={fields}
              onFieldsChange={setFields}
              availableModels={availableModels}
            />
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Nested Fields</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
