'use client';

import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { LogsAccordionList } from './LogsAccordionList';
import LogsFiltersPanel from './LogsFiltersPanel';
import { LogsData, RefreshLogsFn } from '@/lib/models/logs-viewer';

type LogsWorkspaceProps = {
  className?: string;
  logs: LogsData[];
  setLogs: Dispatch<SetStateAction<LogsData[]>>;
  levels: string[];
  modules: string[];
  type?: 'drawer' | 'viewer';
  drawerModule?: string;
  openFilters?: boolean;
  refreshLogs: RefreshLogsFn;
  isLoading?: boolean;
};

export function LogsWorkspace({
  className,
  logs,
  setLogs,
  levels,
  modules,
  type = 'drawer',
  drawerModule,
  openFilters = false,
  refreshLogs,
  isLoading = false,
}: Readonly<LogsWorkspaceProps>) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);
  const [showInitialLoading, setShowInitialLoading] = useState(isLoading);

  const handleRefreshingChange = useCallback((refreshing: boolean) => {
    setIsRefreshing(refreshing);
    if (!refreshing) setShowInitialLoading(false);
  }, []);

  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-1 flex-col overflow-hidden',
        className
      )}
    >
      <LogsFiltersPanel
        refreshLogs={refreshLogs}
        setLogs={setLogs}
        levels={levels}
        modules={modules}
        open={openFilters}
        type={type}
        drawerModule={drawerModule}
        isRefreshing={isRefreshing}
        onRefreshingChange={handleRefreshingChange}
        onError={setError}
        retryTick={retryTick}
      />
      <LogsAccordionList
        logs={logs}
        isLoading={showInitialLoading && logs.length === 0}
        error={error}
        onRetry={() => setRetryTick(tick => tick + 1)}
      />
    </div>
  );
}
