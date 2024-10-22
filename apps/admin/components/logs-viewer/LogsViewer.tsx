'use client';
import { LogsData, ModulesTypes } from '@/lib/models/logs-viewer';
import { LogsAccordionList } from './LogsAccordionList';
import LogsFiltersPanel from './LogsFiltersPanel';

type Module = {
  moduleName: ModulesTypes;
  serving: boolean;
};

type LogsViewerProps = {
  modules: Module[];
  levels: string[];
  logs: LogsData[];
};

export default function LogsViewer({ modules, levels, logs }: LogsViewerProps) {
  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-40 flex flex-row items-center justify-between w-full p-4 border-b bg-background">
        <h1 className="text-xl font-light">Logs Viewer</h1>
      </div>
      <LogsFiltersPanel modules={modules} levels={levels} open />
      <LogsAccordionList logs={logs} />
    </div>
  );
}
