'use client';

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,TooltipArrow } from '@/components/ui/tooltip';

interface TooltipHelperProp {
  content: string;
  children: React.ReactNode;
}

const TooltipHelper = ({ content, children }: TooltipHelperProp) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent>
          <p>{content}</p>
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipHelper;
