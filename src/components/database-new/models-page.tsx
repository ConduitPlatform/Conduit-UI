'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { DeclaredSchema } from '@/lib/models/database';
import { ResourceDefinition } from '@/lib/models/authorization';
import { ModelsListTable } from './models-list-table';
import { CreateModelDialog } from './create-model-dialog';
import { ModelSwitcher } from './model-switcher';
import { SchemaEditor } from './schema-editor';
import { DataExplorer } from './data-explorer';
import { SettingsPanel } from './settings-panel';
import { ExtensionsPanel } from './extensions-panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Database,
  Table2,
  Settings,
  Plus,
  ArrowLeft,
  Puzzle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export type ModelsNewTab = 'schema' | 'data' | 'extensions' | 'settings';

function normalizeTab(tab: string | undefined): ModelsNewTab {
  if (
    tab === 'schema' ||
    tab === 'data' ||
    tab === 'extensions' ||
    tab === 'settings'
  ) {
    return tab;
  }
  return 'schema';
}

type ModelsNewPageProps = {
  schemas: DeclaredSchema[];
  modules: string[];
  selectedModelId: string | null;
  selectedSchema?: DeclaredSchema;
  documents?: {
    documents: any[];
    count: number;
  };
  authResource?: ResourceDefinition | null;
  initialTab?: ModelsNewTab;
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
};

export function ModelsNewPage({
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
}: ModelsNewPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState(() =>
    normalizeTab(initialTab)
  );
  const [isCreatingNew, setIsCreatingNew] = React.useState(false);

  React.useEffect(() => {
    setActiveTab(normalizeTab(initialTab));
  }, [initialTab]);

  const handleModelSelect = (modelId: string) => {
    router.push(`/database/models-new/${modelId}`);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(normalizeTab(tab));
    if (selectedModelId) {
      router.push(`/database/models-new/${selectedModelId}?tab=${tab}`, {
        scroll: false,
      });
    }
  };

  const handleCreateNew = () => {
    setIsCreatingNew(true);
  };

  const handleSchemaCreated = (schema?: DeclaredSchema) => {
    setIsCreatingNew(false);
    if (schema) {
      router.push(`/database/models-new/${schema._id}`);
    }
    router.refresh();
  };

  const handleSchemaUpdated = () => {
    router.refresh();
  };

  const handleBackToList = () => {
    router.push('/database/models-new');
  };

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
        />
        <CreateModelDialog
          open={isCreatingNew}
          onOpenChange={setIsCreatingNew}
          availableModels={schemas.map(s => s.name)}
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
            <>
              <span className="text-sm text-muted-foreground">
                {
                  Object.keys(
                    selectedSchema.compiledFields || selectedSchema.fields || {}
                  ).length
                }{' '}
                fields
              </span>
              {documents && (
                <span className="text-sm text-muted-foreground">
                  {documents.count.toLocaleString()} documents
                </span>
              )}
            </>
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
          </TabsList>
        </div>

        <TabsContent value="schema" className="flex-1 overflow-hidden m-0 p-0">
          {selectedSchema && (
            <SchemaEditor
              schema={selectedSchema}
              availableModels={schemas.map(s => s.name)}
              onSave={handleSchemaUpdated}
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
              onSave={handleSchemaUpdated}
            />
          )}
        </TabsContent>

        <TabsContent value="settings" className="flex-1 overflow-auto m-0 p-0">
          {selectedSchema && (
            <SettingsPanel
              key={selectedSchema._id}
              schema={selectedSchema}
              authResource={authResource}
              onSave={handleSchemaUpdated}
              databaseType={databaseType}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
