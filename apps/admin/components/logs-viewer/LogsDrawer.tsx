'use client';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Logs, X } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LogsAccordionList } from './LogsAccordionList';
import LogsFiltersPanel from './LogsFiltersPanel';

const snapPoints = [0.5, 0.75, 1];

type Module = {
  moduleName: string;
  serving: boolean;
};

type LogsDrawerProps = {
  modules: Module[];
};

export function LogsDrawer({ modules }: LogsDrawerProps) {
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isLogsViewerPage = pathname === '/logs-viewer';

  if (isLogsViewerPage) return;

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
          className="absolute bottom-0 right-0 justify-start h-8 gap-1.5 border-l-0 rounded-b-none left-60 rounded-t-md border-r-none"
        >
          <Logs className="w-5 h-5" />
          Logs
        </Button>
      </DrawerTrigger>
      <DrawerContent
        className={cn(
          'absolute left-60 right-0 rounded-t-md rounded-b-none h-full max-h-[91%]',
          isHomePage && 'max-h-[99%]'
        )}
      >
        <DrawerTitle className="sr-only">List of logs with filters</DrawerTitle>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            className="absolute top-1.5 right-1.5 w-8 h-8 rounded-md outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="flex-shrink-0 w-4 h-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DrawerTrigger>
        <LogsFiltersPanel modules={modules} />
        <LogsAccordionList />
      </DrawerContent>
    </Drawer>
  );
}
