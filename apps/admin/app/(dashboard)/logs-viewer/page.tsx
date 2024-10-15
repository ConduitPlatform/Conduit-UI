import LogsViewer from '@/components/logs-viewer/LogsViewer';
import { getModules } from '@/lib/api/modules';

export default async function LogsViewerPage() {
  const modules = await getModules();
  return <LogsViewer modules={modules} />;
}
