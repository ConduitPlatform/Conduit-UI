'use server';

import { getApiClient } from '@/lib/api';
import { getCurrentEnvironment } from '@/lib/logic/EnvManager';
import { deriveAdminSocketUrl } from '@/lib/realtime/adminSocketUrl';

export type AdminRealtimeTicket = {
  token: string;
  expiresIn: number;
  socketUrl: string;
  namespace: string;
  path: string;
};

export async function issueAdminRealtimeTicket(): Promise<AdminRealtimeTicket> {
  const env = await getCurrentEnvironment();
  const { data } = await (
    await getApiClient()
  ).post<{ token: string; expiresIn: number }>('/realtime/ticket');

  return {
    token: data.token,
    expiresIn: data.expiresIn,
    socketUrl: deriveAdminSocketUrl(env.baseUrl, env.socketUrl),
    namespace: '/database/',
    path: '/realtime',
  };
}
