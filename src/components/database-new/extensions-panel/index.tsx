'use client';

import * as React from 'react';
import { DeclaredSchema } from '@/lib/models/database';
import { updateExtensions } from '@/lib/api/database';
import {
  FieldsTable,
  FormField,
  transformFieldsForApi,
} from '@/components/database-new/schema-editor/fields-table';
import { extractFieldsFromSchema } from '@/components/database-new/schema-editor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Info, Loader2, Puzzle, Save } from 'lucide-react';
import { toast } from '@/lib/hooks/use-toast';
import { cn } from '@/lib/utils';

type ExtensionsPanelProps = {
  schema: DeclaredSchema;
  availableModels: string[];
  onSave?: () => void;
};

function mergeDatabaseExtensionFields(
  schema: DeclaredSchema
): Record<string, unknown> {
  const blocks =
    schema.extensions?.filter(ext => ext.ownerModule === 'database') ?? [];
  const merged: Record<string, unknown> = {};
  for (const block of blocks) {
    const f = block.fields;
    if (f && typeof f === 'object' && !Array.isArray(f)) {
      Object.assign(merged, f);
    }
  }
  return merged;
}

export function ExtensionsPanel({
  schema,
  availableModels,
  onSave,
}: ExtensionsPanelProps) {
  const otherModuleExtensions = React.useMemo(
    () =>
      schema.extensions?.filter(ext => ext.ownerModule !== 'database') ?? [],
    [schema.extensions]
  );

  const [fields, setFields] = React.useState<FormField[]>(() =>
    extractFieldsFromSchema(mergeDatabaseExtensionFields(schema))
  );
  const [hasChanges, setHasChanges] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setFields(extractFieldsFromSchema(mergeDatabaseExtensionFields(schema)));
    setHasChanges(false);
  }, [schema._id, schema.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps -- reset on server refresh, not unstable `schema` identity

  const handleFieldsChange = (next: FormField[]) => {
    setFields(next);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (fields.length > 0) {
      const invalid = fields.filter(f => !f.name.trim());
      if (invalid.length > 0) {
        toast({
          title: 'All extension fields must have a name',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload = transformFieldsForApi(fields);
      await updateExtensions(schema._id, payload);
      toast({ title: 'Extension fields saved' });
      setHasChanges(false);
      onSave?.();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: err.message ?? 'Failed to save extension fields',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasAnyExtensions =
    (schema.extensions?.length ?? 0) > 0 || fields.length > 0;

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-balance">Extensions</h2>
            <p className="text-sm text-muted-foreground">
              Fields added by other modules appear read-only. Fields owned by
              the database module can be edited here.
            </p>
          </div>
          <Button
            size="sm"
            className="gap-2 shrink-0 mt-2 sm:mt-0"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Saving…' : 'Save extensions'}
          </Button>
        </div>

        {!hasAnyExtensions && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              No schema extensions yet. Other modules can attach fields to this
              model; those will appear here as read-only. You can also add
              fields owned by the <strong>database</strong> module below.
            </AlertDescription>
          </Alert>
        )}

        {otherModuleExtensions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Puzzle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Other modules</span>
            </div>
            {otherModuleExtensions.map((ext, idx) => {
              const rows = extractFieldsFromSchema(ext.fields ?? {});
              return (
                <Card key={`${ext.ownerModule}-${idx}`}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">
                        {ext.ownerModule}
                      </CardTitle>
                      <Badge variant="outline" className="font-normal">
                        view only
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto tabular-nums">
                        Updated {new Date(ext.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    <CardDescription>
                      {rows.length} field{rows.length === 1 ? '' : 's'} defined
                      by this module
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {rows.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No fields in this extension block.
                      </p>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead className="w-[100px]">
                                Required
                              </TableHead>
                              <TableHead className="w-[100px]">
                                Unique
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {rows.map(row => (
                              <TableRow key={row.id}>
                                <TableCell className="font-mono text-sm">
                                  {row.name}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="secondary"
                                    className="font-normal"
                                  >
                                    {row.type}
                                    {row.isArray ? '[]' : ''}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {row.required ? (
                                    <span className="text-sm">Yes</span>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">
                                      —
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {row.unique ? (
                                    <span className="text-sm">Yes</span>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">
                                      —
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Database module extensions
            </CardTitle>
            <CardDescription>
              Editable fields registered under the database module for this
              schema. Saving updates extension data via the platform API.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldsTable
              fields={fields}
              onFieldsChange={handleFieldsChange}
              availableModels={availableModels}
              disabled={false}
            />
            <p
              className={cn(
                'text-xs text-muted-foreground',
                !hasChanges && 'opacity-70'
              )}
            >
              {hasChanges
                ? 'You have unsaved changes to database extension fields.'
                : 'Changes are saved with the button above.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
