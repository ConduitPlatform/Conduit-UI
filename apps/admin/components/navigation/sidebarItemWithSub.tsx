'use client';
import React, { ReactNode } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

export const SidebarItemWithSub = ({ children }: { children?: ReactNode, }) => {
  const [open, setOpen] = React.useState(false);
  const firstChild = React.Children.toArray(children)[0];
  const restChildren = React.Children.toArray(children).slice(1);
  return (
    <Collapsible
      onOpenChange={(isOpen) => setOpen(isOpen)}
    >
      <div className='flex items-center justify-between space-x-4'>
        {firstChild}
        <CollapsibleTrigger asChild>
          <Button variant='ghost' size='sm' className='w-9 p-0'>
            {open ? <ChevronRightIcon className='h-4 w-4 transform rotate-90' /> :
              <ChevronRightIcon className='h-4 w-4' />}
            <span className='sr-only'>Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className='space-y-2 pl-4'>
        {restChildren}
      </CollapsibleContent>
    </Collapsible>
  );
};
