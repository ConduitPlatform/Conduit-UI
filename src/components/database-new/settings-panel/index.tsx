'use client';

import * as React from 'react';
import { DeclaredSchema } from '@/lib/models/database';
import { ResourceDefinition } from '@/lib/models/authorization';
import { deleteSchema, patchSchema } from '@/lib/api/database';
import { useRouter } from 'next/navigation';
import { CrudPermissions } from './crud-permissions';
import { AuthSettings } from './auth-settings';
import { IndicesConfig } from './indices-config';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Save, Trash2, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { toast } from '@/lib/hooks/use-toast';
import Link from 'next/link';

type SettingsPanelProps = {
  schema: DeclaredSchema;
  authResource?: ResourceDefinition | null;
  onSave: () => void;
};

export function SettingsPanel({
  schema,
  authResource,
  onSave,
}: SettingsPanelProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Ensure all CRUD operations have proper defaults
  const defaultCrudOperations = {
    create: { enabled: true, authenticated: false },
    read: { enabled: true, authenticated: false },
    update: { enabled: true, authenticated: false },
    delete: { enabled: true, authenticated: false },
  };
  const schemaCrud = schema.modelOptions?.conduit?.cms?.crudOperations;
  const [crudOperations, setCrudOperations] = React.useState({
    create: schemaCrud?.create ?? defaultCrudOperations.create,
    read: schemaCrud?.read ?? defaultCrudOperations.read,
    update: schemaCrud?.update ?? defaultCrudOperations.update,
    delete: schemaCrud?.delete ?? defaultCrudOperations.delete,
  });
  const [authEnabled, setAuthEnabled] = React.useState(
    schema.modelOptions?.conduit?.authorization?.enabled ?? false
  );
  const [indices, setIndices] = React.useState<any[]>(
    schema.modelOptions?.indexes || []
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await patchSchema(schema._id, {
        modelOptions: {
          ...schema.modelOptions,
          conduit: {
            ...schema.modelOptions?.conduit,
            cms: {
              enabled: true,
              crudOperations,
            },
            authorization: {
              enabled: authEnabled,
            },
          },
          indexes: indices,
        },
      });
      toast({ title: 'Settings saved' });
      onSave();
    } catch (error: any) {
      toast({
        title: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isOwnedByDatabase =
    !schema.ownerModule || schema.ownerModule === 'database';

  return (
    <ScrollArea className="h-full">
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Schema Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Schema Information</CardTitle>
            <CardDescription>
              Basic information about this schema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{schema.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collection</p>
                <p className="font-mono text-sm">{schema.collectionName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Owner Module</p>
                <Badge variant="secondary">
                  {schema.ownerModule || 'database'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fields</p>
                <p className="font-medium">
                  {
                    Object.keys(schema.compiledFields || schema.fields || {})
                      .length
                  }
                </p>
              </div>
            </div>

            {!isOwnedByDatabase && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                <Info className="w-4 h-4 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  This schema is owned by <strong>{schema.ownerModule}</strong>.
                  Some settings may be limited.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* CRUD Permissions */}
        <CrudPermissions
          crudOperations={crudOperations}
          onChange={setCrudOperations}
          disabled={!isOwnedByDatabase}
        />

        <Separator />

        {/* Authorization Settings */}
        <AuthSettings
          enabled={authEnabled}
          onChange={setAuthEnabled}
          authResource={authResource}
          schemaName={schema.name}
          disabled={!isOwnedByDatabase}
        />

        <Separator />

        {/* Indices Configuration */}
        <IndicesConfig
          indices={indices}
          onChange={setIndices}
          schemaFields={Object.keys(
            schema.compiledFields || schema.fields || {}
          )}
          disabled={!isOwnedByDatabase}
        />

        <Separator />

        {/* Extensions */}
        {schema.extensions && schema.extensions.length > 0 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Extensions</CardTitle>
                <CardDescription>
                  Schema extensions from other modules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {schema.extensions.map((ext, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-md border"
                    >
                      <div>
                        <p className="font-medium">{ext.ownerModule}</p>
                        <p className="text-sm text-muted-foreground">
                          {Object.keys(ext.fields || {}).length} fields
                        </p>
                      </div>
                      <Badge variant="outline">
                        {new Date(ext.updatedAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Separator />
          </>
        )}

        {/* Danger Zone */}
        {isOwnedByDatabase && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-lg text-destructive flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions. Proceed with caution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete Schema
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Schema?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the schema{' '}
                      <strong>{schema.name}</strong> and all its documents. This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleting}
                      onClick={async e => {
                        e.preventDefault();
                        setIsDeleting(true);
                        try {
                          await deleteSchema(schema._id, true);
                          toast({ title: 'Schema deleted' });
                          router.push('/database/models-new');
                          router.refresh();
                        } catch (error: unknown) {
                          const err = error as { message?: string };
                          toast({
                            title: err.message ?? 'Failed to delete schema',
                            variant: 'destructive',
                          });
                        } finally {
                          setIsDeleting(false);
                        }
                      }}
                    >
                      {isDeleting ? 'Deleting…' : 'Delete Schema'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={isSaving || !isOwnedByDatabase}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
