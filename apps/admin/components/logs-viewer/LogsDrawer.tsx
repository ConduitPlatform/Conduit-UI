'use client';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { X } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LogsAccordionList } from './LogsAccordionList';
import LogsFilters from './LogsFilters';

const snapPoints = [0.5, 0.75, 1];

export function LogsDrawer() {
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isLogsViewer = pathname === '/logs-viewer';

  if (isLogsViewer) return;

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
          className="absolute bottom-0 right-0 justify-start h-8 border-l-0 rounded-b-none left-60 rounded-t-md border-r-none"
        >
          Logs
        </Button>
      </DrawerTrigger>
      <DrawerContent
        className={cn(
          'absolute left-60 right-0 rounded-t-md rounded-b-none h-full max-h-[91%] px-4',
          isHomePage && 'max-h-[99%]'
        )}
      >
        <DrawerTitle className="sr-only">Logs table with filters</DrawerTitle>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            className="absolute w-8 h-8 right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:text-muted-foreground"
          >
            <X className="flex-shrink-0 w-4 h-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DrawerTrigger>
        <LogsFilters />
        <LogsAccordionList />
      </DrawerContent>
    </Drawer>
  );
}
