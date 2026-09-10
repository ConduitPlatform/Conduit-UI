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
import { FieldsTable, FormField } from './fields-table';
import { AlertCircle, Boxes } from 'lucide-react';

type NestedFieldsEditorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldName: string;
  fieldPath?: string;
  fields: FormField[];
  onSave: (fields: FormField[]) => void;
  availableModels: string[];
  depth?: number;
  maxDepth?: number;
};

function validateNestedFields(fieldsToValidate: FormField[]): string | null {
  if (fieldsToValidate.length === 0) {
    return 'Add at least one nested field.';
  }

  const names = new Set<string>();

  for (const field of fieldsToValidate) {
    const nestedName = field.name.trim();
    const fieldLabel = nestedName || 'Nested field';

    if (!nestedName) return 'Every nested field needs a name.';

    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(nestedName)) {
      return `${fieldLabel} must start with a letter or underscore and only use letters, numbers, or underscores.`;
    }

    if (names.has(nestedName)) {
      return `${fieldLabel} is duplicated. Nested field names must be unique.`;
    }
    names.add(nestedName);

    if (field.type === 'Relation' && !field.relatedModel) {
      return `${fieldLabel} is a relation and needs a related model.`;
    }

    if (field.type === 'Group') {
      return 'Groups can only be nested 1 level deep. Remove the nested Group field.';
    }
  }

  return null;
}

function NestedFieldBreadcrumb({ path }: { path: string }) {
  const segments = path.split('.').filter(Boolean);
  const current = segments[segments.length - 1] || path;
  const ancestors = segments.slice(0, -1);
  const prefix = ancestors.length > 0 ? ancestors : ['Fields'];

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {prefix.map((segment, index) => (
        <React.Fragment key={`${segment}-${index}`}>
          {index > 0 && (
            <span className="text-muted-foreground/60" aria-hidden>
              /
            </span>
          )}
          <span
            className={
              segment === 'Fields'
                ? undefined
                : 'font-mono text-xs slashed-zero'
            }
          >
            {segment}
          </span>
        </React.Fragment>
      ))}
      <span className="text-muted-foreground/60" aria-hidden>
        /
      </span>
      <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs slashed-zero">
        {current}
      </code>
    </span>
  );
}

export function NestedFieldsEditor({
  open,
  onOpenChange,
  fieldName,
  fieldPath,
  fields: initialFields,
  onSave,
  availableModels,
  depth = 1,
  maxDepth = 1,
}: NestedFieldsEditorProps) {
  const resolvedPath = fieldPath || fieldName;
  const [fields, setFields] = React.useState<FormField[]>(initialFields);
  const [validationError, setValidationError] = React.useState<string | null>(
    null
  );
  const [showDiscardConfirm, setShowDiscardConfirm] = React.useState(false);
  const [saveShortcutLabel, setSaveShortcutLabel] = React.useState('Ctrl+S');

  const initialSignature = React.useMemo(
    () => JSON.stringify(initialFields),
    [initialFields]
  );
  const currentSignature = React.useMemo(
    () => JSON.stringify(fields),
    [fields]
  );
  const hasLocalChanges = currentSignature !== initialSignature;

  React.useEffect(() => {
    if (open) {
      setValidationError(null);
      setShowDiscardConfirm(false);
      setFields(initialFields);
    }
  }, [open, initialFields]);

  React.useEffect(() => {
    const platform = navigator.platform || navigator.userAgent;
    setSaveShortcutLabel(
      /Mac|iPhone|iPad|iPod/i.test(platform) ? '⌘S' : 'Ctrl+S'
    );
  }, []);

  const requestClose = () => {
    if (hasLocalChanges) {
      setShowDiscardConfirm(true);
      return;
    }

    onOpenChange(false);
  };

  const handleSave = React.useCallback(() => {
    const error = validateNestedFields(fields);
    setValidationError(error);
    if (error) return;

    onSave(fields);
    onOpenChange(false);
  }, [fields, onOpenChange, onSave]);

  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isSaveShortcut =
        (event.metaKey || event.ctrlKey) && event.key === 's';
      if (!isSaveShortcut) return;

      event.preventDefault();
      event.stopPropagation();
      handleSave();
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [handleSave, open]);

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
        <DialogContent className="flex max-h-[80vh] w-[min(96vw,72rem)] max-w-[min(96vw,72rem)] flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-muted">
                <Boxes className="h-5 w-5 text-primary-muted-foreground" />
              </div>
              <div>
                <DialogTitle>Edit Nested Fields</DialogTitle>
                <DialogDescription>
                  <span className="sr-only">
                    Define the structure for {resolvedPath}
                  </span>
                  <span aria-hidden="true">
                    <NestedFieldBreadcrumb path={resolvedPath} />
                  </span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {validationError && (
            <div className="shrink-0 px-6 pb-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-auto px-6 pb-4">
            <FieldsTable
              fields={fields}
              onFieldsChange={nextFields => {
                setFields(nextFields);
                setValidationError(null);
              }}
              availableModels={availableModels}
              depth={depth}
              maxDepth={maxDepth}
              parentPath={resolvedPath}
              committedFieldNames={initialFields.map(field => field.name)}
              emptyTitle="No nested fields yet"
              emptyDescription={`Add fields to define the structure of ${fieldName}.`}
            />
          </div>

          <DialogFooter className="shrink-0 border-t px-6 py-4">
            <Button variant="outline" onClick={requestClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Nested Fields
              <kbd className="ml-1.5 rounded border bg-primary-foreground/20 px-1.5 py-0.5 font-mono text-[10px]">
                {saveShortcutLabel}
              </kbd>
            </Button>
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
