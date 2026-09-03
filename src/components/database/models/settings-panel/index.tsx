'use client';

import * as React from 'react';
import { DeclaredSchema } from '@/lib/models/database';
import { ResourceDefinition } from '@/lib/models/authorization';
import {
  createSchemaIndexes,
  deleteSchema,
  deleteSchemaIndexes,
  getSchemaIndexes,
  patchSchema,
} from '@/lib/api/database';
import { useRouter } from 'next/navigation';
import { CrudPermissions } from './crud-permissions';
import { deriveCrudOperationsFromSchema } from './crud-state';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Save, Trash2, AlertTriangle, Info } from 'lucide-react';
import { toast } from '@/lib/hooks/use-toast';

/** Radix Select rejects empty string values */
const MONGO_READ_PREF_DEFAULT = '__default__';

const MONGO_READ_PREFS = [
  { value: MONGO_READ_PREF_DEFAULT, label: 'Default (module / driver)' },
  { value: 'primary', label: 'primary' },
  { value: 'primaryPreferred', label: 'primaryPreferred' },
  { value: 'secondary', label: 'secondary' },
  { value: 'secondaryPreferred', label: 'secondaryPreferred' },
  { value: 'nearest', label: 'nearest' },
] as const;

type SettingsPanelProps = {
  schema: DeclaredSchema;
  authResource?: ResourceDefinition | null;
  onSave: () => void;
  databaseType?: string;
  onDirtyChange?: (dirty: boolean) => void;
};

type SchemaIndex = {
  fields: string[];
  options?: {
    name?: string;
    unique?: boolean;
    sparse?: boolean;
    background?: boolean;
    [key: string]: unknown;
  };
  types?: string[] | string;
};

function getIndexName(index: SchemaIndex) {
  return typeof index.options?.name === 'string' ? index.options.name : null;
}

function stripRuntimeIndexOptions(index: SchemaIndex) {
  const { name, ...options } = index.options ?? {};
  return {
    fields: index.fields,
    types: index.types,
    ...(Object.keys(options).length > 0 ? { options } : {}),
  };
}

function getIndexSignature(index: SchemaIndex) {
  return JSON.stringify(stripRuntimeIndexOptions(index));
}

function isPrimaryIndex(index: SchemaIndex) {
  return index.fields.length === 1 && index.fields[0] === '_id';
}

function getSchemaReadPreference(schema: DeclaredSchema) {
  const rp = schema.modelOptions?.conduit?.readPreference;
  return rp !== undefined && rp !== null && String(rp).length > 0
    ? String(rp)
    : MONGO_READ_PREF_DEFAULT;
}

