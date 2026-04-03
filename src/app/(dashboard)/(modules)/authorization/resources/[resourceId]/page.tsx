import {
  CreateResourceDefinition,
  ResourceDefinition,
} from '@/lib/models/authorization';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResourceEditor from '@/components/authorization/resources/resource-editor';
import ResourceVisualizer from '@/components/authorization/resources/resource-visualizer';
import Link from 'next/link';
import {
  getResourceDefinition,
  getResourceDefinitions,
  patchResourceDefinition,
} from '@/lib/api/authorization';

export default async function ResourceDetailPage({
  params,
}: Readonly<{ params: Promise<{ resourceId: string }> }>) {
  const { resourceId } = await params;
  const resource = await getResourceDefinition(resourceId);
  const { resources } = await getResourceDefinitions({ skip: 0, limit: 1000 });
  const resourceMap: Record<string, { _id: string; name: string }> =
    Object.values(resources).reduce(
      (map, resource) => {
        map[resource.name] = { _id: resource._id, name: resource.name };
        return map;
      },
      {} as Record<string, { _id: string; name: string }>
    );
  const handleSaveResource = async (
    updatedResource: ResourceDefinition | CreateResourceDefinition
  ) => {
    'use server';
    if (!('_id' in updatedResource)) {
      throw new Error('Resource id is required to save');
    }
    await patchResourceDefinition(updatedResource);
  };

  if (!resource) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" className="mb-4" asChild>
          <Link
            href="/authorization/resources"
            className="inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Resources
          </Link>
        </Button>

        <div className="flex justify-center items-center h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Resource Not Found</h2>
            <p className="text-muted-foreground">
              The resource with ID &quot;{resourceId}&quot; does not exist or
              you don&apos;t have permission to view it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Button variant="ghost" className="mb-4" asChild>
        <Link
          href="/authorization/resources"
          className="inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Resources
        </Link>
      </Button>

      <Tabs defaultValue="editor">
        <TabsList className="mb-6">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="visualizer">Visualizer</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <ResourceEditor resource={resource} onSave={handleSaveResource} />
        </TabsContent>

        <TabsContent value="visualizer">
          <ResourceVisualizer resource={resource} resourceMap={resourceMap} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
