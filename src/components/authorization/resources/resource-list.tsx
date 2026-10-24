'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Eye, PlusCircle, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ResourceDefinition } from '@/lib/models/authorization';

interface ResourceListProps {
  resources: ResourceDefinition[];
  onSelect: (resource: ResourceDefinition) => void;
  onDelete?: (resourceId: string) => Promise<void>;
  onCreateNew?: () => void;
  moduleName?: string;
}

export default function ResourceList({
  resources,
  onSelect,
  onDelete,
  onCreateNew,
  moduleName,
}: Readonly<ResourceListProps>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredResources = resources.filter(resource =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (resourceId: string) => {
    if (!onDelete) return;

    try {
      setIsDeleting(true);
      await onDelete(resourceId);
      setResourceToDelete(null);
    } catch (error) {
      console.error('Failed to delete resource:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="h-[75vh]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Authorization Resources</CardTitle>
            <CardDescription>
              {moduleName
                ? `Manage authorization for ${moduleName} module`
                : 'Manage all authorization resources'}
            </CardDescription>
          </div>

          {onCreateNew && (
            <Button onClick={onCreateNew}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Resource
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            className="pl-8"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[50vh]">
          {filteredResources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? 'No resources match your search'
                : 'No resources available'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource Name</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead className="text-center">Relations</TableHead>
                  <TableHead className="text-center">Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map(resource => (
                  <TableRow
                    key={resource._id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => onSelect(resource)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {resource.name}
                        <Link
                          href={`/authorization/resources/${resource._id}`}
                          className="text-muted-foreground hover:text-primary"
                          onClick={e => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">v{resource.version}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {resource.relations
                          ? Object.keys(resource.relations).length
                          : 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {resource.permissions
                          ? Object.keys(resource.permissions).length
                          : 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={e => {
                            e.stopPropagation();
                            onSelect(resource);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={e => {
                              e.stopPropagation();
                              setResourceToDelete(resource._id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>

        {resourceToDelete && onDelete && (
          <Dialog
            open={!!resourceToDelete}
            onOpenChange={open => !open && setResourceToDelete(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Resource</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this resource? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setResourceToDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(resourceToDelete)}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
