'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { rhfZodResolver } from '@/lib/zod-form';
import { createFolder } from '@/lib/api/storage';
import { useStorageBrowse } from './StorageBrowseProvider';
import { useToast } from '@/lib/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(1, 'Folder name is required'),
  isPublic: z.boolean().default(false),
});

export function CreateFolderDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { container, path, addFolderToList } = useStorageBrowse();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: rhfZodResolver(formSchema),
    defaultValues: { name: '', isPublic: false },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!container) return;
    setSubmitting(true);
    try {
      const folderPath = path ? `/${path}/${data.name}` : `/${data.name}`;
      const res = await createFolder({
        name: folderPath,
        container,
        isPublic: data.isPublic,
      });
      addFolderToList(res);
      toast({ title: 'Storage', description: 'Folder created' });
      form.reset();
      onOpenChange(false);
    } catch {
      toast({
        title: 'Storage',
        description: 'Failed to create folder. It may already exist.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={v => {
        if (!v) form.reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create Folder</DialogTitle>
          <DialogDescription>
            Create a new folder in the current directory.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Folder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="my-folder" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormLabel className="mt-0">Public</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
