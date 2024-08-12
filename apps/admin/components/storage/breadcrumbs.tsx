'use client';

import { useFileSystemActions } from '@/components/storage/FileSystemActionsProvider';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Container } from '@/lib/models/storage';
import { SelectContainerDialog } from '@/components/storage/units/container/select';
import { isEmpty } from 'lodash';

export const BreadCrumbs = ({ containers }: { containers: Container[] }) => {
  const { currentPath, navigateTo } = useFileSystemActions();

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
          <SelectContainerDialog containers={containers} />
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
