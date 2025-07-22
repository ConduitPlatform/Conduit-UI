import { getSecurityClients } from '@/lib/api/router';
import { SecurityClients } from '@/components/router/security';

export default async function RouterSecurityPage() {
  const data = await getSecurityClients();
  return <SecurityClients data={data} />;
}
