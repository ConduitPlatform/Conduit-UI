'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Database,
  ExternalLink,
  Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import PermissionPathVisualizer from './permission-path-visualizer';
import PermissionGraphVisualizer from './permission-graph-visualizer';
import DatabaseEntitySelectionModal from '@/components/authorization/relations/database-entity-selection-modal';
import { ResourceDefinition } from '@/lib/models/authorization';
import { getSchemas } from '@/lib/api/database';
import { checkPermission } from '@/lib/api/authorization';

// Mock permission check result
interface PermissionCheckResult {
  granted: boolean;
  path?: PermissionPath;
  error?: string;
}

// Mock permission path
interface PermissionPath {
  steps: PermissionStep[];
  actorIndexes: any[];
  objectIndexes: any[];
}

interface PermissionStep {
  type: 'relation' | 'permission' | 'inheritance';
  description: string;
  from: {
    type: string;
    id: string;
    name?: string;
  };
  to: {
    type: string;
    id: string;
    name?: string;
  };
  relation?: string;
  permission?: string;
}

type Props = {
  resources: ResourceDefinition[];
};

export default function PermissionChecker({ resources }: Readonly<Props>) {
  // State for the permission query
  const [subjectType, setSubjectType] = useState<string | undefined>();
  const [subjectId, setSubjectId] = useState<string | undefined>();
  const [permission, setPermission] = useState<string | undefined>();
  const [targetType, setTargetType] = useState<string | undefined>();
  const [targetId, setTargetId] = useState<string | undefined>();

  // State for entity selection modals
  const [isSubjectEntityModalOpen, setIsSubjectEntityModalOpen] =
    useState(false);
  const [isTargetEntityModalOpen, setIsTargetEntityModalOpen] = useState(false);

  const [subjectTypeHasDbSchema, setSubjectTypeHasDbSchema] = useState(false);
  const [targetTypeHasDbSchema, setTargetTypeHasDbSchema] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>(
    []
  );
  // State for permission check results
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<PermissionCheckResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // State for graph visualization
  const [isGraphOpen, setIsGraphOpen] = useState(false);

  useEffect(() => {
    if (!resources || !targetType) return;
    setPermission(undefined);
    // Fetch available permissions based on the selected subject type
    if (subjectType) {
      let targetResource = resources.find(
        resource => resource.name === targetType
      );
      if (!targetResource) {
        setAvailablePermissions([]);
        return;
      }
      const permissions = Object.keys(targetResource.permissions!);
      setAvailablePermissions(permissions);
    } else {
      setAvailablePermissions([]);
    }
  }, [targetType]);

  useEffect(() => {
    getSchemas({ skip: 0, limit: 1000, search: subjectType }).then(res => {
      'use client';
      setSubjectTypeHasDbSchema(res.schemas?.length > 0);
    });
  }, [subjectType]);

  useEffect(() => {
    getSchemas({ skip: 0, limit: 1000, search: subjectType }).then(res => {
      'use client';
      setTargetTypeHasDbSchema(res.schemas?.length > 0);
    });
  }, [targetTypeHasDbSchema]);

  // Handle permission check
  const handleCheckPermission = useCallback(async () => {
    // Validate inputs
    if (!subjectType || !subjectId || !permission || !targetType || !targetId) {
      setResult({
        granted: false,
        error: 'All fields are required',
      });
      return;
    }

    setIsChecking(true);
    setResult(null);

    try {
      const res = await checkPermission({
        subject: `${subjectType}:${subjectId}`,
        permission: permission,
        resource: `${targetType}:${targetId}`,
      });
      if (res.allowed) {
        let path: PermissionPath = {
          steps: [],
          actorIndexes: [],
          objectIndexes: [],
        };
        if (res.assigned) {
          path.steps = [
            {
              type: 'permission',
              description: `Direct ${permission} granted`,
              from: { type: subjectType, id: subjectId },
              to: { type: targetType, id: targetId },
              permission,
            },
          ];
          setResult({ granted: true });
          return;
        } else {
          path.steps = res.paths!.map((subjectPath, index) => {
            // SubjectType:SubjectId#relation@TargetType:TargetId
            const [subjectAndRelation, target] = subjectPath.split('@');
            const [subject, relation] = subjectAndRelation.split('#');
            const [subjectType, subjectId] = subject.split(':');
            const [targetType, targetId] = target.split(':');
            if (index === 0) {
              return {
                type: 'relation',
                description: `${subject} is ${relation} on ${targetType}`,
                from: { type: subjectType, id: subjectId },
                to: { type: targetType, id: targetId },
                relation: relation,
              };
            } else {
              return {
                type: 'inheritance',
                description: `${subject} is ${relation} on ${targetType}`,
                from: { type: subjectType, id: subjectId },
                to: { type: targetType, id: targetId },
                relation: relation,
              };
            }
          });
          path.steps.push({
            type: 'permission',
            description: `Permission granted`,
            from: {
              type: res.objectIndex!.entityType,
              id: res.objectIndex!.entityId,
            },
            to: {
              type: res.objectIndex!.subjectType,
              id: res.objectIndex!.subjectId,
            },
            permission,
          });
          path.objectIndexes = [res.objectIndex!];
          path.actorIndexes = [res.subjectIndex!];
        }
        setResult({ granted: true, path });
      } else {
        setResult({ granted: false });
      }
    } catch (error) {
      setResult({
        granted: false,
        error: 'An error occurred while checking permission',
      });
    } finally {
      setIsChecking(false);
    }
  }, [subjectType, subjectId, permission, targetType, targetId]);

  // Reset the form
  const handleReset = () => {
    setSubjectType('');
    setSubjectId('');
    setPermission('');
    setTargetType('');
    setTargetId('');
    setResult(null);
    setShowDetails(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Permission Checker</CardTitle>
          <CardDescription>
            Check if a subject has permission on a target
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject Selection */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Subject</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  The entity requesting permission
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject-type">Subject Type</Label>
                <Select
                  value={subjectType}
                  onValueChange={value => {
                    setSubjectType(value);
                    setSubjectId('');
                  }}
                >
                  <SelectTrigger id="subject-type">
                    <SelectValue placeholder="Select subject type" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.map(type => (
                      <SelectItem key={type._id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject-id">Subject ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="subject-id"
                    value={subjectId}
                    onChange={e => setSubjectId(e.target.value)}
                    placeholder={
                      subjectType
                        ? subjectTypeHasDbSchema
                          ? 'Select from database or enter ID'
                          : 'Enter subject ID'
                        : 'First select subject type'
                    }
                    disabled={!subjectType}
                    className="flex-1"
                  />
                  {subjectType && subjectTypeHasDbSchema && (
                    <Button
                      variant="outline"
                      onClick={() => setIsSubjectEntityModalOpen(true)}
                      disabled={!subjectType}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Browse
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Target Selection */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Resource</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  The entity being accessed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-type">Resource Type</Label>
                <Select
                  value={targetType}
                  onValueChange={value => {
                    setTargetType(value);
                    setTargetId('');
                  }}
                >
                  <SelectTrigger id="target-type">
                    <SelectValue placeholder="Select resource type" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.map(type => (
                      <SelectItem key={type._id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-id">Resource ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="target-id"
                    value={targetId}
                    onChange={e => setTargetId(e.target.value)}
                    placeholder={
                      targetType
                        ? targetTypeHasDbSchema
                          ? 'Select from database or enter ID'
                          : 'Enter target ID'
                        : 'First select target type'
                    }
                    disabled={!targetType}
                    className="flex-1"
                  />
                  {targetType && targetTypeHasDbSchema && (
                    <Button
                      variant="outline"
                      onClick={() => setIsTargetEntityModalOpen(true)}
                      disabled={!targetType}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Browse
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Permission Selection */}
          <div className="mt-6">
            <Label htmlFor="permission" className="text-base font-medium">
              Permission
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              The permission to check
            </p>

            <Select value={permission} onValueChange={setPermission}>
              <SelectTrigger id="permission" className="w-full">
                <SelectValue placeholder="Select permission" />
              </SelectTrigger>
              <SelectContent>
                {availablePermissions.map(perm => (
                  <SelectItem key={perm} value={perm}>
                    {perm}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Query Summary */}
          {subjectType && subjectId && permission && targetType && targetId && (
            <div className="mt-6 p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">Permission Query:</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="bg-background">
                  {subjectType}:{subjectId}
                </Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Badge>{permission}</Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className="bg-background">
                  {targetType}:{targetId}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button
            onClick={handleCheckPermission}
            disabled={
              isChecking ||
              !subjectType ||
              !subjectId ||
              !permission ||
              !targetType ||
              !targetId
            }
          >
            {isChecking ? 'Checking...' : 'Check Permission'}
            {!isChecking && <Search className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>

      {/* Results Card */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Permission Check Result</CardTitle>
            <CardDescription>
              Result for {subjectType}:{subjectId} → {permission} → {targetType}
              :{targetId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result.error ? (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={result.granted ? 'default' : 'destructive'}
                      className="px-3 py-1"
                    >
                      {result.granted
                        ? 'Permission Granted'
                        : 'Permission Denied'}
                    </Badge>
                    {result.granted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDetails(!showDetails)}
                        className="gap-1"
                      >
                        {showDetails ? 'Hide Details' : 'Show Details'}
                        {showDetails ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  {result.granted && result.path && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsGraphOpen(true)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View in Graph
                    </Button>
                  )}
                </div>

                {result.granted && showDetails && result.path && (
                  <div className="mt-6">
                    <Tabs defaultValue="path">
                      <TabsList>
                        <TabsTrigger value="path">Permission Path</TabsTrigger>
                        <TabsTrigger value="indexes">Raw Indexes</TabsTrigger>
                      </TabsList>
                      <TabsContent value="path" className="mt-4">
                        <PermissionPathVisualizer path={result.path} />
                      </TabsContent>
                      <TabsContent value="indexes" className="mt-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">
                              Actor Indexes
                            </h4>
                            <div className="bg-muted p-3 rounded-md overflow-x-auto">
                              <pre className="text-xs">
                                {JSON.stringify(
                                  result.path.actorIndexes,
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-2">
                              Object Indexes
                            </h4>
                            <div className="bg-muted p-3 rounded-md overflow-x-auto">
                              <pre className="text-xs">
                                {JSON.stringify(
                                  result.path.objectIndexes,
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isChecking && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entity Selection Modals */}
      {subjectType && (
        <DatabaseEntitySelectionModal
          open={isSubjectEntityModalOpen}
          onOpenChange={setIsSubjectEntityModalOpen}
          entityType={subjectType}
          onSelect={entityId => {
            setSubjectId(entityId);
          }}
        />
      )}

      {targetType && (
        <DatabaseEntitySelectionModal
          open={isTargetEntityModalOpen}
          onOpenChange={setIsTargetEntityModalOpen}
          entityType={targetType}
          onSelect={entityId => {
            setTargetId(entityId);
          }}
        />
      )}

      {/* Graph Visualization Modal */}
      {result?.granted && result.path && (
        <PermissionGraphVisualizer
          path={result.path}
          open={isGraphOpen}
          onOpenChange={setIsGraphOpen}
        />
      )}
    </div>
  );
}
