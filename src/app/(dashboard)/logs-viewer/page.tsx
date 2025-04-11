import LogsViewer from '@/components/logs-viewer/LogsViewer';
import { knownModuleNames } from '@/lib/models/logs-viewer/constants';
import { LogsData } from '@/lib/models/logs-viewer';
import {
  getLogsLevels,
  getLogsQueryRange,
  getModules,
} from '@/lib/loki/requests';
import { isLokiEnabled } from '@/lib/logic/EnvManager';

export default async function LogsViewerPage() {
  let isAvailable = await isLokiEnabled();
  let levelsData: string[] = [];
  let logsData: LogsData[] = [];
  let modules: string[] = [...knownModuleNames];
  if (!isAvailable) {
    return (
      <div className="flex justify-center mt-10">
        Logs Viewer is not available
      </div>
    );
  }
  try {
    levelsData = await getLogsLevels();
    const fetchedModules = await getModules();
    if (fetchedModules.length > 0) {
      modules = knownModuleNames.concat(
        fetchedModules.filter(module => !knownModuleNames.includes(module))
      );
    }
    logsData = await getLogsQueryRange({
      modules,
      limit: '100',
    });
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
      modules: data.modules ? data.modules : modules,
      limit: data.limit ? data.limit : '100',
    })
      .then(res => res)
      .catch(e => {
        console.error('Failed to fetch logs levels: ', e);
        return [];
      });
  };

  return (
    <LogsViewer
      levelsData={levelsData}
      logsData={logsData}
      modules={modules}
      refreshLogs={refreshLogs}
    />
  );
}
