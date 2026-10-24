import LogsViewer from '@/components/logs-viewer/LogsViewer';
import { knownModuleNames } from '@/lib/models/logs-viewer/constants';
import { LogsData, LogsQueryParams } from '@/lib/models/logs-viewer';
import {
  getLogsLevels,
  getLogsQueryRange,
  getModules,
} from '@/lib/loki/requests';
import { getLokiAvailabilityCore } from '@/lib/observability/lokiAvailabilityCore';
import { EmptyState } from '@/components/ui/empty-state';

export default async function LogsViewerPage() {
  const lokiAvailability = await getLokiAvailabilityCore();
  let levelsData: string[] = [];
  let logsData: LogsData[] = [];
  let modules: string[] = [...knownModuleNames];

  if (lokiAvailability.state === 'not_configured') {
    return (
      <div className="flex h-full min-h-0 items-center justify-center px-4">
        <EmptyState
          title="Logs viewer is not available"
          description="Set LOKI_URL for this environment to enable log viewing."
        />
      </div>
    );
  }

  if (lokiAvailability.state === 'unreachable') {
    return (
      <div className="flex h-full min-h-0 items-center justify-center px-4">
        <EmptyState
          title="Cannot reach Loki"
          description="The UI could not connect to Loki at the configured URL. Check that Loki is running and that LOKI_URL is correct."
        />
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

  const refreshLogs = async (data: LogsQueryParams) => {
    'use server';
    return await getLogsQueryRange({
      ...data,
      modules: data.modules.length > 0 ? data.modules : modules,
      limit: data.limit ? data.limit : '100',
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
