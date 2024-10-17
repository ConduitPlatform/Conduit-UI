import { LogsDrawer } from '@/components/logs-viewer/LogsDrawer';
import { getLogsLevels, getLogsQueryRange } from '@/lib/api/logs-viewer';
import { getModules } from '@/lib/api/modules';

export default async function LogsDrawerPage() {
  const modules = await getModules();
  const levels = await getLogsLevels();
  const logs = await getLogsQueryRange('core');

  return <LogsDrawer modules={modules} levels={levels} logs={logs} />;
}
