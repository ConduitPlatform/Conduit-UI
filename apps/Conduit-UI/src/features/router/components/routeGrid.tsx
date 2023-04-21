// EndpointFlow.tsx
import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
  Node,
  Position,
} from 'reactflow';

const endpoints = {
  authentication: {
    moduleUrl: '0.0.0.0:55154',
    routes: {
      PostLocalNew: {
        action: 'POST',
        path: '/authentication/local/new',
        description: 'Creates a new user using email/password.',
        middlewares: [],
      },
      PostLocal: {
        action: 'POST',
        path: '/authentication/local',
        description:
          'Login endpoint that can be used to authenticate.\n         Tokens are returned according to configuration.',
        middlewares: [],
      },
      PostLocalChangePassword: {
        action: 'POST',
        path: '/authentication/local/change-password',
        description:
          "Changes the user's password but requires the old password first.\n            " +
          '     If 2FA is enabled then a message will be returned asking for token input.',
        middlewares: ['authMiddleware'],
      },
      PostLocalChangeEmail: {
        action: 'POST',
        path: '/authentication/local/change-email',
        description: "Changes the user's email (requires sudo access).",
        middlewares: ['authMiddleware'],
      },
      GetHookVerifyEmailVerificationtoken: {
        action: 'GET',
        path: '/hook/authentication/verify-email/:verificationToken',
        description:
          'A webhook used to verify user email. This bypasses the need for client id/secret.',
        middlewares: [],
      },
      GetHookVerifyChangeEmailVerificationtoken: {
        action: 'GET',
        path: '/hook/authentication/verify-change-email/:verificationToken',
        description:
          'A webhook used to verify an email address change. This bypasses the need for client id/secret.',
        middlewares: [],
      },
      PostService: {
        action: 'POST',
        path: '/authentication/service',
        description: 'Login with service account.',
        middlewares: [],
      },
      GetUser: {
        action: 'GET',
        path: '/authentication/user',
        description: 'Returns the authenticated user.',
        middlewares: ['authMiddleware'],
      },
      DeleteUser: {
        action: 'DELETE',
        path: '/authentication/user',
        description: 'Deletes the authenticated user.',
        middlewares: ['authMiddleware'],
      },
      PostRenew: {
        action: 'POST',
        path: '/authentication/renew',
        description:
          "Renews the access and refresh tokens. Requires a valid refresh token provided in Authorization header/cookie. Format 'Bearer TOKEN'",
        middlewares: ['authMiddleware'],
      },
      PostLogout: {
        action: 'POST',
        path: '/authentication/logout',
        description: 'Logs out authenticated user.',
        middlewares: ['authMiddleware'],
      },
    },
    socketRoutes: {},
    proxyRoutes: {},
    middlewares: {
      authMiddleware: {
        path: '/authentication/',
      },
      captchaMiddleware: {
        path: '/authentication/',
      },
    },
  },
  chat: {
    moduleUrl: '0.0.0.0:55156',
    routes: {
      PostRooms: {
        action: 'POST',
        path: '/chat/rooms',
        description: 'Creates a new room.',
        middlewares: ['authMiddleware'],
      },
      PutRoomsRoomidAddusers: {
        action: 'PUT',
        path: '/chat/rooms/:roomId/addUsers',
        description: 'Adds users to a chat room.',
        middlewares: ['authMiddleware'],
      },
      PutLeaveRoomid: {
        action: 'PUT',
        path: '/chat/leave/:roomId',
        description: 'Removes current user from a chat room.',
        middlewares: ['authMiddleware'],
      },
      GetRoomsId: {
        action: 'GET',
        path: '/chat/rooms/:id',
        description: 'Returns a chat room.',
        middlewares: ['authMiddleware'],
      },
      GetRooms: {
        action: 'GET',
        path: '/chat/rooms',
        description: 'Returns queried chat rooms.',
        middlewares: ['authMiddleware'],
      },
      GetMessagesId: {
        action: 'GET',
        path: '/chat/messages/:id',
        description: 'Returns a message.',
        middlewares: ['authMiddleware'],
      },
      GetMessages: {
        action: 'GET',
        path: '/chat/messages',
        description: 'Returns queried messages and their total count.',
        middlewares: ['authMiddleware'],
      },
      DeleteMessagesMessageid: {
        action: 'DELETE',
        path: '/chat/messages/:messageId',
        description: 'Deletes a message.',
        middlewares: ['authMiddleware'],
      },
      PutMessagesMessageid: {
        action: 'PUT',
        path: '/chat/messages/:messageId',
        description: 'Updates content of a message.',
        middlewares: ['authMiddleware'],
      },
    },
    socketRoutes: {
      '/chat/': {
        connect: {
          middlewares: ['authMiddleware'],
        },
        message: {
          middlewares: ['authMiddleware'],
        },
        messagesRead: {
          middlewares: ['authMiddleware'],
        },
      },
    },
    proxyRoutes: {},
    middlewares: {},
  },
};
type NodeType = 'Module' | 'URL' | 'Route';

const nodeWidth = 250;

const createNode = (type: NodeType, id: string, position: { x: number; y: number }): Node => ({
  id,
  type,
  position,
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
  data: { label: `${id}` },
});

const createEdge = (source: string, target: string): any => ({
  id: `edge-${source}-${target}`,
  source,
  target,
  animated: true,
  arrowHeadType: 'arrowclosed',
});

const generateElements = (data: any): any => {
  const nodes: Node[] = [];
  const edges: any[] = [];
  const xPos = 100;
  let yPos = 50;

  for (const moduleName in data) {
    const moduleUrl = data[moduleName].moduleUrl;
    nodes.push(createNode('Module', '/' + moduleName, { x: xPos, y: yPos }));
    nodes.push(createNode('URL', moduleUrl, { x: xPos + nodeWidth, y: yPos }));
    edges.push(createEdge('/' + moduleName, moduleUrl));

    yPos += 100;

    for (const routeName in data[moduleName].routes) {
      const route = data[moduleName].routes[routeName];
      const routeId = `${route.path.replace('/' + moduleName, '')}`;
      nodes.push(createNode('Route', routeId, { x: xPos + 2 * nodeWidth, y: yPos }));
      edges.push(createEdge(moduleUrl, routeId));

      yPos += 100;
    }
  }

  return { nodes, edges };
};

const onLoad = (reactFlowInstance: any): void => {
  reactFlowInstance.fitView();
};

const EndpointFlow: React.FC = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  useEffect(() => {
    const { nodes, edges } = generateElements(endpoints);
    setNodes(nodes);
    setEdges(edges);
  }, []);

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        // onElementsRemove={(elementsToRemove) =>
        //   setElements((els) => els.filter((el) => !elementsToRemove.includes(el)))
        // }
        onLoad={onLoad}
        snapToGrid
        snapGrid={[15, 15]}>
        <Background color="#888" gap={16} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default EndpointFlow;
