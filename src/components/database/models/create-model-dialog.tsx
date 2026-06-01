'use client';

import * as React from 'react';
import { DeclaredSchema } from '@/lib/models/database';
import { createSchema } from '@/lib/api/database';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/lib/hooks/use-toast';
import { Info, Loader2 } from 'lucide-react';

type CreateModelDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (schema?: DeclaredSchema) => void;
};

const defaultCrudOperations = {
  create: { enabled: true, authenticated: false },
  read: { enabled: true, authenticated: false },
  update: { enabled: true, authenticated: false },
  delete: { enabled: true, authenticated: false },
};

export function CreateModelDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateModelDialogProps) {
  const [name, setName] = React.useState('');
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const validateName = React.useCallback((value: string) => {
    const trimmedName = value.trim();
    if (!trimmedName) return 'Model name is required.';
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(trimmedName)) {
      return 'Start with a letter and use only letters, numbers, or underscores.';
    }
    return null;
  }, []);

  const handleClose = () => {
    if (!isSaving) {
      onOpenChange(false);
      setName('');
      setNameError(null);
    }
  };

  const handleSave = async () => {
    const validationError = validateName(name);
    setNameError(validationError);

    if (validationError === 'Model name is required.') {
      toast({ title: 'Model name is required', variant: 'destructive' });
      return;
    }

    if (validationError) {
      toast({
        title: 'Model names must start with a letter',
        description: 'Use letters, numbers, and underscores only.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await createSchema({
        name: name.trim(),
        fields: {
          name: { type: 'String' },
        },
        conduitOptions: {
          cms: {
            enabled: true,
            crudOperations: defaultCrudOperations,
          },
        },
      });
      toast({ title: 'Model created successfully' });
      handleClose();
      onSuccess(result);
    } catch (error: any) {
      toast({
        title: error.message || 'Failed to create model',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a new model</DialogTitle>
          <DialogDescription>
            Name the model now. It will open in Schema with a starter field you
            can rename, replace, or build on.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model-name">Model name</Label>
            <Input
              id="model-name"
              placeholder="Product"
              value={name}
              onChange={e => {
                setName(e.target.value);
                setNameError(validateName(e.target.value));
              }}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void handleSave();
                }
              }}
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? 'model-name-error' : undefined}
              autoFocus
            />
            {nameError && (
              <p id="model-name-error" className="text-sm text-destructive">
                {nameError}
              </p>
            )}
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              A hidden starter field keeps the platform contract valid. After
              creation, define fields in Schema and configure access in
              Settings.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create model
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
