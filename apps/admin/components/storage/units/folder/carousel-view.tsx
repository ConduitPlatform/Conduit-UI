'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Card } from '@/components/ui/card';
import { Folder } from '@/lib/models/storage';
import { useFileSystemActions } from '@/components/storage/FileSystemActionsProvider';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CreateFolderForm } from '@/components/storage/units/folder/forms/createForm';

type CarouselViewProps = {
  refreshFolders: (path: string, container: string) => Promise<Folder[]>;
};

export const CarouselView = ({ refreshFolders }: CarouselViewProps) => {
  const searchParams = useSearchParams();
  const { navigateTo, currentPath } = useFileSystemActions();
  const [folders, setFolder] = useState<Folder[]>([]);

  useEffect(() => {
    refreshFolders(currentPath, searchParams.get('container')!).then(res =>
      setFolder(res)
    );
  }, [currentPath, searchParams]);

  return (
    <>
      <CreateFolderForm
        container={searchParams.get('container')!}
        path={currentPath}
        onSuccess={folder => setFolder(prevState => [folder, ...prevState])}
      />
      <Carousel className="w-full max-w-5xl">
        <CarouselContent>
          {folders.map(folder => {
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
