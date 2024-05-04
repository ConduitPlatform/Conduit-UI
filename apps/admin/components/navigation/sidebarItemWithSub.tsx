'use client';
import React, { ReactNode, useEffect } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const SidebarItemWithSub = ({ children, active }: {
  children?: ReactNode,
  active: boolean
}) => {
  const [open, setOpen] = React.useState(active);
  const firstChild = React.Children.toArray(children)[0];
  const restChildren = React.Children.toArray(children).slice(1);
  useEffect(() => {
    setOpen(active);
  }, [active]);
  return (
    <Collapsible
      open={open}
      onOpenChange={(isOpen) => setOpen(isOpen)}
    >
      <div className={cn('flex items-center justify-between rounded-md hover:bg-accent', active && 'bg-accent')}>
        {firstChild}
        <CollapsibleTrigger asChild>
          <Button variant='ghost' size='sm' className='w-9 p-0 group-hover:bg-accent'>
            {open ? <ChevronRightIcon className='h-4 w-4 transform rotate-90' /> :
              <ChevronRightIcon className='h-4 w-4' />}
            <span className='sr-only'>Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className='pt-2 space-y-2 pl-4'>
        {restChildren}
      </CollapsibleContent>
    </Collapsible>
  );
};
