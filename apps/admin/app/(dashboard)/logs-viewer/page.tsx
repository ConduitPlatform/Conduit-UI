import LogsViewer from '@/components/logs-viewer/LogsViewer';
import { getLogsLevels } from '@/lib/api/logs-viewer';
import { getModules } from '@/lib/api/modules';

export default async function LogsViewerPage() {
  const levels = await getLogsLevels();
  const modules = await getModules();

  return <LogsViewer modules={modules} levels={levels} />;
}
