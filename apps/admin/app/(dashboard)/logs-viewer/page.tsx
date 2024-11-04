import LogsViewer from '@/components/logs-viewer/LogsViewer';
import { getLogsLevels, getLogsQueryRange } from '@/lib/api/logs-viewer';
import { knownModuleNames } from '@/lib/models/logs-viewer/constants';

export default async function LogsViewerPage() {
  const levelsData = await getLogsLevels();

  const logsData = await getLogsQueryRange({
    modules: knownModuleNames,
    limit: '100',
  });

  const refreshLogs = async (data: {
    modules: string[];
    levels: string[];
    startDate: number | undefined;
    endDate: number | undefined;
    limit: string | undefined;
  }) => {
    'use server';
    const logs = await getLogsQueryRange({
      ...data,
      modules: data.modules ? data.modules : knownModuleNames,
      limit: data.limit ? data.limit : '100',
    });
    return logs;
  };

  return (
    <LogsViewer
      levelsData={levelsData}
      logsData={logsData}
      refreshLogs={refreshLogs}
    />
  );
}
