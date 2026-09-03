'use client';
import { LogsData } from '@/lib/models/logs-viewer';
import { LogsAccordionList } from './LogsAccordionList';
import LogsFiltersPanel from './LogsFiltersPanel';
import { useState } from 'react';

type LogsViewerProps = {
  levelsData: string[];
  logsData: LogsData[];
  modules: string[];
  refreshLogs: (data: {
    modules: string[];
    levels: string[];
    startDate: number | undefined;
    endDate: number | undefined;
    limit: string | undefined;
  }) => Promise<LogsData[]>;
};

export default function LogsViewer({
  levelsData,
  logsData,
  modules,
  refreshLogs,
}: Readonly<LogsViewerProps>) {
  const [logs, setLogs] = useState(logsData);

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-40 flex w-full items-center gap-3 border-b border-border bg-surface-1 p-4">
        <h1 className="text-xl font-light">Logs Viewer</h1>
      </div>
      <LogsFiltersPanel
        refreshLogs={refreshLogs}
        setLogs={setLogs}
        levels={levelsData}
        modules={modules}
        open
        type="viewer"
      />
      <LogsAccordionList logs={logs} className="h-[calc(100vh-22rem)]" />
    </div>
  );
}
