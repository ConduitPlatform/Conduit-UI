import { useForm } from 'react-hook-form';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createContainer } from '@/lib/api/storage';
import { Input } from '@/components/ui/input';
import SwitchField from '@/components/ui/form-inputs/SwitchField';
import { useToast } from '@/lib/hooks/use-toast';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Container } from '@/lib/models/storage';

const formSchema = z.object({
  name: z.string().min(1),
  isPublic: z.boolean().optional(),
  // authorization: z.object({
  //   enabled: z.boolean(),
  // }),
});

export const CreateContainerDialog = ({
  callback,
}: {
  callback: (data: Container) => void;
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async data =>
          createContainer(data)
            .then(res => {
              toast({
                title: 'STORAGE',
                description: 'New Container Created',
              });
              callback(res);
              const params = new URLSearchParams(searchParams.toString());
              params.set('container', res.name);
              router.push(`${pathname}?${params.toString()}`);
            })
            .catch(() => {
              toast({
                title: 'STORAGE',
                description: 'Container already exists',
              });
            })
        )}
        className="space-y-4 mt-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Container Name</FormLabel>
              <FormControl>
                <Input
                  title={'Container Name'}
                  placeholder={'Enter a value'}
                  className={'text-accent-foreground'}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SwitchField label={'isPublic'} fieldName={'isPublic'} />
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
