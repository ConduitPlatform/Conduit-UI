'use client';

import { useMemo, useState, useCallback, memo, useEffect } from 'react';
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
  ReactFlowProvider,
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
  Route,
  Server,
  Layers,
  BarChart3,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { RouterRoutesResponse } from '@/lib/models/Router';

// Memoized custom node components for better performance
const ModuleNode = memo(
  ({ data }: { data: { label: string; routes: any[] } }) => (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 min-w-[200px] shadow-md">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Server className="h-5 w-5 text-blue-600" />
          <h3 className="font-bold text-blue-900 text-lg">{data.label}</h3>
        </div>
        <p className="text-blue-700 text-sm font-medium">
          {data.routes.length} route{data.routes.length !== 1 ? 's' : ''}
        </p>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  )
);

ModuleNode.displayName = 'ModuleNode';

const RouteNode = memo(
  ({
    data,
  }: {
    data: {
      label: string;
      method: string;
      path: string;
      handler: string;
      middlewares: string[];
    };
  }) => {
    const getMethodColor = useCallback((method: string) => {
      switch (method.toUpperCase()) {
        case 'GET':
          return 'bg-green-100 text-green-800 border-green-300 font-semibold';
        case 'POST':
          return 'bg-blue-100 text-blue-800 border-blue-300 font-semibold';
        case 'PUT':
          return 'bg-yellow-100 text-yellow-800 border-yellow-300 font-semibold';
        case 'DELETE':
          return 'bg-red-100 text-red-800 border-red-300 font-semibold';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-300 font-semibold';
      }
    }, []);

    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 min-w-[180px] shadow-md">
        <Handle type="target" position={Position.Left} className="w-3 h-3" />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Route className="h-4 w-4 text-green-600" />
            <Badge className={getMethodColor(data.method)}>
              {data.method.toUpperCase()}
            </Badge>
          </div>
          <p className="font-mono text-sm font-semibold text-green-900 break-all">
            {data.path}
          </p>
          <p className="text-xs text-green-700 font-medium">
            Handler: {data.handler}
          </p>
          {data.middlewares && data.middlewares.length > 0 && (
            <p className="text-xs text-green-600">
              {data.middlewares.length} middleware
              {data.middlewares.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Handle type="source" position={Position.Right} className="w-3 h-3" />
      </div>
    );
  }
);

RouteNode.displayName = 'RouteNode';

const MiddlewareNode = memo(
  ({ data }: { data: { label: string; optional?: boolean } }) => (
    <div
      className={`border-2 rounded-lg p-3 min-w-[150px] shadow-md ${
        data.optional
          ? 'bg-purple-25 border-purple-300 border-dashed'
          : 'bg-purple-50 border-purple-200'
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-purple-600" />
        <div className="flex items-center gap-1">
          <p className="font-semibold text-purple-900 text-sm">{data.label}</p>
          {data.optional && (
            <span className="text-xs text-purple-600 font-medium">
              (optional)
            </span>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  )
);

MiddlewareNode.displayName = 'MiddlewareNode';

const nodeTypes = {
  module: ModuleNode,
  route: RouteNode,
  middleware: MiddlewareNode,
};

interface Props {
  data: RouterRoutesResponse;
}

// Memoized legend component
const Legend = memo(() => (
  <div className="bg-white p-3 rounded shadow-xs border text-sm space-y-2">
    <div className="font-semibold text-gray-900 mb-2">Legend</div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 bg-blue-50 border-2 border-blue-200 rounded"></div>
      <span className="text-gray-700 font-medium">Router/Module</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 bg-green-50 border-2 border-green-200 rounded"></div>
      <span className="text-gray-700 font-medium">Route</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 bg-purple-50 border-2 border-purple-200 rounded"></div>
      <span className="text-gray-700 font-medium">Middleware</span>
    </div>
    <div className="border-t pt-2 mt-2">
      <div className="text-xs font-semibold text-gray-700 mb-1">
        Connections:
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-0.5 bg-blue-500"></div>
        <span className="text-xs text-gray-600">Router → Middleware</span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-0.5 bg-blue-500 border-dashed"
          style={{ borderStyle: 'dashed' }}
        ></div>
        <span className="text-xs text-gray-600">
          Router → Route (no middleware)
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-0.5 bg-green-500"></div>
        <span className="text-xs text-gray-600">Route → Module</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-0.5 bg-purple-500 border-dashed"></div>
        <span className="text-xs text-gray-600">Middleware → Route</span>
      </div>
    </div>
  </div>
));

Legend.displayName = 'Legend';

// Memoized info panel component
const InfoPanel = memo(() => (
  <div className="bg-white p-3 rounded shadow-xs border text-sm">
    <div className="flex items-center gap-2">
      <Info className="h-4 w-4 text-blue-600" />
      <span className="text-gray-700 font-medium">
        Router flow: Router → Middleware → Route → Module
      </span>
    </div>
  </div>
));

InfoPanel.displayName = 'InfoPanel';

// Separate graph component for better performance
const RouterGraph = memo(
  ({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
  }: {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: any;
    onEdgesChange: any;
  }) => (
    <div className="w-full h-[800px] border rounded-md overflow-hidden bg-gray-50">
      <ReactFlow
        /*@ts-expect-error*/
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, includeHiddenNodes: false }}
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
        preventScrolling={true}
        deleteKeyCode={null}
        multiSelectionKeyCode={null}
        snapToGrid={false}
        snapGrid={[20, 20]}
        onlyRenderVisibleElements={true}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.1}
        maxZoom={2}
        nodesFocusable={false}
        edgesFocusable={false}
      >
        <Controls showInteractive={false} />
        <Background color="#e5e7eb" gap={20} />
        <Panel position="top-left">
          <InfoPanel />
        </Panel>
        <Panel position="top-right">
          <Legend />
        </Panel>
      </ReactFlow>
    </div>
  )
);

RouterGraph.displayName = 'RouterGraph';

export const RouterVisualization = ({ data }: Props) => {
  const [activeTab, setActiveTab] = useState<'graph' | 'list'>('graph');
  const [collapsedModules, setCollapsedModules] = useState<
    Record<string, boolean>
  >({});

  // Toggle module collapse state
  const toggleModule = useCallback((moduleName: string) => {
    setCollapsedModules(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName],
    }));
  }, []);

  // Create nodes and edges from the routes data
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Check if data exists
    if (!data) {
      return { initialNodes: nodes, initialEdges: edges };
    }

    // Handle the actual API response structure
    const modules = Object.keys(data);

    if (modules.length === 0) {
      return { initialNodes: nodes, initialEdges: edges };
    }

    // Collect all unique middlewares across all modules
    const allMiddlewares = new Set<string>();
    const moduleMiddlewares: Record<string, string[]> = {};
    const middlewareGroups: Record<
      string,
      { base: string; optional: boolean }
    > = {};

    modules.forEach(moduleName => {
      const moduleData = data[moduleName];
      if (!moduleData || !moduleData.routes) {
        return;
      }

      const routes = Object.values(moduleData.routes);
      const moduleMw = new Set<string>();

      routes.forEach(route => {
        if (route.middlewares && Array.isArray(route.middlewares)) {
          route.middlewares.forEach(middleware => {
            // Handle optional middlewares (ending with "?")
            const isOptional = middleware.endsWith('?');
            const baseMiddleware = isOptional
              ? middleware.slice(0, -1)
              : middleware;

            // Store the base middleware name
            allMiddlewares.add(baseMiddleware);
            moduleMw.add(baseMiddleware);

            // Track which middlewares are optional
            middlewareGroups[baseMiddleware] = {
              base: baseMiddleware,
              optional:
                isOptional ||
                middlewareGroups[baseMiddleware]?.optional ||
                false,
            };
          });
        }
      });

      moduleMiddlewares[moduleName] = Array.from(moduleMw);
    });

    // Calculate positions
    const routerX = 100;
    const routerY = 400;
    const middlewareSpacing = 250;
    const routeSpacing = 200;
    const moduleSpacing = 300;
    const horizontalSpacing = 500;

    // Add Router node (entry point)
    const routerNodeId = 'router';
    nodes.push({
      id: routerNodeId,
      type: 'module',
      data: { label: 'Router', routes: [] },
      position: { x: routerX, y: routerY },
      draggable: true,
    });

    // Add middleware nodes (shared across modules) - horizontal layout
    const middlewareNodes: Record<string, string> = {};
    const middlewaresArray = Array.from(allMiddlewares);

    middlewaresArray.forEach((middleware, index) => {
      const middlewareX = routerX + horizontalSpacing;
      const middlewareY =
        routerY +
        (index - (middlewaresArray.length - 1) / 2) * middlewareSpacing;

      const middlewareNodeId = `middleware-${middleware}`;
      middlewareNodes[middleware] = middlewareNodeId;

      nodes.push({
        id: middlewareNodeId,
        type: 'middleware',
        data: {
          label: middleware,
          optional: false, // Will be determined by the connections
        },
        position: { x: middlewareX, y: middlewareY },
        draggable: true,
      });

      // Connect router to middleware
      edges.push({
        id: `e-${routerNodeId}-${middlewareNodeId}`,
        source: routerNodeId,
        target: middlewareNodeId,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        animated: false,
      });
    });

    // Collect all routes first to calculate positions
    const allRoutes: Array<{
      moduleName: string;
      route: any;
      routeIndex: number;
      moduleIndex: number;
    }> = [];

    modules.forEach((moduleName, moduleIndex) => {
      const moduleData = data[moduleName];
      if (!moduleData || !moduleData.routes) {
        return;
      }

      const routes = Object.values(moduleData.routes);
      routes.forEach((route, routeIndex) => {
        allRoutes.push({ moduleName, route, routeIndex, moduleIndex });
      });
    });

    // Add route nodes first
    const routeNodes: Record<string, { nodeId: string; moduleName: string }> =
      {};

    allRoutes.forEach(
      ({ moduleName, route, routeIndex, moduleIndex }, globalRouteIndex) => {
        const routeX = routerX + horizontalSpacing * 2;
        const routeY =
          routerY +
          (globalRouteIndex - (allRoutes.length - 1) / 2) * routeSpacing;

        const routeNodeId = `route-${moduleName}-${routeIndex}`;
        routeNodes[routeNodeId] = { nodeId: routeNodeId, moduleName };

        nodes.push({
          id: routeNodeId,
          type: 'route',
          data: {
            label: route.path || 'Unknown Path',
            method: route.action || 'GET',
            path: route.path || 'Unknown Path',
            handler: route.handler || 'Unknown Handler',
            middlewares: route.middlewares || [],
          },
          position: { x: routeX, y: routeY },
          draggable: true,
        });

        // Connect middlewares to routes (if route uses middlewares)
        if (
          route.middlewares &&
          Array.isArray(route.middlewares) &&
          route.middlewares.length > 0
        ) {
          route.middlewares.forEach((middleware: string) => {
            // Handle optional middlewares (ending with "?")
            const isOptional = middleware.endsWith('?');
            const baseMiddleware = isOptional
              ? middleware.slice(0, -1)
              : middleware;

            const middlewareNodeId = middlewareNodes[baseMiddleware];
            if (middlewareNodeId) {
              edges.push({
                id: `e-${middlewareNodeId}-${routeNodeId}`,
                source: middlewareNodeId,
                target: routeNodeId,
                style: {
                  stroke: '#8b5cf6',
                  strokeWidth: 1.5,
                  strokeDasharray: isOptional ? '8,4' : '5,5',
                },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  width: 16,
                  height: 16,
                },
                animated: false,
              });
            }
          });
        } else {
          // Connect router directly to routes without middlewares
          edges.push({
            id: `e-${routerNodeId}-${routeNodeId}`,
            source: routerNodeId,
            target: routeNodeId,
            style: {
              stroke: '#3b82f6',
              strokeWidth: 1.5,
              strokeDasharray: '3,3',
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 16,
              height: 16,
            },
            animated: false,
          });
        }
      }
    );

    // Add module nodes after routes
    const moduleGroups: Record<string, string[]> = {};

    // Group routes by module
    Object.values(routeNodes).forEach(({ nodeId, moduleName }) => {
      if (!moduleGroups[moduleName]) {
        moduleGroups[moduleName] = [];
      }
      moduleGroups[moduleName].push(nodeId);
    });

    // Add module nodes and connect to their routes
    Object.entries(moduleGroups).forEach(
      ([moduleName, routeNodeIds], moduleIndex) => {
        const moduleX = routerX + horizontalSpacing * 3;

        // Calculate module Y position based on its routes
        const routePositions = routeNodeIds.map(routeNodeId => {
          const routeNode = nodes.find(n => n.id === routeNodeId);
          return routeNode?.position.y || 0;
        });
        const moduleY =
          routePositions.reduce((sum, y) => sum + y, 0) / routePositions.length;

        const moduleNodeId = `module-${moduleName}`;
        nodes.push({
          id: moduleNodeId,
          type: 'module',
          data: { label: moduleName, routes: [] },
          position: { x: moduleX, y: moduleY },
          draggable: true,
        });

        // Connect routes to module
        routeNodeIds.forEach(routeNodeId => {
          edges.push({
            id: `e-${routeNodeId}-${moduleNodeId}`,
            source: routeNodeId,
            target: moduleNodeId,
            style: { stroke: '#10b981', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
            },
            animated: false,
          });
        });
      }
    );

    return { initialNodes: nodes, initialEdges: edges };
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Memoized render functions
  const renderListView = useCallback(() => {
    // Check if data exists
    if (!data) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              No Route Data
            </h3>
            <p className="text-gray-600">
              Unable to load route information. Please check your connection and
              try again.
            </p>
          </div>
        </div>
      );
    }

    // Handle the actual API response structure
    const modules = Object.keys(data);

    if (modules.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              No Modules Found
            </h3>
            <p className="text-gray-600">
              No modules with routes were found in the response.
            </p>
          </div>
        </div>
      );
    }

    // Group routes by module with error handling
    const routesByModule: Record<string, any[]> = {};

    modules.forEach(moduleName => {
      const moduleData = data[moduleName];
      if (!moduleData || !moduleData.routes) {
        console.warn(
          `Router visualization: No routes found for module ${moduleName} in list view`
        );
        return;
      }

      const routes = Object.values(moduleData.routes);
      if (routes.length > 0) {
        routesByModule[moduleName] = routes;
      }
    });

    return (
      <div className="space-y-6">
        <div className="grid gap-6">
          {Object.entries(routesByModule).map(([moduleName, routes]) => {
            const isCollapsed = collapsedModules[moduleName];

            return (
              <Card key={moduleName} className="border-2">
                <CardHeader
                  className="bg-blue-50 border-b-2 border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => toggleModule(moduleName)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isCollapsed ? (
                        <ChevronRight className="h-5 w-5 text-blue-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-blue-600" />
                      )}
                      <CardTitle className="flex items-center gap-2 text-blue-900">
                        <Server className="h-5 w-5" />
                        {moduleName}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-blue-700 font-medium">
                      {routes.length} route{routes.length !== 1 ? 's' : ''}{' '}
                      available
                    </CardDescription>
                  </div>
                </CardHeader>
                {!isCollapsed && (
                  <CardContent className="p-0">
                    <ScrollArea className="h-[400px]">
                      <div className="p-4 space-y-4">
                        {routes.map((route, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-4 bg-gray-50"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Badge
                                  className={
                                    route.action.toUpperCase() === 'GET'
                                      ? 'bg-green-100 text-green-800 border-green-300 font-semibold'
                                      : route.action.toUpperCase() === 'POST'
                                        ? 'bg-blue-100 text-blue-800 border-blue-300 font-semibold'
                                        : route.action.toUpperCase() === 'PUT'
                                          ? 'bg-yellow-100 text-yellow-800 border-yellow-300 font-semibold'
                                          : route.action.toUpperCase() ===
                                              'DELETE'
                                            ? 'bg-red-100 text-red-800 border-red-300 font-semibold'
                                            : 'bg-gray-100 text-gray-800 border-gray-300 font-semibold'
                                  }
                                >
                                  {route.action.toUpperCase()}
                                </Badge>
                                <span className="font-mono text-sm font-semibold text-gray-900">
                                  {route.path}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Route className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600 font-medium">
                                  Route
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-700">
                                  Handler:
                                </span>
                                <span className="font-mono text-sm text-gray-900">
                                  {route.handler}
                                </span>
                              </div>

                              {route.description && (
                                <div className="flex items-start gap-2">
                                  <span className="text-sm font-semibold text-gray-700">
                                    Description:
                                  </span>
                                  <span className="text-sm text-gray-800">
                                    {route.description}
                                  </span>
                                </div>
                              )}

                              {route.middlewares &&
                                route.middlewares.length > 0 && (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Layers className="h-4 w-4 text-purple-600" />
                                      <span className="text-sm font-semibold text-gray-700">
                                        Middlewares:
                                      </span>
                                    </div>
                                    <div className="ml-6 space-y-1">
                                      {route.middlewares.map(
                                        (
                                          middleware: string,
                                          mwIndex: number
                                        ) => {
                                          const isOptional =
                                            middleware.endsWith('?');
                                          const displayName = isOptional
                                            ? middleware.slice(0, -1)
                                            : middleware;

                                          return (
                                            <div
                                              key={mwIndex}
                                              className="flex items-center gap-2"
                                            >
                                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                              <span className="text-sm text-gray-800 font-medium">
                                                {displayName}
                                                {isOptional && (
                                                  <span className="text-xs text-gray-500 ml-1">
                                                    {' '}
                                                    (optional)
                                                  </span>
                                                )}
                                              </span>
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    );
  }, [data, collapsedModules, toggleModule]);

  // Check if we have valid data
  if (!data || Object.keys(data).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Router Visualization</CardTitle>
          <CardDescription>
            Visual representation of routes and their relationships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                No Routes Available
              </h3>
              <p className="text-gray-600">
                {!data
                  ? 'Unable to load route information. Please check your connection and try again.'
                  : 'No routes have been configured yet.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Router Visualization</CardTitle>
        <CardDescription>
          Visual representation of routes and their relationships
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={value => setActiveTab(value as 'graph' | 'list')}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="graph">Graph View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="graph">
            <ReactFlowProvider>
              <RouterGraph
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
              />
            </ReactFlowProvider>
          </TabsContent>

          <TabsContent value="list">{renderListView()}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
