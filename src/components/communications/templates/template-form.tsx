'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommunicationChannel } from '@/lib/models/communications/templates';
import { cn } from '@/lib/utils';

const channelOptions: { id: CommunicationChannel; label: string }[] = [
  { id: 'email', label: 'Email' },
  { id: 'push', label: 'Push' },
  { id: 'sms', label: 'SMS' },
];

export const communicationTemplateSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    templateDescription: z.string().optional(),
    channels: z.array(z.enum(['email', 'push', 'sms'])).min(1),
    email: z
      .object({
        subject: z.string().optional(),
        body: z.string().optional(),
        sender: z.string().optional(),
      })
      .optional(),
    push: z
      .object({
        title: z.string().optional(),
        body: z.string().optional(),
      })
      .optional(),
    sms: z
      .object({
        message: z.string().optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.channels.includes('email')) {
      if (!data.email?.subject?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Email subject is required',
          path: ['email', 'subject'],
        });
      }
      if (!data.email?.body?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Email body is required',
          path: ['email', 'body'],
        });
      }
    }
    if (data.channels.includes('push')) {
      if (!data.push?.title?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Push title is required',
          path: ['push', 'title'],
        });
      }
      if (!data.push?.body?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Push body is required',
          path: ['push', 'body'],
        });
      }
    }
    if (data.channels.includes('sms') && !data.sms?.message?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'SMS message is required',
        path: ['sms', 'message'],
      });
    }
  });

export type CommunicationTemplateFormValues = z.infer<
  typeof communicationTemplateSchema
>;

export function CommunicationTemplateForm({
  defaultValues,
  onSubmit,
  submitLabel,
  disableName,
}: {
  defaultValues?: Partial<CommunicationTemplateFormValues>;
  onSubmit: (values: CommunicationTemplateFormValues) => Promise<void>;
  submitLabel: string;
  disableName?: boolean;
}) {
  const form = useForm<CommunicationTemplateFormValues>({
    resolver: zodResolver(communicationTemplateSchema),
    defaultValues: {
      name: '',
      templateDescription: '',
      channels: ['email'],
      email: { subject: '', body: '', sender: '' },
      push: { title: '', body: '' },
      sms: { message: '' },
      ...defaultValues,
    },
  });

  const channels = form.watch('channels');

  const toggleChannel = (channel: CommunicationChannel, checked: boolean) => {
    const current = form.getValues('channels');
    if (checked) {
      form.setValue('channels', [...new Set([...current, channel])], {
        shouldValidate: true,
      });
      return;
    }
    form.setValue(
      'channels',
      current.filter(c => c !== channel),
      { shouldValidate: true }
    );
  };

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(values => onSubmit(values))}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={disableName} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="templateDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Optional summary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <FormLabel>Channels</FormLabel>
          <div className="flex flex-wrap gap-4">
            {channelOptions.map(option => (
              <label
                key={option.id}
                className={cn(
                  'flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
                  channels.includes(option.id) && 'border-primary bg-muted/40'
                )}
              >
                <Checkbox
                  checked={channels.includes(option.id)}
                  onCheckedChange={checked =>
                    toggleChannel(option.id, checked === true)
                  }
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <Tabs defaultValue={channels[0] ?? 'email'}>
          <TabsList>
            {channels.includes('email') && (
              <TabsTrigger value="email">Email</TabsTrigger>
            )}
            {channels.includes('push') && (
              <TabsTrigger value="push">Push</TabsTrigger>
            )}
            {channels.includes('sms') && (
              <TabsTrigger value="sms">SMS</TabsTrigger>
            )}
          </TabsList>

          {channels.includes('email') && (
            <TabsContent value="email" className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="email.sender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sender</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="no-reply" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email.subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Hello {{name}}" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email.body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={8}
                        placeholder="<p>Hello {{name}}</p>"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          )}

          {channels.includes('push') && (
            <TabsContent value="push" className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="push.title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Welcome {{name}}" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="push.body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          )}

          {channels.includes('sms') && (
            <TabsContent value="sms" className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="sms.message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} placeholder="Hi {{name}}" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          )}
        </Tabs>

        <Button type="submit">{submitLabel}</Button>
      </form>
    </Form>
  );
}
