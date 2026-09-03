'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  Handle,
  MarkerType,
  type Node,
  Panel,
  Position,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Edit,
  ExternalLink,
  Eye,
  Info,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { ResourceDefinition } from '@/lib/models/authorization';
import { useChartColors } from '@/lib/hooks/useChartColors';
import { getReactFlowMarkerColor } from '@/lib/semantic-colors';

type PermissionCategory = 'read' | 'write' | 'delete' | 'other';

const mergeSemanticEdgeColors = (
  currentEdge: Edge,
  semanticEdge: Edge
): Edge => {
  let updatedEdge = currentEdge;

  if (semanticEdge.style?.stroke !== undefined) {
    updatedEdge = {
      ...updatedEdge,
      style: {
        ...currentEdge.style,
        stroke: semanticEdge.style.stroke,
      },
    };
  }

  if (semanticEdge.labelStyle?.fill !== undefined) {
    updatedEdge = {
      ...updatedEdge,
      labelStyle: {
        ...currentEdge.labelStyle,
        fill: semanticEdge.labelStyle.fill,
      },
    };
  }

  if (currentEdge.markerEnd && semanticEdge.markerEnd?.color !== undefined) {
    updatedEdge = {
      ...updatedEdge,
      markerEnd: {
        ...currentEdge.markerEnd,
        color: semanticEdge.markerEnd.color,
      },
    };
  }

  return updatedEdge;
};

