import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-16 w-full rounded-md bg-muted/50 px-3 py-1.5 text-[13px] ring-offset-background placeholder:text-muted-foreground focus-visible:bg-background focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'TextArea';

export { Textarea };
