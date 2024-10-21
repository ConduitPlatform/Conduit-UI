'use client';
import { SetStateAction, useState } from 'react';
import { Filter, RefreshCw } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SearchInput } from '@/components/ui/form-inputs/SearchInput';
import LogsFiltersForm from './LogsFilterForm';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import {
  getModuleTitle,
  LogsData,
  ModulesTypes,
} from '@/lib/models/logs-viewer';
import { getLogsQueryRange } from '@/lib/api/logs-viewer';

type Module = {
  moduleName: ModulesTypes;
  serving: boolean;
  openFilters?: boolean;
};

type LogsFiltersPanelProps = {
  className?: string;
  modules: Module[];
  levels: string[];
  open?: boolean;
};

export default function LogsFiltersPanel({
  className,
  modules,
  levels,
  open = false,
}: LogsFiltersPanelProps) {
  const [openFilters, setOpenFilters] = useState(open);
  const iconClass = 'w-4 h-4 flex-shrink-0';
  const pathname = usePathname();
  const isLogsViewerPage = pathname === '/logs-viewer';

  const servedModules = modules
    .filter(module => module.serving)
    .map(module => ({
      label: getModuleTitle(module.moduleName),
      value: module.moduleName,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const levelsOptions = levels.map(level => ({
    label: level,
    value: level,
  }));

  return (
    <div
      className={cn(
        'bg-background border-b border-b-input',
        className,
        isLogsViewerPage && 'sticky z-40 top-[3.8rem]'
      )}
    >
      <div className="flex items-center justify-between px-5 pt-8 pb-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="live-mode">Live</Label>
            <Switch id="live-mode" />
          </div>
          <Toggle
            aria-label="Toggle"
            pressed={openFilters}
            size="lg"
            onPressedChange={open => setOpenFilters(open)}
            variant="outline"
          >
            <Filter className={iconClass} />
          </Toggle>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={async () => {
              await getLogsQueryRange(['core']);
            }}
          >
            <RefreshCw className={iconClass} />
          </Button>
        </div>
        <SearchInput className="w-1/2 min-w-[200px]" />
      </div>
      {openFilters && (
        <LogsFiltersForm
          moduleOptions={servedModules}
          levelOptions={levelsOptions}
        />
      )}
    </div>
  );
}