// Custom node types
const ResourceNode = ({
  data,
}: {
  data: {
    label: string;
    isMain?: boolean;
    resourceId?: string;
    basePath?: string;
  };
}) => {
  const {
    label,
    isMain,
    resourceId,
    basePath = '/authorization/resources',
  } = data;

  return (
    <div
      className={`graph-node flex items-center justify-center border px-4 py-2 text-foreground shadow-md ${
        isMain
          ? 'rounded-lg border-2 border-graph-router bg-graph-router-muted text-lg font-bold text-graph-router-foreground min-w-[180px] min-h-[60px]'
          : 'rounded-md border-border-strong bg-surface-1 min-w-[140px] min-h-[50px]'
      }`}
    >
      <div className="flex items-center gap-1 text-center">
        {label}
        {resourceId && !isMain && (
          <Link
            href={`${basePath}/${resourceId}`}
            className="text-muted-foreground hover:text-primary ml-1"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      {isMain ? (
        <>
          <Handle
            type="target"
            position={Position.Left}
            className="bg-graph-router!"
          />
          <Handle
            type="source"
            position={Position.Right}
            className="bg-graph-router!"
          />
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Right}
          className="bg-graph-edge!"
        />
      )}
    </div>
  );
};

const RelationNode = ({ data }: { data: { relations: string[] } }) => {
  return (
    <div className="graph-node rounded-md border border-graph-middleware bg-graph-middleware-muted p-3 text-graph-middleware-foreground shadow-xs min-w-[150px]">
      <Handle
        type="target"
        position={Position.Left}
        className="bg-graph-middleware!"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="bg-graph-middleware!"
      />
      <div className="mb-2 text-center font-medium">Relations</div>
      <Separator className="my-2" />
      <div className="flex flex-wrap gap-1 justify-center">
        {data.relations.map(relation => (
          <Badge
            key={relation}
            variant="outline"
            className="border-graph-middleware bg-surface-1 text-graph-middleware-foreground"
          >
            {relation}
          </Badge>
        ))}
      </div>
    </div>
  );
};

// Helper function to categorize permissions
const categorizePermission = (permName: string): PermissionCategory => {
  permName = permName.toLowerCase();
  if (
    permName.includes('read') ||
    permName.includes('view') ||
    permName.includes('list') ||
    permName.includes('get')
  ) {
    return 'read';
  }
  if (
    permName.includes('write') ||
    permName.includes('edit') ||
    permName.includes('update') ||
    permName.includes('modify')
  ) {
    return 'write';
  }
  if (permName.includes('delete') || permName.includes('remove')) {
    return 'delete';
  }
  return 'other';
};

// Helper function to get icon for permission category
const getPermissionIcon = (category: PermissionCategory) => {
  switch (category) {
    case 'read':
      return <Eye className="h-4 w-4 text-callout-info-foreground" />;
    case 'write':
      return <Edit className="h-4 w-4 text-callout-success-foreground" />;
    case 'delete':
      return <Trash2 className="h-4 w-4 text-callout-danger-foreground" />;
    case 'other':
      return (
        <ShieldCheck className="h-4 w-4 text-graph-middleware-foreground" />
      );
    default: {
      const exhaustive: never = category;
      return exhaustive;
    }
  }
};

// Helper function to get color for permission category
const getPermissionColor = (category: PermissionCategory) => {
  switch (category) {
    case 'read':
      return 'bg-callout-info-muted border-callout-info text-callout-info-foreground';
    case 'write':
      return 'bg-callout-success-muted border-callout-success text-callout-success-foreground';
    case 'delete':
      return 'bg-callout-danger-muted border-callout-danger text-callout-danger-foreground';
    case 'other':
      return 'bg-graph-middleware-muted border-graph-middleware text-graph-middleware-foreground';
    default: {
      const exhaustive: never = category;
      return exhaustive;
    }
  }
};

const getPermissionHandleColor = (category: PermissionCategory) => {
  switch (category) {
    case 'read':
      return 'bg-callout-info!';
    case 'write':
      return 'bg-callout-success!';
    case 'delete':
      return 'bg-callout-danger!';
    case 'other':
      return 'bg-graph-middleware!';
    default: {
      const exhaustive: never = category;
      return exhaustive;
    }
  }
};

// Individual permission node
const SinglePermissionNode = ({
  data,
}: {
  data: { name: string; relations: string[]; category: PermissionCategory };
}) => {
  const { name, relations, category } = data;
  const colorClass = getPermissionColor(category);
  const icon = getPermissionIcon(category);

  return (
    <div className={`graph-node rounded-md border p-2 shadow-xs ${colorClass}`}>
      <Handle
        type="target"
        position={Position.Left}
        className={getPermissionHandleColor(category)}
      />
      <div className="flex items-center gap-1 font-medium text-sm mb-1">
        {icon}
        <span>{name}</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        {relations.map(relation => (
          <Badge
            key={relation}
            variant="outline"
            className="bg-surface-1 text-xs text-foreground"
          >
            {relation}
          </Badge>
        ))}
      </div>
    </div>
  );
};

// Node types mapping
const nodeTypes = {
  resource: ResourceNode,
  relation: RelationNode,
  permission: SinglePermissionNode,
};

interface ResourceVisualizerProps {
  resource: ResourceDefinition;
  resourceMap?: Record<string, { _id: string; name: string }>;
  basePath?: string;
}

export default function ResourceVisualizer({
  resource,
  resourceMap = {},
  basePath = '/authorization/resources',
}: Readonly<ResourceVisualizerProps>) {
  const colors = useChartColors();
  const [activeTab, setActiveTab] = useState<'graph' | 'details'>('graph');

  // Create nodes and edges from the resource data
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const chart5MarkerColor = getReactFlowMarkerColor(colors.chart5);

    // Group relations by target resource
    const relationsByResource: Record<string, string[]> = {};

    if (resource.relations) {
      Object.entries(resource.relations).forEach(
        ([relationName, resources]) => {
          if (resources.includes('*')) {
            // Special case for wildcard
            relationsByResource['*'] = relationsByResource['*'] || [];
            relationsByResource['*'].push(relationName);
          } else if (Array.isArray(resources)) {
            resources.forEach(targetResource => {
              relationsByResource[targetResource] =
                relationsByResource[targetResource] || [];
              relationsByResource[targetResource].push(relationName);
            });
          }
        }
      );
    }

    // Calculate total number of paths to position the main resource node
    const totalPaths = Object.keys(relationsByResource).length;

    // Calculate the vertical center based on the number of paths
    const verticalCenter = (totalPaths * 250) / 2;

    // Add main resource node in the middle
    nodes.push({
      id: 'main',
      type: 'resource',
      data: { label: resource.name, isMain: true },
      position: { x: 550, y: verticalCenter },
    });

    // Create authorization paths
    const ySpacing = 250; // Increased spacing between paths
    const permissionSpacing = 100; // Increased spacing between permissions
    const permissionXOffset = 800; // X position for permissions

    Object.entries(relationsByResource).forEach(
      ([targetResource, relations], index) => {
        const y = index * ySpacing + 100; // Start from 100px and space evenly

        // Find resource ID if available
        const resourceId =
          targetResource !== '*' ? resourceMap[targetResource]?._id : undefined;

        // Create target resource node (on the left)
        const resourceNodeId =
          targetResource === '*' ? 'wildcard' : `resource-${targetResource}`;
        nodes.push({
          id: resourceNodeId,
          type: 'resource',
          data: {
            label: targetResource === '*' ? 'Any Resource (*)' : targetResource,
            resourceId,
            basePath,
          },
          position: { x: 50, y },
        });

        // Create relation node (in the middle)
        const relationNodeId = `relation-${targetResource}`;
        nodes.push({
          id: relationNodeId,
          type: 'relation',
          data: { relations },
          position: { x: 300, y },
        });

        // Connect target resource to relation
        edges.push({
          id: `e-${resourceNodeId}-${relationNodeId}`,
          source: resourceNodeId,
          target: relationNodeId,
          style: { stroke: colors.chart5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            ...(chart5MarkerColor && { color: chart5MarkerColor }),
          },
        });

        // Connect relation to main resource
        edges.push({
          id: `e-${relationNodeId}-main`,
          source: relationNodeId,
          target: 'main',
          style: { stroke: colors.chart5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            ...(chart5MarkerColor && { color: chart5MarkerColor }),
          },
        });

        // Filter permissions that use these relations
        const relevantPermissions: Record<string, string[]> = {};

        if (resource.permissions) {
          Object.entries(resource.permissions).forEach(
            ([permName, permRelations]) => {
              const matchingRelations = permRelations.filter(rel => {
                // Check if this permission uses any of the relations in this path
                return relations.some(
                  pathRel => rel === pathRel || rel.startsWith(`${pathRel}->`)
                );
              });

              if (matchingRelations.length > 0) {
                relevantPermissions[permName] = matchingRelations;
              }
            }
          );
        }

        // Group permissions by category
        const permissionsByCategory: Record<
          string,
          { name: string; relations: string[] }[]
        > = {
          read: [],
          write: [],
          delete: [],
          other: [],
        };

        Object.entries(relevantPermissions).forEach(([permName, relations]) => {
          const category = categorizePermission(permName);
          permissionsByCategory[category].push({
            name: permName,
            relations,
          });
        });

        // Add individual permission nodes
        let permissionY =
          y -
          (Object.values(relevantPermissions).length * permissionSpacing) / 2;

        // Process permissions by category order
        const categoryOrder: PermissionCategory[] = [
          'read',
          'write',
          'delete',
          'other',
        ];
        categoryOrder.forEach(category => {
          permissionsByCategory[category].forEach(permission => {
            const edgeColor =
              category === 'read'
                ? colors.chart1
                : category === 'write'
                  ? colors.chart2
                  : category === 'delete'
                    ? colors.chart3
                    : colors.chart5;
            const markerColor = getReactFlowMarkerColor(edgeColor);
            const permissionNodeId = `permission-${targetResource}-${permission.name}`;
            nodes.push({
              id: permissionNodeId,
              type: 'permission',
              data: {
                name: permission.name,
                relations: permission.relations,
                category,
              },
              position: { x: permissionXOffset, y: permissionY },
            });

            // Connect main resource to permission
            edges.push({
              id: `e-main-${permissionNodeId}`,
              source: 'main',
              target: permissionNodeId,
              style: { stroke: edgeColor },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                ...(markerColor && { color: markerColor }),
              },
            });

            permissionY += permissionSpacing;
          });
        });
      }
    );

    return { initialNodes: nodes, initialEdges: edges };
  }, [resource, resourceMap, basePath, colors]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const semanticEdgesById = new Map(
      initialEdges.map(edge => [edge.id, edge] as const)
    );

    setEdges(currentEdges =>
      currentEdges.map(currentEdge => {
        const semanticEdge = semanticEdgesById.get(currentEdge.id);
        return semanticEdge
          ? mergeSemanticEdgeColors(currentEdge, semanticEdge)
          : currentEdge;
      })
    );
  }, [initialEdges, setEdges]);

  // Render a detailed view of relations and permissions
  const renderDetailsView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Relations</CardTitle>
            <CardDescription>
              Resources that can have relations with {resource.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {!resource.relations ||
              Object.keys(resource.relations).length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No relations defined
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(resource.relations).map(
                    ([relationName, relatedResources]) => (
                      <div key={relationName} className="border rounded-md p-3">
                        <div className="font-medium mb-2">{relationName}</div>
                        <div className="flex flex-wrap gap-2">
                          {relatedResources.length === 1 &&
                          relatedResources.includes('*') ? (
                            <Badge variant="outline">* (Any resource)</Badge>
                          ) : Array.isArray(relatedResources) ? (
                            relatedResources.map(resourceName => {
                              const resourceId = resourceMap[resourceName]?._id;
                              return (
                                <Badge
                                  key={resourceName}
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  {resourceName}
                                  {resourceId && (
                                    <Link
                                      href={`${basePath}/${resourceId}`}
                                      className="text-muted-foreground hover:text-primary ml-1"
                                      onClick={e => e.stopPropagation()}
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </Link>
                                  )}
                                </Badge>
                              );
                            })
                          ) : (
                            <Badge variant="secondary">
                              {relatedResources}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Permissions</CardTitle>
            <CardDescription>
              Permissions defined for {resource.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {!resource.permissions ||
              Object.keys(resource.permissions).length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No permissions defined
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(resource.permissions).map(
                    ([permissionName, relations]) => {
                      const category = categorizePermission(permissionName);
                      const colorClass = getPermissionColor(category);
                      const icon = getPermissionIcon(category);

                      return (
                        <div
                          key={permissionName}
                          className={`border rounded-md p-3 ${colorClass}`}
                        >
                          <div className="font-medium mb-2 flex items-center gap-1">
                            {icon}
                            {permissionName}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {relations.map(relation => (
                              <Badge
                                key={relation}
                                variant="outline"
                                className="bg-surface-1 text-foreground"
                              >
                                {relation}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Legend for permission categories
  const renderLegend = () => (
    <div className="rounded border bg-graph-panel p-2 text-sm text-foreground shadow-xs">
      <div className="mb-1 font-medium">Permission Types:</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4 text-callout-info-foreground" />
          <span>Read/View</span>
        </div>
        <div className="flex items-center gap-1">
          <Edit className="h-4 w-4 text-callout-success-foreground" />
          <span>Write/Edit</span>
        </div>
        <div className="flex items-center gap-1">
          <Trash2 className="h-4 w-4 text-callout-danger-foreground" />
          <span>Delete</span>
        </div>
        <div className="flex items-center gap-1">
          <ShieldCheck className="h-4 w-4 text-graph-middleware-foreground" />
          <span>Other</span>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Visualization</CardTitle>
        <CardDescription>
          Visual representation of {resource.name} and its relations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={value => setActiveTab(value as 'graph' | 'details')}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="graph">Graph View</TabsTrigger>
            <TabsTrigger value="details">Details View</TabsTrigger>
          </TabsList>

          <TabsContent value="graph">
            <div className="h-[600px] w-full overflow-hidden rounded-md border bg-surface-2">
              <ReactFlow
                /*@ts-expect-error*/
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-right"
                className="semantic-react-flow"
                style={{ background: 'var(--color-surface-2)' }}
              >
                <Controls />
                <Background color={colors.chartGrid} />
                <Panel
                  position="top-left"
                  className="rounded border bg-graph-panel p-2 text-sm text-foreground-muted shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span>
                      Authorization paths: Target → Relations → Resource →
                      Permissions
                    </span>
                  </div>
                </Panel>
                <Panel position="top-right">{renderLegend()}</Panel>
              </ReactFlow>
            </div>
          </TabsContent>

          <TabsContent value="details">{renderDetailsView()}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
