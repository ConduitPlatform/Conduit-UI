import { BaseFolderForm } from '@/components/storage/units/folder/forms/baseForm';
import { createFolder } from '@/lib/api/storage';
import { useToast } from '@/lib/hooks/use-toast';
import { Folder } from '@/lib/models/storage';
import { useFileSystemActions } from '@/components/storage/FileSystemActionsProvider';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export const CreateFolderForm = ({
  container,
  onSuccess,
}: {
  container: string;
  onSuccess: (data: Folder) => void;
}) => {
  const searchParams = useSearchParams();
  const [currentPath, setCurrentPath] = useState(searchParams.get('path'));
  const { navigateTo } = useFileSystemActions();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentPath(searchParams.get('path'));
  }, [searchParams]);

  return (
    <BaseFolderForm
      title={'Create Folder'}
      description={
        'Create a folder in this directory. Click save when you&apos;re done.'
      }
      editable={true}
      action={(data, form, redirect) => {
        if (!container) {
          toast({
            title: 'STORAGE',
            description: 'Container is required.',
          });
        } else {
          createFolder({
            ...data,
            name: `/${currentPath}/${data.name}`,
            container,
          })
            .then(res => {
              toast({
                title: 'STORAGE',
                description: 'New Folder Created',
              });
              onSuccess(res);
              form.reset();
              if (redirect) navigateTo(`${currentPath}/${redirect}`);
            })
            .catch(() =>
              toast({
                title: 'STORAGE',
                description: 'Folder already exists',
              })
            );
        }
      }}
    />
  );
};
