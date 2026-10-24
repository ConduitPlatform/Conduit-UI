'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { AlertCircle, Code, PlusCircle, Save, Trash2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { JsonEditor } from '@/components/ui/json-editor';
import ResourceSelectionModal from './resource-selection-modal';
import {
  CreateResourceDefinition,
  ResourceDefinition,
} from '@/lib/models/authorization';

interface ResourceEditorProps {
  resource?: ResourceDefinition;
  onSave: (
    resource: ResourceDefinition | CreateResourceDefinition
  ) => Promise<void>;
  readOnly?: boolean;
}

export default function ResourceEditor({
  resource,
  onSave,
  readOnly = false,
}: Readonly<ResourceEditorProps>) {
  const [currentResource, setCurrentResource] = useState<
    ResourceDefinition | CreateResourceDefinition
  >({
    name: '',
    relations: {},
    permissions: {},
    version: 0,
  });
  useEffect(() => {
    if (resource) {
      setCurrentResource(resource);
    }
  }, [resource]);
  const [jsonResource, setJsonResource] = useState<
    ResourceDefinition | CreateResourceDefinition
  >(currentResource);

  const [newRelationName, setNewRelationName] = useState('');
  const [newPermissionName, setNewPermissionName] = useState('');
  const [newPermissionRelation, setNewPermissionRelation] = useState('');
  const [isAddingRelation, setIsAddingRelation] = useState(false);
  const [isAddingPermission, setIsAddingPermission] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Add a new state for the resource selection modal
  const [isResourceSelectionOpen, setIsResourceSelectionOpen] = useState(false);
  const [currentRelationForSelection, setCurrentRelationForSelection] =
    useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('relations');

  // Update jsonResource when currentResource changes
  useEffect(() => {
    setJsonResource(currentResource);
  }, [currentResource]);

  // Function to check if a relation includes wildcard resources
  const hasWildcardResource = (relationName: string): boolean => {
    const relation = currentResource.relations?.[relationName];
    return relation ? relation.includes('*') : false;
  };

  // Function to get unique permissions from resources in a relation
  const getUniquePermissionsForRelation = (relationName: string): string[] => {
    // const relation = currentResource.relations[relationName];
    //
    // if (!relation || relation === '*') return [];
    //
    // // Get all resources that can have this relation
    // const resourceNames = Array.isArray(relation) ? relation : [relation];
    if (!currentResource.permissions) return [];
    // Find all unique permissions across these resources
    const uniquePermissions = new Set<string>();

    // In a real app, you would fetch all resources and their permissions
    // For now, we'll just use the current resource's permissions as an example
    Object.keys(currentResource.permissions).forEach(permission => {
      uniquePermissions.add(permission);
    });

    return Array.from(uniquePermissions);
  };

  // Get all relation names for the current resource
  const relationNames = currentResource.relations
    ? Object.keys(currentResource.relations)
    : [];

  // Function to add a new relation
  const addRelation = () => {
    if (!newRelationName.trim()) {
      setError('Relation name cannot be empty');
      return;
    }

    if (relationNames.includes(newRelationName)) {
      setError('Relation name already exists');
      return;
    }

    setCurrentResource(prev => ({
      ...prev,
      relations: {
        ...prev.relations,
        [newRelationName]: [], // Start with empty array instead of requiring initial resource
      },
    }));

    setNewRelationName('');
    setIsAddingRelation(false);
    setError(null);
  };

  // Function to remove a relation
  const removeRelation = (relationName: string) => {
    const newRelations = { ...currentResource.relations };
    delete newRelations[relationName];

    // Also remove this relation from any permissions that use it
    const newPermissions = { ...currentResource.permissions };
    Object.keys(newPermissions).forEach(permName => {
      newPermissions[permName] = newPermissions[permName].filter(
        rel => !rel.startsWith(relationName) && rel !== relationName
      );
    });

    setCurrentResource(prev => ({
      ...prev,
      relations: newRelations,
      permissions: newPermissions,
    }));
  };

  // Function to remove a resource from a relation
  const removeResourceFromRelation = (
    relationName: string,
    resourceName: string
  ) => {
    const currentRelation = currentResource.relations?.[relationName];

    setCurrentResource(prev => ({
      ...prev,
      relations: {
        ...prev.relations,
        [relationName]: currentRelation
          ? currentRelation.filter(r => r !== resourceName)
          : [],
      },
    }));
  };

  // Function to toggle wildcard for a relation
  const toggleRelationWildcard = (relationName: string) => {
    const currentRelation = currentResource.relations?.[relationName];

    setCurrentResource(prev => ({
      ...prev,
      relations: {
        ...prev.relations,
        [relationName]: currentRelation
          ? currentRelation.includes('*')
            ? [...currentRelation.filter(rel => rel !== '*')]
            : ['*']
          : [],
      },
    }));
  };

  // Function to add a new permission
  const addPermission = () => {
    if (!newPermissionName.trim()) {
      setError('Permission name cannot be empty');
      return;
    }

    if (
      currentResource.permissions &&
      Object.keys(currentResource.permissions).includes(newPermissionName)
    ) {
      setError('Permission name already exists');
      return;
    }

    setCurrentResource(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [newPermissionName]: newPermissionRelation
          ? [newPermissionRelation]
          : [],
      },
    }));

    setNewPermissionName('');
    setNewPermissionRelation('');
    setIsAddingPermission(false);
    setError(null);
  };

  // Function to remove a permission
  const removePermission = (permissionName: string) => {
    const newPermissions = { ...currentResource.permissions };
    delete newPermissions[permissionName];

    setCurrentResource(prev => ({
      ...prev,
      permissions: newPermissions,
    }));
  };

  // Function to add a relation to a permission
  const addRelationToPermission = (
    permissionName: string,
    relationValue: string
  ) => {
    if (!relationValue) return;

    const currentPermission = currentResource.permissions?.[permissionName];

    if (!currentPermission?.includes(relationValue)) {
      setCurrentResource(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permissionName]: [...(currentPermission ?? []), relationValue],
        },
      }));
    }
  };

  // Function to remove a relation from a permission
  const removeRelationFromPermission = (
    permissionName: string,
    relationValue: string
  ) => {
    const currentPermission = currentResource.permissions?.[permissionName];

    setCurrentResource(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionName]: currentPermission
          ? currentPermission.filter(r => r !== relationValue)
          : [],
      },
    }));
  };

  // Function to handle save
  const handleSave = async () => {
    if (!currentResource.name.trim()) {
      setError('Resource name cannot be empty');
      return;
    }

    try {
      setSaving(true);
      await onSave(currentResource);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save resource');
    } finally {
      setSaving(false);
    }
  };

  // Function to handle JSON save
  const handleJsonSave = async () => {
    if (!jsonResource.name.trim()) {
      setError('Resource name cannot be empty');
      return;
    }

    try {
      setSaving(true);
      // Update the current resource with the JSON version
      setCurrentResource(jsonResource);
      await onSave(jsonResource);
      setError(null);
      // Switch back to the relations tab after saving
      setActiveTab('relations');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save resource');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-4">
              <Input
                value={currentResource.name}
                onChange={e =>
                  setCurrentResource(prev => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Resource Name"
                className="text-xl font-bold"
                disabled={
                  readOnly ||
                  activeTab === 'json' ||
                  !!(currentResource as ResourceDefinition)._id
                }
              />
              <Badge variant="outline">v{currentResource.version}</Badge>
            </div>
          </CardTitle>
          <CardDescription>
            Define the authorization model for this resource
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs
            defaultValue="relations"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="relations">Relations</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="json">
                <Code className="h-4 w-4 mr-2" />
                JSON
              </TabsTrigger>
            </TabsList>

            <TabsContent value="relations">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Relations</h3>
                  {!readOnly && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingRelation(true)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Relation
                    </Button>
                  )}
                </div>

                <ScrollArea className="h-[400px] pr-4">
                  {relationNames.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No relations defined yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {relationNames.map(relationName => {
                        const relation =
                          currentResource.relations?.[relationName];
                        const isWildcard =
                          relation &&
                          relation.length === 1 &&
                          relation.includes('*');
                        const resources = isWildcard ? [] : relation;

                        return (
                          <Card key={relationName}>
                            <CardHeader className="py-3">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-base">
                                  {relationName}
                                </CardTitle>
                                {!readOnly && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeRelation(relationName)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="py-2">
                              {!readOnly && (
                                <div className="flex items-center space-x-2 mb-4">
                                  <Switch
                                    checked={isWildcard}
                                    onCheckedChange={() =>
                                      toggleRelationWildcard(relationName)
                                    }
                                    id={`wildcard-${relationName}`}
                                  />
                                  <Label htmlFor={`wildcard-${relationName}`}>
                                    Allow any resource
                                  </Label>
                                </div>
                              )}

                              {isWildcard ? (
                                <Badge
                                  variant="secondary"
                                  className="mr-2 mb-2"
                                >
                                  * (Any resource)
                                </Badge>
                              ) : (
                                <div>
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {resources?.map(resource => (
                                      <Badge
                                        key={resource}
                                        variant="secondary"
                                        className="flex items-center gap-1"
                                      >
                                        {resource}
                                        {!readOnly && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 ml-1"
                                            onClick={() =>
                                              removeResourceFromRelation(
                                                relationName,
                                                resource
                                              )
                                            }
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        )}
                                      </Badge>
                                    ))}
                                  </div>

                                  {!readOnly && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setCurrentRelationForSelection(
                                          relationName
                                        );
                                        setIsResourceSelectionOpen(true);
                                      }}
                                    >
                                      <PlusCircle className="h-4 w-4 mr-2" />
                                      Add Resource
                                    </Button>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>

                {isAddingRelation && (
                  <Dialog
                    open={isAddingRelation}
                    onOpenChange={setIsAddingRelation}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Relation</DialogTitle>
                        <DialogDescription>
                          Define a new relation for this resource
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="relation-name">Relation Name</Label>
                          <Input
                            id="relation-name"
                            value={newRelationName}
                            onChange={e => setNewRelationName(e.target.value)}
                            placeholder="e.g. member, owner"
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingRelation(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={addRelation}>Add Relation</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </TabsContent>

            <TabsContent value="permissions">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Permissions</h3>
                  {!readOnly && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingPermission(true)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Permission
                    </Button>
                  )}
                </div>

                <ScrollArea className="h-[400px] pr-4">
                  {!currentResource.permissions ||
                  Object.keys(currentResource.permissions).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No permissions defined yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(currentResource.permissions).map(
                        ([permissionName, relations]) => (
                          <Card key={permissionName}>
                            <CardHeader className="py-3">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-base">
                                  {permissionName}
                                </CardTitle>
                                {!readOnly && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      removePermission(permissionName)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="py-2">
                              <div className="flex flex-wrap gap-2 mb-4">
                                {relations.length === 0 ? (
                                  <div className="text-sm text-muted-foreground">
                                    No relations assigned
                                  </div>
                                ) : (
                                  relations.map(relation => (
                                    <Badge
                                      key={relation}
                                      variant="secondary"
                                      className="flex items-center gap-1"
                                    >
                                      {relation}
                                      {!readOnly && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-4 w-4 p-0 ml-1"
                                          onClick={() =>
                                            removeRelationFromPermission(
                                              permissionName,
                                              relation
                                            )
                                          }
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      )}
                                    </Badge>
                                  ))
                                )}
                              </div>

                              {!readOnly && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <PlusCircle className="h-4 w-4 mr-2" />
                                      Add Relation
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>
                                        Add Relation to Permission
                                      </DialogTitle>
                                      <DialogDescription>
                                        Select a relation or create a relation
                                        path
                                      </DialogDescription>
                                    </DialogHeader>

                                    <Tabs defaultValue="relation">
                                      <TabsList className="mb-4">
                                        <TabsTrigger value="relation">
                                          Relation
                                        </TabsTrigger>
                                        <TabsTrigger value="path">
                                          Relation Path
                                        </TabsTrigger>
                                        <TabsTrigger value="wildcard">
                                          Wildcard
                                        </TabsTrigger>
                                      </TabsList>

                                      <TabsContent value="relation">
                                        <Select
                                          onValueChange={value =>
                                            addRelationToPermission(
                                              permissionName,
                                              value
                                            )
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select a relation" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {relationNames
                                              .filter(
                                                r => !relations.includes(r)
                                              )
                                              .map(relation => (
                                                <SelectItem
                                                  key={relation}
                                                  value={relation}
                                                >
                                                  {relation}
                                                </SelectItem>
                                              ))}
                                          </SelectContent>
                                        </Select>
                                      </TabsContent>

                                      <TabsContent value="path">
                                        <div className="grid gap-4">
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <Label>Relation</Label>
                                              <Select
                                                onValueChange={value => {
                                                  setNewPermissionRelation(
                                                    `${value}->`
                                                  );
                                                  // Reset any previously selected permission when relation changes
                                                  if (
                                                    newPermissionRelation.includes(
                                                      '->'
                                                    )
                                                  ) {
                                                    setNewPermissionRelation(
                                                      `${value}->`
                                                    );
                                                  }
                                                }}
                                              >
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select relation" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {relationNames.map(
                                                    relation => (
                                                      <SelectItem
                                                        key={relation}
                                                        value={relation}
                                                      >
                                                        {relation}
                                                      </SelectItem>
                                                    )
                                                  )}
                                                </SelectContent>
                                              </Select>
                                            </div>

                                            <div>
                                              <Label>Permission</Label>
                                              {newPermissionRelation &&
                                                newPermissionRelation.endsWith(
                                                  '->'
                                                ) && (
                                                  <>
                                                    {hasWildcardResource(
                                                      newPermissionRelation.split(
                                                        '->'
                                                      )[0]
                                                    ) ? (
                                                      <Input
                                                        placeholder="Enter permission name"
                                                        onChange={e => {
                                                          const relationPart =
                                                            newPermissionRelation.split(
                                                              '->'
                                                            )[0];
                                                          setNewPermissionRelation(
                                                            `${relationPart}->${e.target.value}`
                                                          );
                                                        }}
                                                        onBlur={() => {
                                                          if (
                                                            newPermissionRelation.endsWith(
                                                              '->'
                                                            )
                                                          )
                                                            return;

                                                          const [
                                                            relationPart,
                                                            permissionPart,
                                                          ] =
                                                            newPermissionRelation.split(
                                                              '->'
                                                            );
                                                          if (
                                                            permissionPart &&
                                                            permissionPart.trim()
                                                          ) {
                                                            addRelationToPermission(
                                                              permissionName,
                                                              newPermissionRelation
                                                            );
                                                          }
                                                        }}
                                                      />
                                                    ) : (
                                                      <Select
                                                        onValueChange={value => {
                                                          const relationPart =
                                                            newPermissionRelation.split(
                                                              '->'
                                                            )[0];
                                                          const fullPath = `${relationPart}->${value}`;
                                                          setNewPermissionRelation(
                                                            fullPath
                                                          );
                                                          addRelationToPermission(
                                                            permissionName,
                                                            fullPath
                                                          );
                                                        }}
                                                      >
                                                        <SelectTrigger>
                                                          <SelectValue placeholder="Select permission" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                          {getUniquePermissionsForRelation(
                                                            newPermissionRelation.split(
                                                              '->'
                                                            )[0]
                                                          ).map(permission => (
                                                            <SelectItem
                                                              key={permission}
                                                              value={permission}
                                                            >
                                                              {permission}
                                                            </SelectItem>
                                                          ))}
                                                        </SelectContent>
                                                      </Select>
                                                    )}
                                                  </>
                                                )}
                                            </div>
                                          </div>

                                          {newPermissionRelation &&
                                            newPermissionRelation.includes(
                                              '->'
                                            ) && (
                                              <div className="text-sm">
                                                Path:{' '}
                                                <Badge>
                                                  {newPermissionRelation}
                                                </Badge>
                                              </div>
                                            )}
                                        </div>
                                      </TabsContent>

                                      <TabsContent value="wildcard">
                                        <Button
                                          onClick={() =>
                                            addRelationToPermission(
                                              permissionName,
                                              '*'
                                            )
                                          }
                                          className="w-full"
                                        >
                                          Add Wildcard (*)
                                        </Button>
                                        <p className="text-sm text-muted-foreground mt-2">
                                          This will allow anyone to have this
                                          permission
                                        </p>
                                      </TabsContent>
                                    </Tabs>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </CardContent>
                          </Card>
                        )
                      )}
                    </div>
                  )}
                </ScrollArea>

                {isAddingPermission && (
                  <Dialog
                    open={isAddingPermission}
                    onOpenChange={setIsAddingPermission}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Permission</DialogTitle>
                        <DialogDescription>
                          Define a new permission for this resource
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="permission-name">
                            Permission Name
                          </Label>
                          <Input
                            id="permission-name"
                            value={newPermissionName}
                            onChange={e => setNewPermissionName(e.target.value)}
                            placeholder="e.g. read, edit, delete"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="permission-relation">
                            Initial Relation (Optional)
                          </Label>
                          <Select
                            value={newPermissionRelation}
                            onValueChange={setNewPermissionRelation}
                          >
                            <SelectTrigger id="permission-relation">
                              <SelectValue placeholder="Select a relation" />
                            </SelectTrigger>
                            <SelectContent>
                              {relationNames.map(relation => (
                                <SelectItem key={relation} value={relation}>
                                  {relation}
                                </SelectItem>
                              ))}
                              <SelectItem value="*">* (Any user)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingPermission(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={addPermission}>Add Permission</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </TabsContent>

            <TabsContent value="json">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">JSON Editor</h3>
                  <div className="text-sm text-muted-foreground">
                    Edit the resource definition directly as JSON
                  </div>
                </div>

                <JsonEditor
                  value={jsonResource}
                  onChange={setJsonResource}
                  height="500px"
                  readOnly={readOnly}
                />

                {!readOnly && (
                  <div className="flex justify-end mt-4">
                    <Button onClick={handleJsonSave} disabled={saving}>
                      {saving ? 'Saving...' : 'Apply JSON Changes'}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() =>
              setCurrentResource(
                resource || {
                  name: '',
                  relations: {},
                  permissions: {},
                  version: 0,
                }
              )
            }
          >
            Reset
          </Button>

          {!readOnly && activeTab !== 'json' && (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
              {!saving && <Save className="ml-2 h-4 w-4" />}
            </Button>
          )}
        </CardFooter>
      </Card>
      {/* Resource Selection Modal */}
      {currentRelationForSelection && (
        <ResourceSelectionModal
          open={isResourceSelectionOpen}
          onOpenChange={setIsResourceSelectionOpen}
          selectForRelation={false}
          selectedResources={
            currentResource.relations &&
            Array.isArray(
              currentResource.relations[currentRelationForSelection]
            )
              ? (currentResource.relations[
                  currentRelationForSelection
                ] as string[])
              : []
          }
          onSelect={resources => {
            setCurrentResource(prev => ({
              ...prev,
              relations: {
                ...prev.relations,
                [currentRelationForSelection]: resources,
              },
            }));
          }}
          onSelectWildcard={() => {
            setCurrentResource(prev => ({
              ...prev,
              relations: {
                ...prev.relations,
                [currentRelationForSelection]: ['*'],
              },
            }));
          }}
          title={`Add Resources to ${currentRelationForSelection}`}
          description={`Select resources that can have the ${currentRelationForSelection} relation with ${currentResource.name}`}
        />
      )}
    </>
  );
}
