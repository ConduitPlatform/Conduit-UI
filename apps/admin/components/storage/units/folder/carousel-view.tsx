'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Card } from '@/components/ui/card';
import { useFileSystemActions } from '@/components/storage/FileSystemActionsProvider';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CreateFolderForm } from '@/components/storage/units/folder/forms/createForm';
import { getFolders } from '@/lib/api/storage';

type CarouselViewProps = {
  refreshFolders: (
    path: string,
    container: string
  ) => Promise<Awaited<ReturnType<typeof getFolders>>>;
};

export const CarouselView = ({ refreshFolders }: CarouselViewProps) => {
  const searchParams = useSearchParams();
  const { navigateTo, folders, navigateFolders } = useFileSystemActions();

  useEffect(() => {
    const container = searchParams.get('container');
    const currentPath = searchParams.get('path') ?? '';
    if (container) {
      refreshFolders(currentPath, container).then(res => {
        navigateFolders(res);
      });
    }
  }, [searchParams]);

  return (
    <>
      <CreateFolderForm
        container={searchParams.get('container')!}
        onSuccess={folder => {
          const updatedFolders = [folder, ...folders.folders];
          navigateFolders({
            folders: updatedFolders,
            folderCount: ++folders.folderCount,
          });
        }}
      />
      <Carousel className="w-full max-w-5xl">
        <CarouselContent>
          {folders.folders.map(folder => {
            const trimmed = folder.name.replace(/\/$/, '');
            const path = trimmed.split('/');
            return (
              <CarouselItem
                key={folder._id}
                className="md:basis-1/2 lg:basis-1/4"
              >
                <button
                  onClick={() => {
                    navigateTo(`/${trimmed}`);
                  }}
                >
                  <Card className="h-36 w-56 flex items-center justify-center ">
                    {path[path.length - 1]}
                  </Card>
                </button>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </>
  );
};
