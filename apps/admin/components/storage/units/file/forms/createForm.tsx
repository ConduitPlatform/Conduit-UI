'use client';

import { DragAndDropField } from '@/components/ui/form-inputs/DropzoneField';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { useFileSystemActions } from '@/components/storage/FileSystemActionsProvider';
import { useSearchParams } from 'next/navigation';
import { fileUpload } from '@/lib/api/storage';
import { toast } from '@/lib/hooks/use-toast';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import axios from 'axios';

export const CreateFileForm = () => {
  const { currentPath, files, navigateFiles } = useFileSystemActions();
  const searchParams = useSearchParams();
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const schema = z.object({
    attachedFile: z.instanceof(File),
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const submit = async (data: z.infer<typeof schema>) => {
    const container = searchParams.get('container')!;
    const response = await fileUpload({
      alias: data.attachedFile.name,
      mimeType: data.attachedFile.type,
      folder: currentPath,
      container,
      size: data.attachedFile.size,
      isPublic: false,
    });
    await axios.put(response.url, data.attachedFile, {
      headers: {
        'Content-Type': data.attachedFile.type,
        'x-ms-blob-type': 'BlockBlob',
      },
      onUploadProgress: progressEvent => {
        setProgress(
          Math.round((progressEvent.loaded / data.attachedFile.size) * 100)
        );
      },
    });
    return response.file;
  };

  return (
    <Form {...form}>
      <form>
        <DragAndDropField
          fieldName="attachedFile"
          multiple={false}
          showIcon={true}
          onDropAccepted={(acceptedFiles: File[]) => {
            setShowProgress(true);
            form.setValue('attachedFile', acceptedFiles[0], {
              shouldValidate: true,
              shouldDirty: true,
            });
            submit(form.getValues())
              .then(file => {
                toast({
                  title: 'STORAGE',
                  description: 'New File Created!',
                });
                const updatedFiles = [file, ...files.files];
                navigateFiles({
                  files: updatedFiles,
                  filesCount: ++files.filesCount,
                });
              })
              .finally(() => setShowProgress(false));
          }}
        />
        {showProgress && (
          <Card className="space-y-4 px-10 py-5 mt-3">
            <span className="font-semibold">File Uploading</span>
            <Progress value={progress} className="w-full" />
          </Card>
        )}
      </form>
    </Form>
  );
};
