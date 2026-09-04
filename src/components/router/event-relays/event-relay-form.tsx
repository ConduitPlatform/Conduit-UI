'use client';

import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { rhfZodResolver } from '@/lib/zod-form';
import { Form } from '@/components/ui/form';
import { InputField } from '@/components/ui/form-inputs/InputField';
import SwitchField from '@/components/ui/form-inputs/SwitchField';
import { CodeField } from '@/components/ui/form-inputs/CodeField';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  EventRelayFormSchema,
  EventRelayFormValues,
  parseJsonField,
} from '@/components/router/event-relays/zod';
import { previewEventRelay } from '@/lib/event-relays/preview';
import { EventRelay, EventRelayWriteRequest } from '@/lib/models/Router';

const DEFAULT_TEMPLATE = '{\n  "id": "{{payload._id}}"\n}';
const DEFAULT_SAMPLE =
  '{\n  "_id": "64f1c0a2b4d0e1f2a3b4c5d6",\n  "status": "paid"\n}';

interface EventRelayFormProps {
  relay?: EventRelay | null;
  onSubmit: (data: EventRelayWriteRequest) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

export function EventRelayForm({
  relay,
  onSubmit,
  onCancel,
  isSaving,
}: EventRelayFormProps) {
  const form = useForm<EventRelayFormValues>({
    resolver: rhfZodResolver(EventRelayFormSchema),
    defaultValues: {
      name: relay?.name ?? '',
      notes: relay?.notes ?? '',
      active: relay?.active ?? true,
      busEvent: relay?.busEvent ?? '',
      socketEvent: relay?.socketEvent ?? '',
      resourceType: relay?.resourceType ?? '',
      resourceIdPath: relay?.resourceIdPath ?? '_id',
      permission: relay?.permission ?? 'read',
      messageTemplate: relay
        ? JSON.stringify(relay.messageTemplate, null, 2)
        : DEFAULT_TEMPLATE,
      samplePayload: DEFAULT_SAMPLE,
    },
  });

  const watched = useWatch({ control: form.control });
  const preview = useMemo(() => {
    try {
      const template = parseJsonField(
        watched.messageTemplate ?? '',
        'Message template'
      );
      const sample = parseJsonField(
        watched.samplePayload && watched.samplePayload.trim() !== ''
          ? watched.samplePayload
          : '{}',
        'Sample payload'
      );
      return previewEventRelay({
        resourceIdPath: watched.resourceIdPath || '_id',
        messageTemplate: template,
        samplePayload: sample,
      });
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }, [watched.messageTemplate, watched.samplePayload, watched.resourceIdPath]);

  const handleSubmit = form.handleSubmit(async values => {
    const messageTemplate = parseJsonField(
      values.messageTemplate,
      'Message template'
    );
    await onSubmit({
      name: values.name,
      notes: values.notes?.trim() ? values.notes.trim() : undefined,
      active: values.active,
      busEvent: values.busEvent,
      socketEvent: values.socketEvent,
      resourceType: values.resourceType,
      resourceIdPath: values.resourceIdPath,
      permission: values.permission,
      messageTemplate,
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField fieldName="name" label="Name" placeholder="Order paid" />
          <SwitchField fieldName="active" label="Active" />
        </div>
        <InputField
          fieldName="notes"
          label="Description"
          placeholder="Notify subscribers when an order is paid"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            fieldName="busEvent"
            label="Bus event"
            placeholder="database:update:Order"
            description="Exact Redis channel. Wildcards are not supported."
            classNames={{ input: 'font-mono slashed-zero' }}
          />
          <InputField
            fieldName="socketEvent"
            label="Socket event"
            placeholder="order-updated"
            description="Event name emitted on /events/"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <InputField
            fieldName="resourceType"
            label="Resource type"
            placeholder="Order"
          />
          <InputField
            fieldName="resourceIdPath"
            label="Resource ID path"
            placeholder="_id"
            description="Dot path on the bus payload"
          />
          <InputField
            fieldName="permission"
            label="Permission"
            placeholder="read"
            description="ReBAC action checked on subscribe"
          />
        </div>
        <CodeField
          fieldName="messageTemplate"
          label="Message template"
          language="json"
          placeholder={DEFAULT_TEMPLATE}
        />
        <CodeField
          fieldName="samplePayload"
          label="Sample payload"
          language="json"
          placeholder={DEFAULT_SAMPLE}
        />
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-medium text-foreground">Preview</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Local only. Nothing is published to the bus.
          </p>
          {preview.error ? (
            <p className="mt-3 text-sm text-destructive">{preview.error}</p>
          ) : (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-muted-foreground">
                Resource{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs slashed-zero">
                  {watched.resourceType || 'Type'}:{preview.resourceId}
                </code>
              </p>
              <pre className="max-h-40 overflow-auto rounded-md bg-muted p-3 font-mono text-xs slashed-zero text-foreground">
                {JSON.stringify(preview.payload, null, 2)}
              </pre>
            </div>
          )}
        </div>
        <Alert>
          <AlertTitle>Client contract</AlertTitle>
          <AlertDescription className="space-y-2 text-xs">
            <p>
              Connect to <code className="font-mono">/events/</code> with{' '}
              <code className="font-mono">path: /realtime</code> and a bearer
              token. Then emit{' '}
              <code className="font-mono">subscribe(relayId, resourceId)</code>.
            </p>
            <pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-[11px] leading-5 text-foreground slashed-zero">
              {`const socket = io(\`\${SOCKET_URL}/events/\`, {
  path: '/realtime',
  extraHeaders: { authorization: \`Bearer \${accessToken}\` },
});
socket.emit('subscribe', relayId, resourceId);
socket.on('${watched.socketEvent || 'your-event'}', payload => {});
socket.emit('unsubscribe', relayId, resourceId);`}
            </pre>
          </AlertDescription>
        </Alert>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
            <kbd className="ml-2 hidden sm:inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
              Esc
            </kbd>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {relay ? 'Save relay' : 'Create relay'}
            <kbd className="ml-2 hidden sm:inline-flex h-5 items-center rounded border border-primary-foreground/30 bg-primary-foreground/10 px-1.5 font-mono text-[10px]">
              ↵
            </kbd>
          </Button>
        </div>
      </form>
    </Form>
  );
}
