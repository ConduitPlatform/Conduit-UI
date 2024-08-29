'use client';

import { useFileSystemActions } from '@/components/storage/FileSystemActionsProvider';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { isEmpty } from 'lodash';
import { ContainerDialog } from '@/components/storage/units/container/base';
import { useEffect, useState } from 'react';
import { Container } from '@/lib/models/storage';
import { getContainers } from '@/lib/api/storage';
import { useSearchParams } from 'next/navigation';

export const BreadCrumbs = ({
  refreshContainers,
}: {
  refreshContainers: () => Promise<Awaited<ReturnType<typeof getContainers>>>;
}) => {
  const searchParams = useSearchParams();
  const currentPath = searchParams.get('path') ?? '';
  const { navigateTo } = useFileSystemActions();
  const [containers, setContainers] = useState<Container[]>([]);

  useEffect(() => {
    refreshContainers().then(res => setContainers(res.containers));
  }, []);

  const folders = currentPath.replace(/^\/$/g, '').split('/');
  const paths: { [name: string]: string[] } = {};
  folders.forEach((f, index) => {
    const name = isEmpty(f) ? '/' : f;
    paths[name] = folders.slice(0, index + 1);
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <ContainerDialog
            containers={containers}
            refreshContainers={container =>
              setContainers(prevState => [...prevState, container])
            }
          />
        </BreadcrumbItem>
        {folders.map((folder, index) => (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <button
                onClick={() => {
                  const folderName = isEmpty(folder) ? '/' : folder;
                  const split = paths[folderName];
                  const path = split.length ? split.join('/') : '';
                  navigateTo(path);
                }}
                disabled={index === folders.length - 1}
              >
                {isEmpty(folder) ? '/' : folder}
              </button>
            </BreadcrumbItem>
          </>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
