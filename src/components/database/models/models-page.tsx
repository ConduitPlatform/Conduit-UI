'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DeclaredSchema } from '@/lib/models/database';
import { ResourceDefinition } from '@/lib/models/authorization';
import { deleteSchema, exportSchemas, importSchemas } from '@/lib/api/database';
import { ModelsListTable } from './models-list-table';
import { CreateModelDialog } from './create-model-dialog';
import { ModelSwitcher } from './model-switcher';
import { SchemaEditor } from './schema-editor';
import { DataExplorer } from './data-explorer';
import { SettingsPanel } from './settings-panel';
import { ExtensionsPanel } from './extensions-panel';
import ModuleResourcePage from '@/components/authorization/resources/moduleResourcePage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from '@/components/ui/alert-dialog';
import { Database, Table2, Settings, ArrowLeft, Puzzle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExportImportDialog from '@/components/ui/export-import-dialog';
import { toast } from '@/lib/hooks/use-toast';
import {
  buildModelDetailHref,
  buildModelDetailTabHref,
  buildModelsListHref,
} from '@/lib/database/models-navigation';

export type ModelsTab =
  | 'schema'
  | 'data'
  | 'extensions'
  | 'settings'
  | 'policies';
type DirtyPanel = 'schema' | 'extensions' | 'settings';
type PendingNavigation = () => void;

const cleanDirtyPanels: Record<DirtyPanel, boolean> = {
  schema: false,
  extensions: false,
  settings: false,
};

function normalizeTab(tab: string | undefined): ModelsTab {
  if (
    tab === 'schema' ||
    tab === 'data' ||
    tab === 'extensions' ||
    tab === 'settings' ||
    tab === 'policies'
  ) {
    return tab;
  }
  return 'schema';
}

type ModelsPageProps = {
  schemas: DeclaredSchema[];
  modules: string[];
  selectedModelId: string | null;
  selectedSchema?: DeclaredSchema;
  documents?: {
    documents: any[];
    count: number;
  };
  authResource?: ResourceDefinition | null;
  initialTab?: ModelsTab;
  /** From GET /database/database-type; controls Mongo-only schema settings */
  databaseType?: string;
  /** Total number of schemas matching current filters (server-side). List view only. */
  count?: number;
  /** Current 1-based page index for the list view. */
  page?: number;
  /** Page size used by the server fetch for the list view. */
  pageSize?: number;
  /** Initial search query parsed from the URL for the list view. */
  initialSearch?: string;
  /** Initial owner filter parsed from the URL for the list view. */
  initialOwners?: string[];
  /** True immediately after quick-create redirects into the editor. */
  created?: boolean;
  /** Encoded list filters from the models list (owner, page, search). */
  listQuery?: string;
};

export function ModelsPage({
  schemas,
  modules,
  selectedModelId,
  selectedSchema,
  documents,
  authResource,
  initialTab = 'schema',
  databaseType,
  count,
  page,
  pageSize,
  initialSearch,
  initialOwners,
  created = false,
  listQuery,
}: ModelsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = React.useState(() =>
    normalizeTab(initialTab)
  );
  const [isCreatingNew, setIsCreatingNew] = React.useState(false);
  const [isSchemaTransferOpen, setIsSchemaTransferOpen] = React.useState(false);
  const [dirtyPanels, setDirtyPanels] =
    React.useState<Record<DirtyPanel, boolean>>(cleanDirtyPanels);
  const [pendingNavigation, setPendingNavigation] =
    React.useState<PendingNavigation | null>(null);

  const hasDirtyChanges = Object.values(dirtyPanels).some(Boolean);
  const dirtyPanelNames = React.useMemo(
    () =>
      (Object.entries(dirtyPanels) as [DirtyPanel, boolean][])
        .filter(([, dirty]) => dirty)
        .map(([panel]) => panel),
    [dirtyPanels]
  );

  const clearDirtyPanels = React.useCallback(() => {
    setDirtyPanels(cleanDirtyPanels);
  }, []);

  const reportPanelDirty = React.useCallback(
    (panel: DirtyPanel, dirty: boolean) => {
      setDirtyPanels(prev =>
        prev[panel] === dirty ? prev : { ...prev, [panel]: dirty }
      );
    },
    []
  );

  const requestNavigation = React.useCallback(
    (navigate: PendingNavigation) => {
      if (hasDirtyChanges) {
        setPendingNavigation(() => navigate);
        return;
      }

      navigate();
    },
    [hasDirtyChanges]
  );

  React.useEffect(() => {
    setActiveTab(normalizeTab(initialTab));
  }, [initialTab]);

  React.useEffect(() => {
    clearDirtyPanels();
  }, [clearDirtyPanels, selectedModelId]);

  React.useEffect(() => {
    if (!hasDirtyChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasDirtyChanges]);

  const handleModelSelect = (modelId: string, fromListQuery?: string) => {
    const query = fromListQuery ?? listQuery;
    requestNavigation(() => {
      router.push(buildModelDetailHref(modelId, query));
    });
  };

  const handleTabChange = (tab: string) => {
    const nextTab = normalizeTab(tab);
    if (nextTab === activeTab) return;

    requestNavigation(() => {
      setActiveTab(nextTab);
      if (selectedModelId) {
        router.push(
          buildModelDetailTabHref(selectedModelId, nextTab, searchParams),
          { scroll: false }
        );
      }
    });
  };

  const handleCreateNew = () => {
    setIsCreatingNew(true);
  };

  const handleExportSchemas = async () => {
    try {
      const exported = await exportSchemas();
      const href = URL.createObjectURL(
        new Blob([JSON.stringify(exported, null, 2)], {
          type: 'application/json',
        })
      );
      const link = document.createElement('a');
      link.download = 'conduit-schemas.json';
      link.href = href;
      link.click();
      URL.revokeObjectURL(href);
      toast({
        title: 'Export successful',
        description: 'Database schemas have been exported.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Export failed',
        description: 'Failed to export database schemas.',
        variant: 'destructive',
      });
    }
  };

  const handleImportSchemas = async (payload: unknown) => {
    try {
      await importSchemas(payload);
      setIsSchemaTransferOpen(false);
      toast({
        title: 'Import successful',
        description: 'Database schemas have been imported.',
      });
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Import failed',
        description: 'Failed to import database schemas.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSchema = async (modelId: string) => {
    if (
      !window.confirm(
        'Delete this model schema? Existing collection data will be preserved.'
      )
    ) {
      return;
    }

    try {
      await deleteSchema(modelId, false);
      toast({ title: 'Model deleted' });
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Delete failed',
        description: 'Failed to delete model schema.',
        variant: 'destructive',
      });
    }
  };

  const handleSchemaCreated = (schema?: DeclaredSchema) => {
    setIsCreatingNew(false);
    if (schema) {
      router.push(`/database/models/${schema._id}?created=1`);
      return;
    }
    router.refresh();
  };

  const handlePanelSaved = (panel: DirtyPanel) => {
    reportPanelDirty(panel, false);
    router.refresh();
  };

  const handleBackToList = () => {
    requestNavigation(() => {
      router.push(buildModelsListHref(listQuery));
    });
  };

  const handleCancelPendingNavigation = () => {
    setPendingNavigation(null);
  };

  const handleDiscardPendingNavigation = () => {
    const navigate = pendingNavigation;
    setPendingNavigation(null);
    clearDirtyPanels();
    navigate?.();
  };

  const showPolicies =
    selectedSchema?.modelOptions?.conduit?.authorization?.enabled === true &&
    authResource !== null &&
    authResource !== undefined;
  const selectedFieldCount = selectedSchema
    ? Object.keys(selectedSchema.compiledFields || selectedSchema.fields || {})
        .length
    : 0;

  // Models list view - no model selected
  if (!selectedModelId) {
    return (
      <div className="flex flex-col h-full w-full">
        <ModelsListTable
          schemas={schemas}
          modules={modules}
          count={count ?? schemas.length}
          page={page ?? 1}
          pageSize={pageSize ?? (schemas.length || 1)}
          initialSearch={initialSearch ?? ''}
          initialOwners={initialOwners ?? []}
          onCreateNew={handleCreateNew}
          onSelect={handleModelSelect}
          onOpenSchemaTransfer={() => setIsSchemaTransferOpen(true)}
          onDelete={handleDeleteSchema}
        />
        <ExportImportDialog
          open={isSchemaTransferOpen}
          onOpenChange={setIsSchemaTransferOpen}
          title="Database Schemas"
          onExport={handleExportSchemas}
          onImport={handleImportSchemas}
          exportInfo="Download all database schemas as a JSON file."
          importInfo="Imported schemas may update existing models. Review the file before continuing."
        />
        <CreateModelDialog
          open={isCreatingNew}
          onOpenChange={setIsCreatingNew}
          onSuccess={handleSchemaCreated}
        />
      </div>
    );
  }

  // Model detail view
  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToList}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Models
          </Button>
          <ModelSwitcher
            schemas={schemas}
            modules={modules}
            selectedSchema={selectedSchema ?? null}
            onSelect={handleModelSelect}
            onCreateNew={handleCreateNew}
          />
          {selectedSchema && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground tabular-nums">
              <span>
                {selectedFieldCount}{' '}
                {selectedFieldCount === 1 ? 'field' : 'fields'}
              </span>
              {documents && (
                <>
                  <span aria-hidden className="h-3 w-px bg-border" />
                  <span>
                    {documents.count.toLocaleString()}{' '}
                    {documents.count === 1 ? 'document' : 'documents'}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="px-6 pt-4">
          <TabsList>
            <TabsTrigger value="schema" className="gap-2">
              <Database className="w-4 h-4" />
              Schema
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Table2 className="w-4 h-4" />
              Data
            </TabsTrigger>
            <TabsTrigger value="extensions" className="gap-2">
              <Puzzle className="w-4 h-4" />
              Extensions
              {selectedSchema &&
                selectedSchema.extensions &&
                selectedSchema.extensions.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-0.5 h-5 min-w-5 px-1.5 font-normal tabular-nums"
                  >
                    {selectedSchema.extensions.length}
                  </Badge>
                )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            {showPolicies && (
              <TabsTrigger value="policies" className="gap-2">
                <Settings className="w-4 h-4" />
                Policies
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="schema" className="flex-1 overflow-hidden m-0 p-0">
          {selectedSchema && (
            <SchemaEditor
              schema={selectedSchema}
              availableModels={schemas.map(s => s.name)}
              onSave={() => handlePanelSaved('schema')}
              created={created}
              onOpenSettings={() => handleTabChange('settings')}
              onDirtyChange={dirty => reportPanelDirty('schema', dirty)}
            />
          )}
        </TabsContent>

        <TabsContent value="data" className="flex-1 overflow-hidden m-0 p-0">
          {selectedSchema && documents && (
            <DataExplorer schema={selectedSchema} documents={documents} />
          )}
        </TabsContent>

        <TabsContent
          value="extensions"
          className="flex-1 overflow-auto m-0 p-0"
        >
          {selectedSchema && (
            <ExtensionsPanel
              schema={selectedSchema}
              availableModels={schemas.map(s => s.name)}
              onSave={() => handlePanelSaved('extensions')}
              onDirtyChange={dirty => reportPanelDirty('extensions', dirty)}
            />
          )}
        </TabsContent>

        <TabsContent value="settings" className="flex-1 overflow-auto m-0 p-0">
          {selectedSchema && (
            <SettingsPanel
              key={selectedSchema._id}
              schema={selectedSchema}
              authResource={authResource}
              onSave={() => handlePanelSaved('settings')}
              databaseType={databaseType}
              onDirtyChange={dirty => reportPanelDirty('settings', dirty)}
            />
          )}
        </TabsContent>

        {showPolicies && authResource && (
          <TabsContent
            value="policies"
            className="flex-1 overflow-auto m-0 p-0"
          >
            <ModuleResourcePage resources={[authResource]} />
          </TabsContent>
        )}
      </Tabs>

      <AlertDialog
        open={pendingNavigation !== null}
        onOpenChange={open => {
          if (!open) handleCancelPendingNavigation();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in {dirtyPanelNames.join(', ')}. Leaving
              this view will discard them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelPendingNavigation}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscardPendingNavigation}>
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
