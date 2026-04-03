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
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  FieldsTable,
  FormField,
  transformFieldsForApi,
} from './schema-editor/fields-table';
import { toast } from '@/lib/hooks/use-toast';
import { Loader2 } from 'lucide-react';

type CreateModelDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableModels: string[];
  onSuccess: (schema?: DeclaredSchema) => void;
};

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function CreateModelDialog({
  open,
  onOpenChange,
  availableModels,
  onSuccess,
}: CreateModelDialogProps) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [fields, setFields] = React.useState<FormField[]>([
    {
      id: generateId(),
      name: 'id',
      type: 'ObjectId',
      required: true,
      unique: true,
    },
    {
      id: generateId(),
      name: 'createdAt',
      type: 'Date',
      default: 'now()',
    },
  ]);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleClose = () => {
    if (!isSaving) {
      onOpenChange(false);
      // Reset form
      setName('');
      setDescription('');
      setFields([
        {
          id: generateId(),
          name: 'id',
          type: 'ObjectId',
          required: true,
          unique: true,
        },
        {
          id: generateId(),
          name: 'createdAt',
          type: 'Date',
          default: 'now()',
        },
      ]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: 'Model name is required', variant: 'destructive' });
      return;
    }

    if (fields.length === 0) {
      toast({
        title: 'At least one field is required',
        variant: 'destructive',
      });
      return;
    }

    const invalidFields = fields.filter(f => !f.name.trim());
    if (invalidFields.length > 0) {
      toast({ title: 'All fields must have a name', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const fieldsObject = transformFieldsForApi(fields);
      const result = await createSchema({
        name: name.trim(),
        fields: fieldsObject,
        modelOptions: {
          conduit: {
            cms: {
              enabled: true,
              crudOperations: {
                create: { enabled: true, authenticated: false },
                read: { enabled: true, authenticated: false },
                update: { enabled: true, authenticated: false },
                delete: { enabled: true, authenticated: false },
              },
            },
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
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Create a new model</DialogTitle>
          <DialogDescription>
            Define the schema for your new database model
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 pb-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="model-name">Name</Label>
              <Input
                id="model-name"
                placeholder="Enter model name..."
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="model-description">
                Description{' '}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="model-description"
                placeholder="Describe what this model is for..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <Separator />

            {/* Columns/Fields */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Columns</Label>
              </div>
              <FieldsTable
                fields={fields}
                onFieldsChange={setFields}
                availableModels={availableModels}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
