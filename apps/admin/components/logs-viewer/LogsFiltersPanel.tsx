'use client';
import { useState } from 'react';
import { Filter, RefreshCw } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SearchInput } from '@/components/ui/form-inputs/SearchInput';
import LogsFiltersForm from './LogsFilterForm';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

type Module = {
  moduleName: string;
  serving: boolean;
};

type LogsFiltersPanelProps = {
  className?: string;
  modules: Module[];
};

export default function LogsFiltersPanel({
  className,
  modules,
}: LogsFiltersPanelProps) {
  const [isToggled, setIsToggled] = useState(false);
  const iconClass = 'w-4 h-4 flex-shrink-0';
  const pathname = usePathname();
  const isLogsViewerPage = pathname === '/logs-viewer';
  const servedModules = modules
    .filter(module => module.serving)
    .map(module => ({
      label: module.moduleName,
      value: module.moduleName,
    }));

  return (
    <div
      className={cn(
        'bg-background border-b border-b-input',
        className,
        isLogsViewerPage && 'sticky z-40 top-[3.8rem]'
      )}
    >
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="live-mode">Live</Label>
            <Switch id="live-mode" />
          </div>
          <Toggle
            aria-label="Toggle"
            pressed={isToggled}
            size="lg"
            onPressedChange={isToggled => setIsToggled(isToggled)}
            variant="outline"
          >
            <Filter className={iconClass} />
          </Toggle>
          <Button type="button" variant="outline" size="icon">
            <RefreshCw className={iconClass} />
          </Button>
        </div>
        <SearchInput className="w-1/2 min-w-[200px]" />
      </div>
      <LogsFiltersForm
        moduleOptions={servedModules}
        data-state={isToggled ? 'open' : 'closed'}
      />
    </div>
  );
}
