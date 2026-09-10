'use client';

import { ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const CLIENT_SNIPPET = `const socket = io(\`\${SOCKET_URL}/events/\`, {
  path: '/realtime',
  extraHeaders: { authorization: \`Bearer \${accessToken}\` },
});
socket.emit('subscribe', relayId, resourceId);
socket.on('order-updated', payload => {});
socket.emit('unsubscribe', relayId, resourceId);`;

const STEPS = [
  {
    title: 'Bus event',
    body: 'A module publishes JSON on an exact Redis channel — for example database realtime or a custom module.',
  },
  {
    title: 'Active relay',
    body: 'The matching relay reads the resource id from the payload and renders the message template.',
  },
  {
    title: 'ReBAC subscribe',
    body: 'Clients never pick a room name. Subscribe succeeds only if the user has the relay permission on that resource.',
  },
  {
    title: 'Socket emit',
    body: 'Router emits socketEvent to the hashed /events/ room. Delivery is ephemeral — missed events are gone.',
  },
] as const;

const SCOPE = [
  {
    title: 'Use when',
    body: 'You already publish JSON on an exact Redis bus channel and need live, per-resource UI updates with a ReBAC check.',
  },
  {
    title: 'Skip when',
    body: 'You need replay, history, guaranteed delivery, wildcard channels, or a broadcast with no permission check. Relays are not a queue.',
  },
  {
    title: 'Requires',
    body: 'Router sockets enabled, the Authorization module available, and something publishing on that exact channel.',
  },
] as const;

interface EventRelayDocsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventRelayDocs({ open, onOpenChange }: EventRelayDocsProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <Card id="event-relay-docs" className="overflow-hidden">
        <CollapsibleTrigger
          className={cn(
            'flex min-h-10 w-full cursor-pointer items-center justify-between gap-4 px-4 py-3 text-left',
            'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            '[&[data-state=open]>svg]:rotate-180'
          )}
        >
          <span className="min-w-0">
            <span className="block text-sm font-medium text-foreground">
              How Event Relays work
            </span>
            <span className="mt-0.5 block text-sm text-pretty text-muted-foreground">
              Forward an exact bus event to permission-scoped socket
              subscribers. Not a queue, and not a generic websocket broadcast.
            </span>
          </span>
          <ChevronDown
            aria-hidden
            className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200"
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="space-y-6 border-t border-border/60 px-4 py-4">
            <section>
              <h3 className="text-sm font-medium text-foreground">Scope</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {SCOPE.map(item => (
                  <div
                    key={item.title}
                    className="rounded-md border border-border/60 bg-muted/30 p-3"
                  >
                    <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                      {item.title}
                    </p>
                    <p className="mt-1.5 text-sm text-pretty text-foreground">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-medium text-foreground">
                How a message moves
              </h3>
              <ol className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {STEPS.map((step, index) => (
                  <li key={step.title} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-background font-mono text-xs tabular-nums text-muted-foreground slashed-zero">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {step.title}
                      </p>
                      <p className="mt-1 text-sm text-pretty text-muted-foreground">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h3 className="text-sm font-medium text-foreground">
                Configure a relay
              </h3>
              <p className="mt-1 text-sm text-pretty text-muted-foreground">
                Example: notify clients when an Order document changes.
              </p>
              <dl className="mt-3 divide-y divide-border/60 rounded-md border border-border/60">
                <Field
                  name="busEvent"
                  value="database:change:Order"
                  hint="Exact Redis channel. Wildcards are rejected."
                />
                <Field
                  name="socketEvent"
                  value="order-updated"
                  hint="Name emitted on /events/. Reserved names like subscribe are blocked."
                />
                <Field
                  name="resourceType / permission"
                  value="Order / read"
                  hint="ReBAC check on subscribe: User can read Order:{id}."
                />
                <Field
                  name="resourceIdPath"
                  value="_id or documentId"
                  hint="Dot path into the bus JSON. Match the publisher’s payload."
                />
                <Field
                  name="messageTemplate"
                  value={'{ "id": "{{payload._id}}" }'}
                  hint="JSON with {{payload.path}} placeholders against the bus payload."
                />
              </dl>
            </section>

            <section>
              <h3 className="text-sm font-medium text-foreground">
                Subscribe from a client
              </h3>
              <p className="mt-1 text-sm text-pretty text-muted-foreground">
                Connect to <Code>{'/events/'}</Code> with{' '}
                <Code>{'path: /realtime'}</Code> and a user bearer token. Then
                subscribe with the relay id and resource id.
              </p>
              <pre className="mt-3 overflow-x-auto rounded-md bg-muted p-3 font-mono text-[11px] leading-5 text-foreground slashed-zero">
                {CLIENT_SNIPPET}
              </pre>
            </section>

            <section>
              <h3 className="text-sm font-medium text-foreground">Limits</h3>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-pretty text-muted-foreground">
                <li>
                  Bus channels must match exactly. Patterns like{' '}
                  <Code>{'database:change:*'}</Code> are not supported.
                </li>
                <li>
                  Subscribe fails closed if Authorization is unavailable or the
                  user lacks permission.
                </li>
                <li>
                  Turn a relay off with Active to stop forwarding without
                  deleting it. Deleting drops current subscribers immediately.
                </li>
              </ul>
            </section>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function Field({
  name,
  value,
  hint,
}: {
  name: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="grid gap-1 px-3 py-2.5 sm:grid-cols-[minmax(0,11rem)_1fr]">
      <dt className="font-mono text-xs slashed-zero text-muted-foreground">
        {name}
      </dt>
      <dd className="min-w-0">
        <Code>{value}</Code>
        <p className="mt-1 text-sm text-pretty text-muted-foreground">{hint}</p>
      </dd>
    </div>
  );
}

function Code({ children }: { children: string }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs slashed-zero">
      {children}
    </code>
  );
}
