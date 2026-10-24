'use client';

import { LogsData, RefreshLogsFn } from '@/lib/models/logs-viewer';
import { LogsWorkspace } from './LogsWorkspace';
import { useState } from 'react';

type LogsViewerProps = {
  levelsData: string[];
  logsData: LogsData[];
  modules: string[];
  refreshLogs: RefreshLogsFn;
};

export default function LogsViewer({
  levelsData,
  logsData,
  modules,
  refreshLogs,
}: Readonly<LogsViewerProps>) {
  const [logs, setLogs] = useState(logsData);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-3 border-b border-border bg-surface-1 px-4 py-3">
        <h1 className="text-xl font-light text-balance">Logs Viewer</h1>
      </div>
      <LogsWorkspace
        levels={levelsData}
        logs={logs}
        setLogs={setLogs}
        modules={modules}
        refreshLogs={refreshLogs}
        openFilters
        type="viewer"
      />
    </div>
  );
}
