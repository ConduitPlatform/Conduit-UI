export function buildEventRelayClientSnippet(socketEvent: string): string {
  const eventHandler = socketEvent.trim() || 'your-event';
  return `const socket = io(\`\${SOCKET_URL}/events/\`, {
  path: '/realtime',
  auth: { token: accessToken },
});
socket.on('connect', () => {
  socket.emit('subscribe', relayId, resourceId);
});
socket.on('${eventHandler}', payload => {});`;
}

export const EVENT_RELAY_DOCS_SNIPPET = buildEventRelayClientSnippet(
  'order-updated'
);
