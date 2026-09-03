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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FieldsTable, FormField } from './fields-table';
import { AlertCircle, Boxes } from 'lucide-react';

type NestedFieldsEditorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldName: string;
  fields: FormField[];
  onSave: (fields: FormField[]) => void;
  availableModels: string[];
  depth?: number;
  maxDepth?: number;
};

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function validateNestedFields(fieldsToValidate: FormField[]): string | null {
  const names = new Set<string>();

  for (const field of fieldsToValidate) {
    const fieldName = field.name.trim();
    const fieldLabel = fieldName || 'Nested field';

    if (!fieldName) return 'Every nested field needs a name.';

    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(fieldName)) {
      return `${fieldLabel} must start with a letter or underscore and only use letters, numbers, or underscores.`;
    }

    if (names.has(fieldName)) {
      return `${fieldLabel} is duplicated. Nested field names must be unique.`;
    }
    names.add(fieldName);

    if (field.type === 'Relation' && !field.relatedModel) {
      return `${fieldLabel} is a relation and needs a related model.`;
    }

    if (field.type === 'Group') {
      return 'Groups can only be nested 1 level deep. Remove the nested Group field.';
    }
  }

  return null;
}

export function NestedFieldsEditor({
  open,
  onOpenChange,
  fieldName,
  fields: initialFields,
  onSave,
  availableModels,
  depth = 1,
  maxDepth = 1,
}: NestedFieldsEditorProps) {
  const [fields, setFields] = React.useState<FormField[]>(initialFields);
  const [validationError, setValidationError] = React.useState<string | null>(
    null
  );
  const [showDiscardConfirm, setShowDiscardConfirm] = React.useState(false);

  const initialSignature = React.useMemo(
    () => JSON.stringify(initialFields),
    [initialFields]
  );
  const currentSignature = React.useMemo(
    () => JSON.stringify(fields),
    [fields]
  );
  const hasLocalChanges = currentSignature !== initialSignature;

  // Reset fields when dialog opens with new data
  React.useEffect(() => {
    if (open) {
      setValidationError(null);
      setShowDiscardConfirm(false);
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

  const requestClose = () => {
    if (hasLocalChanges) {
      setShowDiscardConfirm(true);
      return;
    }

    onOpenChange(false);
  };

  const handleSave = () => {
    const error = validateNestedFields(fields);
    setValidationError(error);
    if (error) return;

    onSave(fields);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={nextOpen => {
          if (nextOpen) {
            onOpenChange(true);
            return;
          }
          requestClose();
        }}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-muted">
                <Boxes className="h-5 w-5 text-primary-muted-foreground" />
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

          {validationError && (
            <div className="px-6 pb-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            </div>
          )}

          <ScrollArea className="flex-1 px-6">
            <div className="pb-4">
              <FieldsTable
                fields={fields}
                onFieldsChange={nextFields => {
                  setFields(nextFields);
                  setValidationError(null);
                }}
                availableModels={availableModels}
                depth={depth}
                maxDepth={maxDepth}
              />
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={requestClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Nested Fields</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showDiscardConfirm}
        onOpenChange={setShowDiscardConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard nested field changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved nested field changes for {fieldName}. Closing
              this dialog will discard them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDiscardConfirm(false);
                setValidationError(null);
                onOpenChange(false);
              }}
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
