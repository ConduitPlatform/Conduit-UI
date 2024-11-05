'use client';

import { useForm } from 'react-hook-form';
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
import { getTemplates, sendEmail } from '@/lib/api/email';
import { Input } from '@/components/ui/input';
import { Participant } from '@/components/email/send/participants';
import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextAreaField } from '@/components/ui/form-inputs/TextAreaField';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/use-toast';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email(),
  sender: z.string().email(),
  subject: z.string().optional(),
  body: z.string().optional(),
  templateName: z.string().optional(),
  variables: z.record(z.string()).optional(),
});

type SendEmailFormProps = {
  templates: Awaited<ReturnType<typeof getTemplates>>;
};
export const SendEmailForm = ({ templates }: SendEmailFormProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [sender, setSender] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState<string | undefined>(undefined);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          async data => {
            await sendEmail(data)
              .then(() => router.push('/email'))
              .catch(err =>
                toast({
                  title: 'Email',
                  description: err.message,
                })
              );
          },
          errors => console.log('errors: ', errors)
        )}
        className="flex flex-col space-y-5"
      >
        <div className="flex space-x-2 items-baseline">
          <FormLabel className="text-lg text-muted-foreground">From</FormLabel>
          {!!sender ? (
            <div className="flex space-x-2">
              <Participant fullName={form.getValues('sender')} />
              <button
                onClick={() => {
                  setSender(undefined);
                  form.setValue('sender', '');
                }}
                type="button"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <FormField
              control={form.control}
              name="sender"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      className={'text-accent-foreground border-muted'}
                      {...field}
                      onBlur={() => setSender(form.watch('sender'))}
                      onKeyDown={e => {
                        e.stopPropagation();
                        if (e.key === 'Enter') setSender(form.watch('sender'));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        <div className="flex space-x-2 items-baseline">
          <FormLabel className="text-lg text-muted-foreground">To</FormLabel>
          {!!email ? (
            <div className="flex space-x-2">
              <Participant fullName={form.getValues('email')} />
              <button
                type="button"
                onClick={() => {
                  setEmail(undefined);
                  form.setValue('email', '');
                }}
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      className={'text-accent-foreground border-muted'}
                      {...field}
                      onBlur={() => setEmail(form.watch('email'))}
                      onKeyDown={e => {
                        e.stopPropagation();
                        if (e.key === 'Enter') setEmail(form.watch('email'));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        <hr className="py-3" />
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem className="flex space-x-2 items-baseline">
              <FormLabel className="text-lg text-muted-foreground">
                Subject
              </FormLabel>
              <FormControl>
                <Input
                  className={'text-accent-foreground border-muted'}
                  {...field}
                  onKeyDown={e => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <TextAreaField
          label={''}
          fieldName={'body'}
          placeholder="Type here..."
          className="h-96"
        />
        <Button type="submit" className="w-fit">
          Send Email
        </Button>
      </form>
    </Form>
  );
};
