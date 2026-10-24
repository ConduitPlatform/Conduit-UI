'use client';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Logs, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LogsWorkspace } from './LogsWorkspace';
import { EmptyState } from '@/components/ui/empty-state';
import { LogsData, LogsQueryParams } from '@/lib/models/logs-viewer';
import {
  getLogsLevels,
  getLogsQueryRange,
  getModules,
} from '@/lib/loki/requests';
import { getLokiAvailability } from '@/lib/observability/lokiAvailability.actions';
import type { LokiAvailability } from '@/lib/observability/types';
import { knownModuleNames } from '@/lib/models/logs-viewer/constants';
import {
  getLokiModuleFilterForPath,
  getModuleDisplayName,
} from '@/lib/utils/module-utils';

const snapPoints = [0.5, 0.75, 1];

export function LogsDrawer() {
  const [lokiAvailability, setLokiAvailability] =
    useState<LokiAvailability | null>(null);
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);
  const [levels, setLevels] = useState<string[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const drawerModuleLabel = useMemo(
    () =>
      pathname.split('/').length > 1
        ? pathname.split('/')[1] === ''
          ? 'core'
          : pathname.split('/')[1]
        : 'core',
    [pathname]
  );
  const lokiModuleFilter = useMemo(
    () => getLokiModuleFilterForPath(pathname),
    [pathname]
  );
  const isLogsViewerPage = useMemo(
    () => pathname.split('/')[1] === 'logs-viewer',
    [pathname]
  );
  const isCoreModulePage = useMemo(
    () => drawerModuleLabel === 'core',
    [drawerModuleLabel]
  );
  const moduleDisplayName =
    drawerModuleLabel === 'core'
      ? 'Core'
      : getModuleDisplayName(drawerModuleLabel);

  useEffect(() => {
    getLokiAvailability().then(setLokiAvailability);
  }, [drawerModuleLabel]);

  const refreshDrawerLogs = useCallback(
    async (data: LogsQueryParams) => {
      return await getLogsQueryRange({
        ...data,
        modules: lokiModuleFilter,
        limit: data.limit ? data.limit : '100',
      });
    },
    [lokiModuleFilter]
  );

  const lokiReady = lokiAvailability?.state === 'ready';
  const showLogsUi =
    !isLogsViewerPage &&
    lokiAvailability &&
    lokiAvailability.state !== 'not_configured';

  useEffect(() => {
    if (!lokiReady) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    getLogsLevels()
      .then(res => {
        setLevels(res);
      })
      .catch(() => {
        setLevels([]);
      });
    getModules()
      .then(res => {
        let validModules = knownModuleNames;
        if (res.length > 0) {
          validModules = knownModuleNames.concat(
            res.filter(module => !knownModuleNames.includes(module))
          );
        }
        setModules(validModules);
      })
      .catch(() => {
        setModules([...knownModuleNames]);
      });
  }, [lokiReady, lokiModuleFilter, pathname]);

  return showLogsUi ? (
    <Drawer
      modal={false}
      handleOnly
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      snapToSequentialPoint
    >
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="absolute bottom-0 left-4 z-20 h-8 gap-1.5 rounded-t-md rounded-b-none border-b-0 px-3"
        >
          <Logs className="size-4" />
          Logs
        </Button>
      </DrawerTrigger>
      <DrawerContent
        showOverlay={false}
        className={cn(
          'right-0 bottom-0 left-0 mt-0 h-full max-h-[94%] min-h-0 overflow-hidden',
          isCoreModulePage && 'max-h-[99%]'
        )}
      >
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 items-start justify-between gap-3 px-4 pb-2">
            <div className="min-w-0">
              <DrawerTitle className="text-sm font-medium tracking-tight">
                Logs
              </DrawerTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {moduleDisplayName}
              </p>
            </div>
            <DrawerClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label="Close logs"
              >
                <X className="size-4" />
              </Button>
            </DrawerClose>
          </div>
          {lokiReady ? (
            <LogsWorkspace
              levels={levels}
              logs={logs}
              setLogs={value => {
                setLogs(value);
                setIsLoading(false);
              }}
              modules={modules}
              refreshLogs={refreshDrawerLogs}
              drawerModule={drawerModuleLabel}
              type="drawer"
              isLoading={isLoading}
            />
          ) : (
            <EmptyState
              title="Cannot reach Loki"
              description="Check that Loki is running and that LOKI_URL is correct."
              className="min-h-0 flex-1"
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  ) : null;
}
