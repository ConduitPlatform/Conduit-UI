import { cn } from '@/lib/utils';

function PageHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-wrap items-center justify-between gap-4',
        className
      )}
      {...props}
    />
  );
}

function PageTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        'text-2xl font-semibold tracking-tight text-balance',
        className
      )}
      {...props}
    />
  );
}

function PageDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props} />
  );
}

function PageActions({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex shrink-0 flex-wrap items-center gap-2', className)}
      {...props}
    />
  );
}

export { PageHeader, PageTitle, PageDescription, PageActions };
