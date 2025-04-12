'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  CreateResourceDefinition,
  ResourceDefinition,
} from '@/lib/models/authorization';
import ResourceList from '@/components/authorization/resources/resource-list';
import ResourceEditor from '@/components/authorization/resources/resource-editor';

export default function ResourcesPageComponent({
  resources: initialResources,
  onSave,
  onDelete,
}: Readonly<{
  resources: ResourceDefinition[];
  onSave: (
    resource: ResourceDefinition | CreateResourceDefinition
  ) => Promise<ResourceDefinition>;
  onDelete: (resourceId: string) => Promise<void>;
}>) {
  const [resources, setResources] = useState<ResourceDefinition[]>([]);
  const [selectedResource, setSelectedResource] =
    useState<ResourceDefinition | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  useEffect(() => {
    if (initialResources) {
      setResources(initialResources);
    }
  }, [initialResources]);

  const handleSaveResource = useCallback(
    async (resource: ResourceDefinition | CreateResourceDefinition) => {
      return onSave(resource).then(res => {
        'use client';
        setResources(prev => {
          const index = prev.findIndex(r => r._id === res._id);
          if (index >= 0) {
            // Update existing resource
            const newResources = [...prev];
            newResources[index] = {
              ...res,
            };
            return newResources;
          } else {
            // Add new resource with a generated ID
            return [
              ...prev,
              {
                ...res,
              },
            ];
          }
        });

        setSelectedResource(null);
        setIsCreatingNew(false);
      });
    },
    [onSave]
  );

  const handleDeleteResource = useCallback(
    async (resourceId: string) => {
      await onDelete(resourceId);
      setResources(prev => prev.filter(r => r._id !== resourceId));
      if (selectedResource?._id === resourceId) {
        setSelectedResource(null);
      }
    },
    [selectedResource, onDelete]
  );

  return (
    <div className="w-full h-5/6 absolute left-0 top-13 flex gap-x-4 flex-col px-4 ">
      <h1 className="text-3xl font-bold mb-6">Authorization Management</h1>

      <div className="flex flex-row gap-6 overflow-auto">
        <div className="">
          <ResourceList
            resources={resources}
            onSelect={setSelectedResource}
            onDelete={handleDeleteResource}
            onCreateNew={() => {
              setSelectedResource(null);
              setIsCreatingNew(true);
            }}
          />
        </div>

        <div className="flex-grow">
          {isCreatingNew ? (
            <ResourceEditor onSave={handleSaveResource} />
          ) : selectedResource ? (
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
                <p className="text-muted-foreground mb-4">
                  Select a resource from the list or create a new one to get
                  started.
                </p>
                <Button onClick={() => setIsCreatingNew(true)}>
                  Create New Resource
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
