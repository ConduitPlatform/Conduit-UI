import { LogsDrawer } from '@/components/logs-viewer/LogsDrawer';
import { getModules } from '@/lib/api/modules';
import { getLogsLevels, getLogsQueryRange } from '@/lib/api/logs-viewer';
import SidebarList from '@/components/navigation/sidebarList';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const modules = await getModules();
  const levels = await getLogsLevels();
  const logs = await getLogsQueryRange('core');

  return (
    <div className={'flex'}>
      <SidebarList />
      <div className="relative flex-grow h-screen overflow-auto main-scrollbar">
        {children}
      </div>
      <LogsDrawer modules={modules} logs={logs} levels={levels} />
    </div>
  );
}
