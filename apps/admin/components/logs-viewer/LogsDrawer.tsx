'use client';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Logs, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LogsAccordionList } from './LogsAccordionList';
import LogsFiltersPanel from './LogsFiltersPanel';
import { getLogsLevels, getLogsQueryRange } from '@/lib/api/logs-viewer';
import { LogsData } from '@/lib/models/logs-viewer';

const snapPoints = [0.5, 0.75, 1];

type LogsDrawerProps = {
  isSidebarOpen?: boolean;
};

export function LogsDrawer({ isSidebarOpen = true }: LogsDrawerProps) {
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);
  const [levels, setLevels] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogsData[]>([]);
  const [drawerHeight, setDrawerHeight] = useState(0);
  const pathname = usePathname();
  const pathSegments = pathname.split('/')[1];
  const currentModule = pathSegments ? pathSegments : 'core';
  const isLogsViewerPage = pathSegments === 'logs-viewer';
  const isCoreModulePage = currentModule === 'core';

  if (isLogsViewerPage) return;

  useEffect(() => {
    getLogsLevels().then(res => {
      setLevels(res);
    });
    getLogsQueryRange({ modules: currentModule, limit: '100' }).then(res => {
      setLogs(res);
    });
  }, []);

  const refreshDrawerLogs = (data: {
    modules: string[];
    levels: string[];
    startDate: number | undefined;
    endDate: number | undefined;
    limit: string | undefined;
  }) => {
    const logs = getLogsQueryRange({
      ...data,
      modules: currentModule,
      limit: data.limit ? data.limit : '100',
    });
    return logs;
  };

  const calculateDrawerHeight = () => {
    const windowHeight = window.innerHeight;
    const visibleHeight = (snap as number)
      ? windowHeight * (snap as number)
      : windowHeight;
    return visibleHeight;
  };

  useEffect(() => {
    const height = calculateDrawerHeight() - 124; // subtract height for drawer header & drawer vertical padding
    setDrawerHeight(height);
  }, [snap]);

  return (
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
          drawerModule={currentModule}
          refreshLogs={refreshDrawerLogs}
        />
        <div style={{ maxHeight: `${drawerHeight}px` }}>
          <LogsAccordionList logs={logs} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
