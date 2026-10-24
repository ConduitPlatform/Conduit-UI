'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getResourceDefinitions } from '@/lib/api/authorization';

export interface ResourceInfo {
  name: string;
  relationsCount: number;
  permissionsCount: number;
  description?: string;
}

interface ResourceSelectionModalProps {
  open: boolean;
  selectForRelation: boolean;
  onOpenChange: (open: boolean) => void;
  selectedResources: string[];
  onSelect: (resources: string[]) => void;
  onSelectWildcard: () => void;
  title?: string;
  description?: string;
}

export default function ResourceSelectionModal({
  open,
  onOpenChange,
  selectForRelation,
  selectedResources,
  onSelect,
  onSelectWildcard,
  title = 'Select Resources',
  description = 'Choose resources to add to this relation',
}: Readonly<ResourceSelectionModalProps>) {
  let [resources, setResources] = useState<ResourceInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<string[]>(selectedResources);
  const [useWildcard, setUseWildcard] = useState(false);

  // Reset selected resources when the modal opens
  useEffect(() => {
    if (open) {
      setSelected(selectedResources);
      setUseWildcard(false);
    }
  }, [open, selectedResources]);

  useEffect(() => {
    getResourceDefinitions({ skip: 0, limit: 1000 }).then(res => {
      setResources(
        res.resources.map(resource => {
          let relationsCount = 0;
          let permissionsCount = 0;
          if (resource.relations) {
            relationsCount = Object.keys(resource.relations)
              .map(key => resource.relations![key].length)
              .reduce((sum, currentValue) => sum + currentValue, 0);
          }
          if (resource.permissions) {
            permissionsCount = Object.keys(resource.permissions)
              .map(key => resource.permissions![key].length)
              .reduce((sum, currentValue) => sum + currentValue, 0);
          }
          return {
            name: resource.name,
            relationsCount: relationsCount,
            permissionsCount: permissionsCount,
          } as ResourceInfo;
        })
      );
    });
  }, []);

  const filteredResources = useMemo(
    () =>
      resources.filter(resource =>
        resource.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [resources, searchTerm]
  );

  const handleToggleResource = (resourceName: string) => {
    setSelected(prev =>
      prev.includes(resourceName)
        ? prev.filter(r => r !== resourceName)
        : [...prev, resourceName]
    );
  };

  const handleToggleAll = () => {
    if (selected.length === filteredResources.length) {
      setSelected([]);
    } else {
      setSelected(filteredResources.map(r => r.name));
    }
  };

  const handleSave = () => {
    if (useWildcard) {
      onSelectWildcard();
    } else {
      onSelect(selected);
    }
    onOpenChange(false);
  };

  const handleWildcardChange = (checked: boolean) => {
    setUseWildcard(checked);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-4 my-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              className="pl-8"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="use-wildcard"
              checked={useWildcard}
              onCheckedChange={handleWildcardChange}
              disabled={selectForRelation}
            />
            <Label htmlFor="use-wildcard">Use wildcard (*)</Label>
          </div>
        </div>

        {useWildcard ? (
          <div className="bg-muted/50 rounded-md p-4 text-center my-4">
            <p className="text-sm font-medium">Wildcard selected</p>
            <p className="text-sm text-muted-foreground mt-1">
              This will allow any resource to have this relation
            </p>
          </div>
        ) : (
          <ScrollArea className="flex-1 border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        filteredResources.length > 0 &&
                        selected.length === filteredResources.length
                      }
                      disabled={selectForRelation}
                      onCheckedChange={handleToggleAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Resource Name</TableHead>
                  <TableHead className="text-right">Relations</TableHead>
                  <TableHead className="text-right">Permissions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No resources found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResources.map(resource => (
                    <TableRow key={resource.name}>
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(resource.name)}
                          onCheckedChange={() =>
                            handleToggleResource(resource.name)
                          }
                          disabled={
                            selected.length > 0 &&
                            selectForRelation &&
                            !selected.includes(resource.name)
                          }
                          aria-label={`Select ${resource.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {resource.name}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">
                          {resource.relationsCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">
                          {resource.permissionsCount}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {useWildcard
              ? 'Use Wildcard'
              : selectForRelation
                ? `Add Resource`
                : `Add ${selected.length} Resource${selected.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
