import React from 'react';
import axios from 'axios';
import { DownloadIcon } from 'lucide-react';
import { NavigationMenuLink } from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & {
    enabled: boolean;
    downloadUrl?: string;
  }
>(({ className, downloadUrl, enabled, title, children, ...props }, ref) => {
  if (!enabled) return <></>;
  return (
    <li className="flex items-center justify-between gap-x-2">
      {downloadUrl && (
        <button
          onClick={() => {
            const link = document.createElement('a');
            link.download = `${title}.json`;
            axios
              .get(downloadUrl, {
                responseType: 'blob',
              })
              .then(res => {
                link.href = URL.createObjectURL(
                  new Blob([res.data], { type: 'application/json' })
                );
                link.click();
              });
          }}
          hidden={false}
        >
          <DownloadIcon width={14} height={14} />
        </button>
      )}
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          target={'_blank'}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="text-sm leading-snug line-clamp-2 text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';

export { ListItem };
