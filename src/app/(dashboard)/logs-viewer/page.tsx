import LogsViewer from '@/components/logs-viewer/LogsViewer';
import { knownModuleNames } from '@/lib/models/logs-viewer/constants';
import { LogsData } from '@/lib/models/logs-viewer';
import {
  getLogsLevels,
  getLogsQueryRange,
  getModules,
} from '@/lib/loki/requests';
import { getLokiAvailabilityCore } from '@/lib/observability/lokiAvailabilityCore';

export default async function LogsViewerPage() {
  const lokiAvailability = await getLokiAvailabilityCore();
  let levelsData: string[] = [];
  let logsData: LogsData[] = [];
  let modules: string[] = [...knownModuleNames];

  if (lokiAvailability.state === 'not_configured') {
    return (
      <div className="flex flex-col items-center justify-center mt-10 max-w-lg mx-auto text-center px-4">
        <p className="text-sm font-medium">Logs viewer is not available</p>
        <p className="text-xs text-muted-foreground mt-2">
          Set <code className="rounded bg-muted px-1 py-0.5">LOKI_URL</code> for
          this environment to enable log viewing.
        </p>
      </div>
    );
  }

  if (lokiAvailability.state === 'unreachable') {
    return (
      <div className="flex flex-col items-center justify-center mt-10 max-w-lg mx-auto text-center px-4">
        <p className="text-sm font-medium">Cannot reach Loki</p>
        <p className="text-xs text-muted-foreground mt-2">
          The UI could not connect to Loki at the configured URL. Check that
          Loki is running and that{' '}
          <code className="rounded bg-muted px-1 py-0.5">LOKI_URL</code> is
          correct.
        </p>
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
