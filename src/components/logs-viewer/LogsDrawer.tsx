'use client';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Logs, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LogsAccordionList } from './LogsAccordionList';
import LogsFiltersPanel from './LogsFiltersPanel';
import { LogsData } from '@/lib/models/logs-viewer';
import {
  getLogsLevels,
  getLogsQueryRange,
  getModules,
} from '@/lib/loki/requests';
import { getLokiAvailability } from '@/lib/observability/lokiAvailability.actions';
import type { LokiAvailability } from '@/lib/observability/types';
import { knownModuleNames } from '@/lib/models/logs-viewer/constants';

const snapPoints = [0.5, 0.75, 1];

type LogsDrawerProps = {
  isSidebarOpen?: boolean;
};

export function LogsDrawer({ isSidebarOpen = true }: LogsDrawerProps) {
  const [lokiAvailability, setLokiAvailability] =
    useState<LokiAvailability | null>(null);
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);
  const [levels, setLevels] = useState<string[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogsData[]>([]);
  const [drawerHeight, setDrawerHeight] = useState(0);
  const pathname = usePathname();
  const currentModule = useMemo(
    () =>
      pathname.split('/').length > 1
        ? pathname.split('/')[1] === ''
          ? 'core'
          : pathname.split('/')[1]
        : 'core',
    [pathname]
  );
  const isLogsViewerPage = useMemo(
    () => pathname.split('/')[1] === 'logs-viewer',
    [pathname]
  );
  const isCoreModulePage = useMemo(
    () => currentModule === 'core',
    [currentModule]
  );

  useEffect(() => {
    getLokiAvailability().then(setLokiAvailability);
  }, [currentModule]);

  const refreshDrawerLogs = useCallback(
    async (data: {
      modules: string[] | string;
      levels?: string[];
      startDate?: number;
      endDate?: number;
      limit?: string;
    }) => {
      return await getLogsQueryRange({
        ...data,
        modules: currentModule,
        limit: data.limit ? data.limit : '100',
      });
    },
    [currentModule]
  );
  const lokiReady = lokiAvailability?.state === 'ready';
  const showLogsUi =
    !isLogsViewerPage &&
    lokiAvailability &&
    lokiAvailability.state !== 'not_configured';

  useEffect(() => {
    if (!lokiReady) return;
    getLogsLevels()
      .then(res => {
        'use client';
        setLevels(res);
      })
      .catch();
    getModules()
      .then(res => {
        'use client';
        let validModules = knownModuleNames;
        if (res.length > 0) {
          validModules = knownModuleNames.concat(
            res.filter(module => !knownModuleNames.includes(module))
          );
        }
        setModules(validModules);
      })
      .catch();
    refreshDrawerLogs({ modules: currentModule })
      .then(res => {
        'use client';
        setLogs(res);
      })
      .catch();
  }, [lokiReady, currentModule, pathname, refreshDrawerLogs]);

  useEffect(() => {
    const height = calculateDrawerHeight() - 124; // subtract height for drawer header & drawer vertical padding
    setDrawerHeight(height);
  }, [snap]);

  const calculateDrawerHeight = () => {
    const windowHeight = window.innerHeight;
    return (snap as number) ? windowHeight * (snap as number) : windowHeight;
  };

  return showLogsUi ? (
    <Drawer
      modal={false}
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      snapToSequentialPoint
    >
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="absolute bottom-0 right-0 justify-start h-8 gap-1.5 border-l-0 rounded-b-none left-0 rounded-t-md border-r-none"
        >
          <Logs className="w-5 h-5" />
          Logs
        </Button>
      </DrawerTrigger>
      <DrawerContent
        className={cn(
          'absolute  right-0 rounded-t-md rounded-b-none h-full max-h-[94%]',
          isCoreModulePage && 'max-h-[99%]',
          isSidebarOpen ? 'left-56' : 'left-0'
        )}
      >
        <DrawerTitle className="sr-only">List of logs with filters</DrawerTitle>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="absolute w-8 h-8 rounded-md outline-hidden top-2 right-2 ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="shrink-0 w-4 h-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DrawerTrigger>
        {lokiReady ? (
          <>
            <LogsFiltersPanel
              levels={levels}
              setLogs={setLogs}
              modules={modules}
              drawerModule={currentModule}
              refreshLogs={refreshDrawerLogs}
            />
            <div style={{ maxHeight: `${drawerHeight}px` }}>
              <LogsAccordionList logs={logs} />
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Cannot reach Loki at the configured URL. Check that Loki is running
            and that LOKI_URL is correct.
          </div>
        )}
      </DrawerContent>
    </Drawer>
  ) : null;
}
