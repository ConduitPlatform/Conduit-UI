'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export interface SecretTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const SecretTextarea = React.forwardRef<
  HTMLTextAreaElement,
  SecretTextareaProps
>(({ className, disabled, style, ...props }, ref) => {
  const [show, setShow] = React.useState(false);

  return (
    <div className="relative">
      <Textarea
        className={cn('pr-10', className)}
        disabled={disabled}
        ref={ref}
        style={
          {
            ...style,
            WebkitTextSecurity: show ? 'none' : 'disc',
          } as React.CSSProperties
        }
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-8 px-3 py-2 hover:bg-transparent"
        onClick={() => setShow(current => !current)}
        disabled={disabled}
        aria-label={show ? 'Hide secret' : 'Show secret'}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
});
SecretTextarea.displayName = 'SecretTextarea';
