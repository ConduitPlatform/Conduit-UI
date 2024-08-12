import { BaseFolderForm } from '@/components/storage/units/folder/forms/baseForm';
import { createFolder } from '@/lib/api/storage';
import { useToast } from '@/lib/hooks/use-toast';
import { Folder } from '@/lib/models/storage';

export const CreateFolderForm = ({
  container,
  path,
  onSuccess,
}: {
  container: string;
  path: string;
  onSuccess: (data: Folder) => void;
}) => {
  const { toast } = useToast();
  return (
    <BaseFolderForm
      editable={true}
      action={(data, form) => {
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
          }).then(res => {
            toast({
              title: 'STORAGE',
              description: 'New Folder Created',
            });
            onSuccess(res);
            form.reset();
          });
        }
      }}
    />
  );
};
