import { MOCK_ADMIN_HOST, MOCK_ADMIN_PORT } from './constants.ts';
import { startMockAdminServer } from './server.ts';

const port = Number(process.env.MOCK_ADMIN_PORT ?? MOCK_ADMIN_PORT);
await startMockAdminServer(MOCK_ADMIN_HOST, port);