export function SettingsPanel({
  schema,
  authResource,
  onSave,
  databaseType,
  onDirtyChange,
}: SettingsPanelProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [crudOperations, setCrudOperations] = React.useState(() =>
    deriveCrudOperationsFromSchema(schema)
  );
  const [initialCrudOperations, setInitialCrudOperations] = React.useState(() =>
    deriveCrudOperationsFromSchema(schema)
  );
  const [authEnabled, setAuthEnabled] = React.useState(
    schema.modelOptions?.conduit?.authorization?.enabled ?? false
  );
  const [initialAuthEnabled, setInitialAuthEnabled] = React.useState(
    schema.modelOptions?.conduit?.authorization?.enabled ?? false
  );
  const [indices, setIndices] = React.useState<SchemaIndex[]>([]);
  const [initialIndices, setInitialIndices] = React.useState<SchemaIndex[]>([]);
  const [isLoadingIndices, setIsLoadingIndices] = React.useState(false);
  const [saveShortcutLabel, setSaveShortcutLabel] = React.useState('Ctrl+S');
  const [mongoReadPreference, setMongoReadPreference] = React.useState(() =>
    getSchemaReadPreference(schema)
  );
  const [initialReadPreference, setInitialReadPreference] = React.useState(() =>
    getSchemaReadPreference(schema)
  );

  const isOwnedByDatabase =
    !schema.ownerModule || schema.ownerModule === 'database';

  React.useEffect(() => {
    const nextCrudOperations = deriveCrudOperationsFromSchema(schema);
    const nextAuthEnabled =
      schema.modelOptions?.conduit?.authorization?.enabled ?? false;
    const nextReadPreference = getSchemaReadPreference(schema);

    setCrudOperations(nextCrudOperations);
    setInitialCrudOperations(nextCrudOperations);
    setAuthEnabled(nextAuthEnabled);
    setInitialAuthEnabled(nextAuthEnabled);
    setMongoReadPreference(nextReadPreference);
    setInitialReadPreference(nextReadPreference);
  }, [schema]);

  const loadIndexes = React.useCallback(async () => {
    setIsLoadingIndices(true);
    try {
      const result = await getSchemaIndexes(schema._id);
      const customIndexes = (result.indexes as SchemaIndex[]).filter(
        index => !isPrimaryIndex(index)
      );
      setIndices(customIndexes);
      setInitialIndices(customIndexes);
    } catch (error: any) {
      toast({
        title: error.message || 'Failed to load indexes',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingIndices(false);
    }
  }, [schema._id]);

  React.useEffect(() => {
    if (isOwnedByDatabase) {
      void loadIndexes();
      return;
    }

    setIndices([]);
    setInitialIndices([]);
  }, [isOwnedByDatabase, loadIndexes]);

  React.useEffect(() => {
    const platform = navigator.platform || navigator.userAgent;
    setSaveShortcutLabel(
      /Mac|iPhone|iPad|iPod/i.test(platform) ? '⌘S' : 'Ctrl+S'
    );
  }, []);

  const hasSettingsChanges =
    JSON.stringify(crudOperations) !== JSON.stringify(initialCrudOperations) ||
    authEnabled !== initialAuthEnabled ||
    mongoReadPreference !== initialReadPreference ||
    JSON.stringify(indices.map(getIndexSignature)) !==
      JSON.stringify(initialIndices.map(getIndexSignature));

  React.useEffect(() => {
    onDirtyChange?.(hasSettingsChanges);
  }, [hasSettingsChanges, onDirtyChange]);

  const syncIndexes = React.useCallback(async () => {
    const initialSignatures = new Set(initialIndices.map(getIndexSignature));
    const currentSignatures = new Set(indices.map(getIndexSignature));
    const indexesToCreate = indices.filter(
      index => !initialSignatures.has(getIndexSignature(index))
    );
    const indexNamesToDelete = initialIndices
      .filter(index => !currentSignatures.has(getIndexSignature(index)))
      .map(getIndexName)
      .filter((name): name is string => Boolean(name));

    if (indexNamesToDelete.length > 0) {
      await deleteSchemaIndexes(schema._id, indexNamesToDelete);
    }

    if (indexesToCreate.length > 0) {
      await createSchemaIndexes(
        schema._id,
        indexesToCreate.map(stripRuntimeIndexOptions)
      );
    }
  }, [indices, initialIndices, schema._id]);

  const handleSave = React.useCallback(async () => {
    setIsSaving(true);
    try {
      await patchSchema(schema._id, {
        conduitOptions: {
          cms: {
            enabled: true,
            crudOperations,
          },
          authorization: {
            enabled: authEnabled,
          },
          ...(databaseType === 'MongoDB'
            ? {
                readPreference:
                  mongoReadPreference !== MONGO_READ_PREF_DEFAULT
                    ? mongoReadPreference
                    : '',
              }
            : {}),
        },
      });
      await syncIndexes();
      await loadIndexes();
      setInitialCrudOperations(crudOperations);
      setInitialAuthEnabled(authEnabled);
      setInitialReadPreference(mongoReadPreference);
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
  }, [
    authEnabled,
    crudOperations,
    databaseType,
    loadIndexes,
    mongoReadPreference,
    onSave,
    schema._id,
    syncIndexes,
  ]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isSaveShortcut =
        (event.metaKey || event.ctrlKey) && event.key === 's';
      if (!isSaveShortcut) return;

      event.preventDefault();
      if (!isSaving && isOwnedByDatabase && hasSettingsChanges) {
        void handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, isSaving, isOwnedByDatabase, hasSettingsChanges]);

  return (
    <ScrollArea className="h-full">
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-balance">Settings</h2>
            <p className="text-sm text-muted-foreground">
              Manage access, database behavior, and model-level operations in
              one save.
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving || !isOwnedByDatabase || !hasSettingsChanges}
            className="gap-2 shrink-0"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
            {!isSaving && hasSettingsChanges && (
              <kbd className="ml-1 rounded border bg-primary-foreground/20 px-1.5 py-0.5 font-mono text-[10px]">
                {saveShortcutLabel}
              </kbd>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">General</CardTitle>
            <CardDescription>
              Basic information about this schema.
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
              <div className="flex items-start gap-2 rounded-md border border-callout-warning bg-callout-warning-muted p-3">
                <Info className="mt-0.5 h-4 w-4 text-callout-warning-foreground" />
                <div className="text-sm text-callout-warning-foreground">
                  This schema is owned by <strong>{schema.ownerModule}</strong>.
                  Some settings may be limited.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-balance">Access</h3>
            <p className="text-sm text-muted-foreground">
              Control generated CRUD endpoints and optional authorization.
            </p>
          </div>

          <CrudPermissions
            crudOperations={crudOperations}
            onChange={setCrudOperations}
            disabled={!isOwnedByDatabase}
          />

          <AuthSettings
            enabled={authEnabled}
            onChange={setAuthEnabled}
            authResource={authResource}
            schemaName={schema.name}
            disabled={!isOwnedByDatabase}
          />

          {!initialAuthEnabled && authEnabled && (
            <Alert className="border-callout-warning bg-callout-warning-muted text-callout-warning-foreground">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Enabling authorization will clear existing documents for this
                model before the authorization resource is created.
              </AlertDescription>
            </Alert>
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-balance">Database</h3>
            <p className="text-sm text-muted-foreground">
              Tune storage-level behavior and custom indexes.
            </p>
          </div>

          {databaseType === 'MongoDB' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  MongoDB read preference
                </CardTitle>
                <CardDescription>
                  Optional override for this schema&apos;s reads. Per-request
                  overrides and Database module defaults still apply when this
                  is left as default.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label htmlFor="schema-read-preference">Read preference</Label>
                <Select
                  value={mongoReadPreference}
                  onValueChange={setMongoReadPreference}
                  disabled={!isOwnedByDatabase}
                >
                  <SelectTrigger
                    id="schema-read-preference"
                    className="max-w-md"
                  >
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONGO_READ_PREFS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Use <strong>secondaryPreferred</strong> for analytics-style
                  collections; keep security-sensitive data on default or{' '}
                  <strong>primary</strong>.
                </p>
              </CardContent>
            </Card>
          )}

          <IndicesConfig
            indices={indices}
            onChange={setIndices}
            schemaFields={Object.keys(
              schema.compiledFields || schema.fields || {}
            )}
            disabled={!isOwnedByDatabase || isLoadingIndices}
            isLoading={isLoadingIndices}
          />
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-destructive text-balance">
              Danger
            </h3>
            <p className="text-sm text-muted-foreground">
              Irreversible actions for this model.
            </p>
          </div>

          {isOwnedByDatabase && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-lg text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Delete schema
                </CardTitle>
                <CardDescription>
                  Permanently remove the schema and all documents.
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
                        <strong>{schema.name}</strong> and all its documents.
                        This action cannot be undone.
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
                            router.push('/database/models');
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
        </section>
      </div>
    </ScrollArea>
  );
}
