import { z } from 'zod';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Card } from '@/components/ui/card';
import { PlusIcon } from 'lucide-react';
import SwitchField from '@/components/ui/form-inputs/SwitchField';

const formSchema = z.object({
  name: z.string().min(1),
  isPublic: z.boolean().default(false),
  // authorization: z.object({
  //   enabled: z.boolean(),
  // }),
});

type FolderFormProps = {
  editable: boolean;
  action: (
    data: z.infer<typeof formSchema>,
    form: UseFormReturn<z.infer<typeof formSchema>>
  ) => void;
};

export const BaseFolderForm = ({ action, editable }: FolderFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button>
          <Card className="h-36 w-56 flex items-center justify-center gap-x-4">
            <PlusIcon width={16} height={16} />
            <span className="font-semibold text-xl">Create Folder</span>
          </Card>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Folder</DialogTitle>
          <DialogDescription>
            Create a folder in this directory. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async data => action?.(data, form))}
              className="w-full space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Folder Name</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!editable}
                        title={'Folder Name'}
                        placeholder={'Enter a value'}
                        className={'text-accent-foreground'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SwitchField
                label={'isPublic'}
                fieldName={'isPublic'}
                disabled={!editable}
              />
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
