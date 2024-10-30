'use client';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Filter, RefreshCw } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SearchInput } from '@/components/ui/form-inputs/SearchInput';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import LogsFiltersOptions from './LogsFiltersOptions';
import { LogsData } from '@/lib/models/logs-viewer';
import { getTimestamp } from '@/lib/models/logs-viewer/utils';
import { knownModuleNames } from '@/lib/models/logs-viewer/constants';
import { debounce, throttle } from 'lodash';
import { getLogsLevels } from '@/lib/api/logs-viewer';

type LogsFiltersPanelProps = {
  className?: string;
  setLogs: Dispatch<SetStateAction<LogsData[]>>;
  levels: string[];
  open?: boolean;
  type?: 'drawer' | 'viewer';
  drawerModule?: string;
  refreshLogs: (data: {
    modules: string[];
    levels: string[];
    startDate: number | undefined;
    endDate: number | undefined;
    limit: string | undefined;
  }) => Promise<LogsData[]>;
};

export default function LogsFiltersPanel({
  className,
  levels,
  setLogs,
  type = 'drawer',
  open = false,
  drawerModule,
  refreshLogs,
}: LogsFiltersPanelProps) {
  const [openFilters, setOpenFilters] = useState(open);
  const iconClass = 'w-4 h-4 flex-shrink-0';
  const pathname = usePathname();
  const isLogsViewerPage = pathname === '/logs-viewer';
  const [logsFilters, setLogsFilters] = useState({
    selectedLevels: [] as string[],
    selectedLimit: undefined as string | undefined,
    selectedModules: drawerModule ? [drawerModule] : ([] as string[]),
    selectedTime: undefined as string | undefined, // filter for drawer
    selectedStartDate: undefined as Date | undefined,
    selectedEndDate: undefined as Date | undefined,
  });

  const [liveReloadChecked, setLiveReloadChecked] = useState(false);

  let startDate = undefined as number | undefined;
  let endDate = undefined as number | undefined;

  if (logsFilters.selectedTime) {
    const { startTime, endTime } = getTimestamp(logsFilters.selectedTime);
    startDate = startTime;
    endDate = endTime;
  } else if (logsFilters.selectedStartDate && !logsFilters.selectedEndDate) {
    startDate = logsFilters.selectedStartDate?.getTime();
    endDate = Date.now();
  } else if (logsFilters.selectedStartDate && logsFilters.selectedEndDate) {
    startDate = logsFilters.selectedStartDate.getTime();
    endDate = logsFilters.selectedEndDate.getTime();
  } else {
    startDate = undefined;
    endDate = undefined;
  }

  const refresh = useCallback(() => {
    refreshLogs({
      modules:
        logsFilters.selectedModules.length === 0
          ? knownModuleNames
          : logsFilters.selectedModules,
      levels: logsFilters.selectedLevels,
      startDate: liveReloadChecked ? undefined : startDate,
      endDate: liveReloadChecked ? undefined : endDate,
      limit: logsFilters.selectedLimit,
    }).then(logsData => {
      setLogs(logsData);
    });
  }, [
    logsFilters.selectedLevels,
    logsFilters.selectedModules,
    logsFilters.selectedLimit,
    logsFilters.selectedTime,
    startDate,
    endDate,
  ]);

  const requestDebounce = useMemo(
    () =>
      debounce(() => {
        refresh();
        getLogsLevels(startDate, endDate).then(levels => {});
      }, 1000),
    [
      logsFilters.selectedLevels,
      logsFilters.selectedModules,
      logsFilters.selectedLimit,
      logsFilters.selectedTime,
      startDate,
      endDate,
    ]
  );

  const refreshRequest = useMemo(
    () =>
      throttle(() => {
        refresh();
      }, 1000),
    [refreshLogs]
  );

  const handleManualRefresh = useCallback(() => {
    refreshRequest();
  }, [refreshRequest]);

  useEffect(() => {
    requestDebounce();
    return () => requestDebounce.cancel();
  }, [
    logsFilters.selectedLevels,
    logsFilters.selectedModules,
    logsFilters.selectedLimit,
    logsFilters.selectedTime,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (liveReloadChecked) {
      if (endDate)
        setLogsFilters({ ...logsFilters, selectedEndDate: undefined });
      if (startDate)
        setLogsFilters({ ...logsFilters, selectedStartDate: undefined });
      timer = setInterval(() => requestDebounce(), 3000);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [endDate, liveReloadChecked, requestDebounce, startDate]);

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
            <Switch
              id="live-mode"
              checked={liveReloadChecked}
              onCheckedChange={setLiveReloadChecked}
            />
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
            disabled={liveReloadChecked}
            onClick={() => handleManualRefresh()}
          >
            <RefreshCw
              className={cn(iconClass, liveReloadChecked && 'animate-spin')}
            />
          </Button>
        </div>
        <SearchInput className="w-1/2 min-w-[200px]" />
      </div>
      {openFilters && (
        <LogsFiltersOptions
          levels={levels}
          type={type}
          setLogsFilters={setLogsFilters}
          logsFilters={logsFilters}
          disabledPopover={liveReloadChecked}
        />
      )}
    </div>
  );
}
