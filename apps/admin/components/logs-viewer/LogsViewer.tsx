'use client';
import { LogsData } from '@/lib/models/logs-viewer';
import { LogsAccordionList } from './LogsAccordionList';
import LogsFiltersPanel from './LogsFiltersPanel';
import { useEffect, useRef, useState } from 'react';
import SidebarCollapseTrigger from '../navigation/sidebarCollapseTrigger';

type LogsViewerProps = {
  levelsData: string[];
  logsData: LogsData[];
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
  refreshLogs,
}: LogsViewerProps) {
  const [logs, setLogs] = useState(logsData);

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-40 flex items-center w-full gap-3 p-4 border-b bg-background">
        <SidebarCollapseTrigger className="" />
        <h1 className="text-xl font-light">Logs Viewer</h1>
      </div>
      <LogsFiltersPanel
        refreshLogs={refreshLogs}
        setLogs={setLogs}
        levels={levelsData}
        open
        type="viewer"
      />
      <LogsAccordionList logs={logs} className="h-[calc(100vh_-_22rem)]" />
    </div>
  );
}
