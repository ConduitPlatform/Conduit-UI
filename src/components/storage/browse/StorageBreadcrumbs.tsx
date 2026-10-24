'use client';

import { Fragment } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useStorageBrowse } from './StorageBrowseProvider';

export function StorageBreadcrumbs() {
  const { container, path, navigateTo } = useStorageBrowse();

  if (!container) return null;

  const segments = path.split('/').filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <button
            className="text-sm font-medium hover:underline"
            onClick={() => navigateTo('')}
          >
            {container}
          </button>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const segmentPath = segments.slice(0, index + 1).join('/');
          const isLast = index === segments.length - 1;
          return (
            <Fragment key={segmentPath}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <button
                  className={`text-sm ${isLast ? 'font-semibold text-foreground' : 'hover:underline text-muted-foreground'}`}
                  onClick={() => navigateTo(segmentPath)}
                  disabled={isLast}
                >
                  {segment}
                </button>
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
