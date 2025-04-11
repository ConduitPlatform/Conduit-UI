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
import { isLokiEnabled } from '@/lib/logic/EnvManager';
import { knownModuleNames } from '@/lib/models/logs-viewer/constants';

const snapPoints = [0.5, 0.75, 1];

type LogsDrawerProps = {
  isSidebarOpen?: boolean;
};

export function LogsDrawer({ isSidebarOpen = true }: LogsDrawerProps) {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
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
    isLokiEnabled().then(res => {
      'use client';
      setIsAvailable(res);
    });
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
  useEffect(() => {
    if (!isAvailable) return;
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
  }, [isAvailable, currentModule, pathname]);

  useEffect(() => {
    const height = calculateDrawerHeight() - 124; // subtract height for drawer header & drawer vertical padding
    setDrawerHeight(height);
  }, [snap]);

  const calculateDrawerHeight = () => {
    const windowHeight = window.innerHeight;
    return (snap as number) ? windowHeight * (snap as number) : windowHeight;
  };

  return !isLogsViewerPage && isAvailable ? (
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
          isSidebarOpen ? 'left-64' : 'left-0'
        )}
      >
        <DrawerTitle className="sr-only">List of logs with filters</DrawerTitle>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="absolute w-8 h-8 rounded-md outline-none top-2 right-2 ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="flex-shrink-0 w-4 h-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DrawerTrigger>
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
      </DrawerContent>
    </Drawer>
  ) : null;
}
