'use client';
import ResourceList from '@/components/authorization/resources/resource-list';
import {
  CreateResourceDefinition,
  ResourceDefinition,
} from '@/lib/models/authorization';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ResourceEditor from '@/components/authorization/resources/resource-editor';
import {
  createResourceDefinition,
  patchResourceDefinition,
} from '@/lib/api/authorization';

export default function ModuleResourcePage({
  resources: defaultResources,
}: Readonly<{
  resources: ResourceDefinition[];
}>) {
  const resources = useMemo(() => defaultResources, [defaultResources]);
  const [selectedResource, setSelectedResource] =
    useState<ResourceDefinition | null>(defaultResources?.[0] || null);

  useEffect(() => {
    if (resources.length === 1) {
      setSelectedResource(resources[0]);
    }
  }, [resources]);

  useEffect(() => {}, []);

  const handleSaveResource = useCallback(
    async (resource: ResourceDefinition | CreateResourceDefinition) => {
      if ('_id' in resource) {
        await patchResourceDefinition({
          ...resource,
          version: resource.version + 1,
        });
      } else {
        await createResourceDefinition(resource);
      }
    },
    []
  );

  return (
    <div className="w-full flex gap-x-4 flex-col px-4 ">
      <div className="flex flex-row gap-6 overflow-auto">
        {resources.length > 1 && (
          <div className="">
            <ResourceList
              resources={resources}
              onSelect={setSelectedResource}
              moduleName="Authentication"
            />
          </div>
        )}

        <div className="flex-grow">
          {selectedResource ? (
            <ResourceEditor
              resource={selectedResource}
              onSave={handleSaveResource}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <h2 className="text-xl font-medium mb-2">
                  No Resource Selected
                </h2>
                <p className="text-muted-foreground">
                  Select a resource from the list to view or edit its
                  authorization model.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
