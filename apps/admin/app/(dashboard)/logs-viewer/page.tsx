import LogsViewer from '@/components/logs-viewer/LogsViewer';
import { getLogsLevels, getLogsQueryRange } from '@/lib/api/logs-viewer';
import { getModules } from '@/lib/api/modules';

export default async function LogsViewerPage() {
  const levels = await getLogsLevels();
  const modules = await getModules();
  const logs = await getLogsQueryRange('authentication');

  return <LogsViewer modules={modules} levels={levels} logs={logs} />;
}
