import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarTriggerCollapseProps
  extends React.ComponentProps<typeof Button> {}
export default function SidebarCollapseTrigger({
  className,
  ...props
}: SidebarTriggerCollapseProps) {
  return (
    <SidebarTrigger
      className={cn(
        'w-5 h-5 text-muted-foreground hover:text-foreground',
        className
      )}
      size="icon"
      {...props}
    />
  );
}
