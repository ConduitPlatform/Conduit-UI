const DATABASE_SOCKET_NAMESPACE = '/database/';
export const DATABASE_SOCKET_PATH = '/realtime';
export const DATABASE_SOCKET_LISTEN_EVENTS = [
  'change',
  'connected',
  'conduit_error',
] as const;

type SubscribePayload = {
  schema: string;
  documentId?: string;
};

export function socketEndpoint(socketUrl: string): string {
  return `${socketUrl.replace(/\/+$/, '')}${DATABASE_SOCKET_NAMESPACE}`;
}

export function subscribePayload(
  schemaName: string,
  documentScoped: boolean
): SubscribePayload {
  if (documentScoped) {
    return { schema: schemaName, documentId: '<documentId>' };
  }
  return { schema: schemaName };
}

export function buildClientJavascriptSnippet(options: {
  socketUrl: string;
  schemaName: string;
  documentScoped: boolean;
}): string {
  const url = socketEndpoint(options.socketUrl);
  const payload = subscribePayload(options.schemaName, options.documentScoped);
  return `import { io } from 'socket.io-client';

const socket = io(${JSON.stringify(url)}, {
  path: ${JSON.stringify(DATABASE_SOCKET_PATH)},
  auth: { token: accessToken },
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  socket.emit('subscribe', ${JSON.stringify(payload)});
});

socket.on('change', (event) => {
  // { version, operation, schema, documentId, occurredAt, resumeToken }
  console.log(event);
});

socket.on('conduit_error', (error) => {
  console.error(error);
});
`;
}

export function buildAdminJavascriptSnippet(options: {
  socketUrl: string;
  schemaName: string;
}): string {
  const url = socketEndpoint(options.socketUrl);
  const payload = subscribePayload(options.schemaName, false);
  return `import { io } from 'socket.io-client';

const socket = io(${JSON.stringify(url)}, {
  path: ${JSON.stringify(DATABASE_SOCKET_PATH)},
  auth: { token: adminToken },
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  socket.emit('subscribe', ${JSON.stringify(payload)});
});

socket.on('change', (event) => {
  console.log(event);
});

socket.on('conduit_error', (error) => {
  console.error(error);
});
`;
}

type PostmanConnection = {
  serverUrl: string;
  path: string;
  clientVersion: 'v4';
  headers: { key: string; value: string }[];
  listenFor: string[];
  subscribeEvent: 'subscribe';
  subscribeBody: string;
};

export function buildPostmanConnection(options: {
  adminSocketUrl: string;
  schemaName: string;
}): PostmanConnection {
  return {
    serverUrl: socketEndpoint(options.adminSocketUrl),
    path: DATABASE_SOCKET_PATH,
    clientVersion: 'v4',
    headers: [
      { key: 'masterkey', value: '{{masterKey}}' },
      { key: 'Authorization', value: 'Bearer {{adminToken}}' },
    ],
    listenFor: [...DATABASE_SOCKET_LISTEN_EVENTS],
    subscribeEvent: 'subscribe',
    subscribeBody: JSON.stringify(
      subscribePayload(options.schemaName, false),
      null,
      2
    ),
  };
}
