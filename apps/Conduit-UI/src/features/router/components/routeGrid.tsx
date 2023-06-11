// EndpointFlow.tsx
import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  Position,
} from 'reactflow';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { asyncGetAvailableRoutes } from '../store/routerSlice';

type NodeType = 'ModulePath' | 'Middleware' | 'Route' | 'URL';

const nodeWidth = 250;

const createNode = (
  type: NodeType,
  id: string,
  position: { x: number; y: number },
  label?: string
): Node => ({
  id,
  type: 'default',
  position,
  style: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    borderColor:
      type === 'Middleware'
        ? '#0000ff'
        : type === 'Route'
        ? '#00ff00'
        : type === 'URL'
        ? '#ff0000'
        : type === 'ModulePath'
        ? '#000000'
        : '#000000',
  },
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
  data: { label: label || `${id}` },
});

const createEdge = (source: string, target: string): Edge => ({
  id: `edge-${source}-${target}`,
  source,
  target,
  animated: true,
});

const generateElements = (data: any) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const xPos = 100;
  let yPos = 50;

  for (const moduleName in data) {
    const moduleUrl = data[moduleName].moduleUrl;
    const modulePath = data[moduleName].middlewares[0];

    const middleYPos = yPos + 100 + Object.keys(data[moduleName].routes).length * 100;
    nodes.push(
      createNode('ModulePath', `/${moduleName}`, { x: xPos - 100, y: middleYPos }, modulePath)
    );

    let maxXPos = xPos;

    for (const routeName in data[moduleName].routes) {
      const route = data[moduleName].routes[routeName];
      const routePath = route.path.replace(`/${moduleName}`, '');
      const routeMiddlewares = route.middlewares;
      const routeId = `${moduleName}-${routeName}`;

      yPos += 100;
      nodes.push(createNode('Route', routeId, { x: xPos + nodeWidth, y: yPos }, routePath));
      edges.push(createEdge(`/${moduleName}`, routeId));

      edges.push(createEdge(route.handler, `${moduleName}-url`));

      let lastXPos = xPos + nodeWidth;
      if (routeMiddlewares.length > 0) {
        routeMiddlewares.forEach((middleware: string, index: number) => {
          lastXPos = lastXPos + 2 * index + nodeWidth;
          if (lastXPos > maxXPos) {
            maxXPos = lastXPos;
          }
          const middlewareId = `${routeId}-middleware-${index}`;
          const previousMiddlewareId = `${routeId}-middleware-${index - 1}`;
          nodes.push(
            createNode(
              'Middleware',
              middlewareId,
              {
                x: lastXPos,
                y: yPos,
              },
              middleware
            )
          );
          if (index === 0 && routeMiddlewares.length === 1) {
            edges.push(createEdge(routeId, middlewareId));
            edges.push(createEdge(middlewareId, route.handler));
          } else if (index === 0) {
            edges.push(createEdge(routeId, middlewareId));
          } else if (index === routeMiddlewares.length - 1) {
            edges.push(createEdge(previousMiddlewareId, middlewareId));
            edges.push(createEdge(middlewareId, route.handler));
          } else {
            edges.push(createEdge(previousMiddlewareId, middlewareId));
          }
        });
      } else {
        edges.push(createEdge(`${routeId}`, route.handler));
      }
      nodes.push(
        createNode(
          'URL',
          route.handler,
          { x: lastXPos + nodeWidth, y: yPos },
          `${route.handler} (grpc)`
        )
      );
      if (lastXPos + 3 * nodeWidth > maxXPos) {
        maxXPos = lastXPos + 3 * nodeWidth;
      }
      yPos += 100;
    }

    nodes.push(
      createNode(
        'URL',
        `${moduleName}-url`,
        { x: maxXPos + 3 * nodeWidth, y: middleYPos },
        `${moduleName} (${moduleUrl})`
      )
    );
  }

  return { nodes, edges };
};

const onLoad = (reactFlowInstance: any): void => {
  reactFlowInstance.fitView();
};

const EndpointFlow: React.FC = () => {
  const dispatch = useAppDispatch();
  const { availableRoutes } = useAppSelector((state) => state.routerSlice.data);
  useEffect(() => {
    dispatch(asyncGetAvailableRoutes());
  }, []);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  useEffect(() => {
    const { nodes, edges } = generateElements(availableRoutes);
    setNodes(nodes);
    setEdges(edges);
  }, [availableRoutes]);
  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onLoad={onLoad}
        snapToGrid
        snapGrid={[15, 15]}>
        <Background color="#888" gap={16} />

        <Controls />
        <MiniMap zoomable pannable />
      </ReactFlow>
    </div>
  );
};
export default EndpointFlow;
