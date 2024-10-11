import { LogsDrawer } from '@/components/logs-viewer/LogsDrawer';
import { getModules } from '@/lib/api/modules';
export default async function LogsDrawerPage() {
  const modules = await getModules();
  return <LogsDrawer modules={modules} />;
}
