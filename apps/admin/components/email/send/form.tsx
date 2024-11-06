'use client';

import { useForm, useWatch } from 'react-hook-form';
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
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as handlebars from 'handlebars';

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
  const [variables, setVariables] = useState<string[]>([]);
  const [template, setTemplate] = useState<string | undefined>(undefined);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });

  useEffect(() => {
    const templateName = form.watch('templateName');
    const selected = templates.templateDocuments.find(
      t => t.name === templateName
    );
    form.reset({
      sender: selected?.sender,
      subject: selected?.subject,
      body: selected?.body,
      templateName,
    });
    setTemplate(selected?.body);
    setVariables(selected?.variables || []);
  }, [form.watch('templateName')]);

  useEffect(() => {
    const watchVariables = form.watch('variables');
    if (!watchVariables) return;
    const compiledTemplate = handlebars.compile(template)(watchVariables);
    form.setValue('body', compiledTemplate, {
      shouldValidate: true,
    });
  }, [form.watch('variables')]);

  const body = useWatch({
    control: form.control,
    name: 'body',
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
        <FormField
          control={form.control}
          name="templateName"
          render={({ field }) => (
            <FormItem className={'w-5/12'}>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className={'bg-white dark:bg-popover'}>
                  {templates.templateDocuments.map(template => (
                    <SelectItem key={template._id} value={template.name}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
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

        {form.watch('templateName') && variables && (
          <div className="grid grid-cols-4 gap-5">
            {variables.map(variable => (
              <div className="space-y-1">
                <span className="text-sm text-accent-foreground">
                  {variable}
                </span>
                <Input
                  className={'text-accent-foreground border-muted'}
                  onChange={e => {
                    form.setValue(
                      'variables',
                      {
                        ...form.getValues('variables'),
                        [variable]: e.currentTarget.value,
                      },
                      { shouldValidate: true }
                    );
                  }}
                />
              </div>
            ))}
          </div>
        )}
        {!!form.watch('templateName') ? (
          <iframe srcDoc={body} className="bg-white"></iframe>
        ) : (
          <TextAreaField
            label={''}
            fieldName={'body'}
            placeholder="Type here..."
            className="h-96"
          />
        )}
        <Button type="submit" className="w-fit">
          Send Email
        </Button>
      </form>
    </Form>
  );
};
