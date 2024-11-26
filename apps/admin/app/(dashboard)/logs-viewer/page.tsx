import LogsViewer from '@/components/logs-viewer/LogsViewer';
import { getLogsLevels, getLogsQueryRange } from '@/lib/api/logs-viewer';
import { knownModuleNames } from '@/lib/models/logs-viewer/constants';
import { LogsData } from '@/lib/models/logs-viewer';

export default async function LogsViewerPage() {
  let isAvailable = false;
  let levelsData: string[] = [];
  let logsData: LogsData[] = [];

  try {
    levelsData = await getLogsLevels();
    logsData = await getLogsQueryRange({
      modules: knownModuleNames,
      limit: '100',
    });
    isAvailable = true;
  } catch (e) {
    console.error('Failed to fetch logs levels: ', e);
  }

  const refreshLogs = async (data: {
    modules: string[];
    levels: string[];
    startDate: number | undefined;
    endDate: number | undefined;
    limit: string | undefined;
  }) => {
    'use server';
    return await getLogsQueryRange({
      ...data,
      modules: data.modules ? data.modules : knownModuleNames,
      limit: data.limit ? data.limit : '100',
    })
      .then(res => res)
      .catch(e => {
        console.error('Failed to fetch logs levels: ', e);
        return [];
      });
  };

  if (!isAvailable) {
    return (
      <div className="flex justify-center mt-10">
        Logs Viewer is not available
      </div>
    );
  }

  return (
    <LogsViewer
      levelsData={levelsData}
      logsData={logsData}
      refreshLogs={refreshLogs}
    />
  );
}
