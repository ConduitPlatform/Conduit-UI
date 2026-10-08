import { createServer, type Server } from 'node:http';
import { handleMockRequest } from './handlers.ts';

export function startMockAdminServer(
  host: string,
  port: number
): Promise<Server> {
  const server = createServer((request, response) => {
    void handleMockRequest(request, response).catch(error => {
      const message = error instanceof Error ? error.message : 'Mock error';
      if (!response.headersSent) {
        response.writeHead(500, { 'content-type': 'application/json' });
      }
      response.end(JSON.stringify({ status: 500, message }));
    });
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => resolve(server));
  });
}
