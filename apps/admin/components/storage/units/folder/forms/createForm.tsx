import { BaseFolderForm } from '@/components/storage/units/folder/forms/baseForm';
import { createFolder } from '@/lib/api/storage';
import { useToast } from '@/lib/hooks/use-toast';
import { Folder } from '@/lib/models/storage';
import { useFileSystemActions } from '@/components/storage/FileSystemActionsProvider';

export const CreateFolderForm = ({
  container,
  path,
  onSuccess,
}: {
  container: string;
  path: string;
  onSuccess: (data: Folder) => void;
}) => {
  const { currentPath, navigateTo } = useFileSystemActions();
  const { toast } = useToast();
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
            name: `/${path}/${data.name}`,
            container,
          })
            .then(res => {
              toast({
                title: 'STORAGE',
                description: 'New Folder Created',
              });
              onSuccess(res);
              form.reset();
              if (redirect) {
                console.log('navigate path: ', redirect);
                navigateTo(`${currentPath}/${redirect}`);
              }
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
