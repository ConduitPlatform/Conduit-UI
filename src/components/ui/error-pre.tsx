import { cn } from '@/lib/utils';

interface ErrorPreProps {
  children: React.ReactNode;
  className?: string;
}

export function ErrorPre({ children, className }: Readonly<ErrorPreProps>) {
  return (
    <pre
      className={cn(
        'w-[340px] whitespace-pre-wrap break-words rounded bg-destructive/10 p-3 text-sm text-destructive',
        className
      )}
    >
      {children}
    </pre>
  );
}
