'use client';

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Filter, RefreshCw, Search } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import LogsFiltersOptions from './LogsFiltersOptions';
import {
  LogsData,
  LogsFiltersState,
  RefreshLogsFn,
} from '@/lib/models/logs-viewer';
import { getTimestamp } from '@/lib/models/logs-viewer/utils';
import { debounce, throttle } from 'lodash';
import { useSearchParams } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type LogsFiltersPanelProps = {
  className?: string;
  setLogs: Dispatch<SetStateAction<LogsData[]>>;
  levels: string[];
  modules: string[];
  open?: boolean;
  type?: 'drawer' | 'viewer';
  drawerModule?: string;
  refreshLogs: RefreshLogsFn;
  isRefreshing?: boolean;
  onRefreshingChange?: (isRefreshing: boolean) => void;
  onError?: (message: string | null) => void;
  retryTick?: number;
};

export default function LogsFiltersPanel({
  className,
  levels,
  setLogs,
  modules,
  type = 'drawer',
  open = false,
  drawerModule,
  refreshLogs,
  isRefreshing = false,
  onRefreshingChange,
  onError,
  retryTick = 0,
}: Readonly<LogsFiltersPanelProps>) {
  const searchParams = useSearchParams();
  const [openFilters, setOpenFilters] = useState(open);
  const [logsFilters, setLogsFilters] = useState<LogsFiltersState>(() => {
    if (type !== 'viewer') {
      return {
        selectedLevels: [],
        selectedLimit: undefined,
        selectedModules: drawerModule ? [drawerModule] : [],
        selectedTime: undefined,
        selectedStartDate: undefined,
        selectedEndDate: undefined,
        searchTerm: '',
      };
    }
    const start = searchParams.get('startDate');
    const end = searchParams.get('endDate');
    return {
      selectedLevels:
        searchParams.get('levels')?.split(',').filter(Boolean) ?? [],
      selectedLimit: searchParams.get('limit') ?? undefined,
      selectedModules:
        searchParams.get('modules')?.split(',').filter(Boolean) ?? [],
      selectedTime: searchParams.get('time') ?? undefined,
      selectedStartDate: start ? new Date(start) : undefined,
      selectedEndDate: end ? new Date(end) : undefined,
      searchTerm: searchParams.get('search') ?? '',
    };
  });
  const [liveReloadChecked, setLiveReloadChecked] = useState(false);

  let startDate = undefined as number | undefined;
  let endDate = undefined as number | undefined;

  if (logsFilters.selectedTime) {
    const { startTime, endTime } = getTimestamp(logsFilters.selectedTime);
    startDate = startTime;
    endDate = endTime;
  } else if (logsFilters.selectedStartDate && !logsFilters.selectedEndDate) {
    startDate = logsFilters.selectedStartDate.getTime();
    endDate = Date.now();
  } else if (logsFilters.selectedStartDate && logsFilters.selectedEndDate) {
    startDate = logsFilters.selectedStartDate.getTime();
    endDate = logsFilters.selectedEndDate.getTime();
  }

  const refresh = useCallback(async () => {
    onRefreshingChange?.(true);
    try {
      const logsData = await refreshLogs({
        modules:
          logsFilters.selectedModules.length === 0
            ? modules
            : logsFilters.selectedModules,
        levels: logsFilters.selectedLevels,
        startDate: liveReloadChecked ? undefined : startDate,
        endDate: liveReloadChecked ? undefined : endDate,
        limit: logsFilters.selectedLimit,
        searchTerm: logsFilters.searchTerm.trim() || undefined,
      });
      setLogs(logsData);
      onError?.(null);
    } catch {
      onError?.(
        'Could not load logs. Check that Loki is running and try again.'
      );
    } finally {
      onRefreshingChange?.(false);
    }
  }, [
    endDate,
    liveReloadChecked,
    logsFilters.searchTerm,
    logsFilters.selectedLevels,
    logsFilters.selectedLimit,
    logsFilters.selectedModules,
    modules,
    onError,
    onRefreshingChange,
    refreshLogs,
    setLogs,
    startDate,
  ]);

  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  const hasMounted = useRef(false);

  const requestDebounce = useMemo(
    () =>
      debounce(() => {
        void refreshRef.current();
      }, 1000),
    []
  );

  const refreshRequest = useMemo(
    () =>
      throttle(() => {
        void refreshRef.current();
      }, 1000),
    []
  );

  useEffect(() => {
    if (!drawerModule) return;
    setLogsFilters(prev =>
      prev.selectedModules.length === 1 &&
      prev.selectedModules[0] === drawerModule
        ? prev
        : { ...prev, selectedModules: [drawerModule] }
    );
  }, [drawerModule]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      const hasUrlFilters =
        type === 'viewer' &&
        Boolean(
          logsFilters.searchTerm ||
          logsFilters.selectedLevels.length ||
          logsFilters.selectedLimit ||
          logsFilters.selectedModules.length ||
          logsFilters.selectedTime ||
          logsFilters.selectedStartDate ||
          logsFilters.selectedEndDate
        );
      if (type === 'viewer' && !hasUrlFilters) return;
      void refreshRef.current();
      return;
    }
    requestDebounce();
    return () => requestDebounce.cancel();
  }, [
    logsFilters.searchTerm,
    logsFilters.selectedLevels,
    logsFilters.selectedLimit,
    logsFilters.selectedModules,
    logsFilters.selectedTime,
    logsFilters.selectedStartDate,
    logsFilters.selectedEndDate,
    startDate,
    endDate,
    requestDebounce,
    refreshLogs,
    type,
  ]);

  useEffect(() => {
    if (retryTick > 0) {
      void refreshRef.current();
    }
  }, [retryTick]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (liveReloadChecked) {
      setLogsFilters(prev =>
        prev.selectedEndDate || prev.selectedStartDate || prev.selectedTime
          ? {
              ...prev,
              selectedEndDate: undefined,
              selectedStartDate: undefined,
              selectedTime: undefined,
            }
          : prev
      );
      timer = setInterval(() => {
        void refreshRef.current();
      }, 3000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [liveReloadChecked]);

  useEffect(() => {
    return () => {
      requestDebounce.cancel();
      refreshRequest.cancel();
    };
  }, [requestDebounce, refreshRequest]);

  return (
    <div
      className={cn('shrink-0 border-b border-border bg-surface-1', className)}
    >
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 items-center gap-2 pr-1">
            <span
              className={cn(
                'size-1.5 rounded-full',
                liveReloadChecked
                  ? 'animate-pulse bg-log-info'
                  : 'bg-muted-foreground/40'
              )}
              aria-hidden
            />
            <Label htmlFor="live-mode" className="text-[13px]">
              Live
            </Label>
            <Switch
              id="live-mode"
              checked={liveReloadChecked}
              onCheckedChange={setLiveReloadChecked}
            />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  aria-label="Show log filters"
                  pressed={openFilters}
                  size="sm"
                  onPressedChange={setOpenFilters}
                  variant="outline"
                >
                  <Filter className="size-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Show log filters</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={liveReloadChecked || isRefreshing}
                  onClick={() => refreshRequest()}
                  aria-label="Refresh logs"
                >
                  <RefreshCw
                    className={cn(
                      'size-4',
                      (liveReloadChecked || isRefreshing) && 'animate-spin'
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {liveReloadChecked ? 'Live refresh is on' : 'Refresh logs'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="relative min-w-0 w-full sm:max-w-md sm:flex-1">
          <Label htmlFor="logs-search" className="sr-only">
            Search logs
          </Label>
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="logs-search"
            placeholder="Search logs"
            value={logsFilters.searchTerm}
            onChange={event =>
              setLogsFilters(prev => ({
                ...prev,
                searchTerm: event.target.value,
              }))
            }
            className="h-8 pl-8"
          />
        </div>
      </div>
      {openFilters ? (
        <LogsFiltersOptions
          levels={levels}
          modules={modules}
          type={type}
          setLogsFilters={setLogsFilters}
          logsFilters={logsFilters}
          disabledPopover={liveReloadChecked}
        />
      ) : null}
    </div>
  );
}
