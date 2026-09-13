'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '@/lib/hooks/use-toast';
import { getAdminSettings } from '@/lib/api/settings';
import { getRouterSettings } from '@/lib/api/router';
import {
  deriveAdminSocketUrl,
  deriveClientSocketUrl,
} from '@/lib/realtime/adminSocketUrl';
import {
  DATABASE_SOCKET_LISTEN_EVENTS,
  DATABASE_SOCKET_PATH,
  buildAdminJavascriptSnippet,
  buildClientJavascriptSnippet,
  buildPostmanConnection,
  socketEndpoint,
} from '@/lib/realtime/connection-snippets';

const DEFAULT_ADMIN_SOCKET = 'http://localhost:3031';
const DEFAULT_CLIENT_SOCKET = 'http://localhost:3001';

type LiveUpdateSnippetsProps = {
  schemaName: string;
  realtimeEnabled: boolean;
  cmsReadEnabled: boolean;
  authorizationEnabled: boolean;
};

export function LiveUpdateSnippets({
  schemaName,
  realtimeEnabled,
  cmsReadEnabled,
  authorizationEnabled,
}: LiveUpdateSnippetsProps) {
  const [adminSocketUrl, setAdminSocketUrl] =
    React.useState(DEFAULT_ADMIN_SOCKET);
  const [clientSocketUrl, setClientSocketUrl] = React.useState(
    DEFAULT_CLIENT_SOCKET
  );

  React.useEffect(() => {
    let cancelled = false;
    void Promise.all([getAdminSettings(), getRouterSettings()])
      .then(([admin, router]) => {
        if (cancelled) return;
        setAdminSocketUrl(
          safeSocketUrl(
            admin?.config?.hostUrl,
            deriveAdminSocketUrl,
            DEFAULT_ADMIN_SOCKET
          )
        );
        setClientSocketUrl(
          safeSocketUrl(
            router?.config?.hostUrl,
            deriveClientSocketUrl,
            DEFAULT_CLIENT_SOCKET
          )
        );
      })
      .catch(() => {
        if (cancelled) return;
        setAdminSocketUrl(DEFAULT_ADMIN_SOCKET);
        setClientSocketUrl(DEFAULT_CLIENT_SOCKET);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const clientSnippet = buildClientJavascriptSnippet({
    socketUrl: clientSocketUrl,
    schemaName,
    documentScoped: authorizationEnabled,
  });
  const adminSnippet = buildAdminJavascriptSnippet({
    socketUrl: adminSocketUrl,
    schemaName,
  });
  const postman = buildPostmanConnection({
    adminSocketUrl,
    schemaName,
  });

  return (
    <TooltipProvider delayDuration={250}>
      <div className="space-y-4 border-t pt-4">
        <div>
          <h4 className="text-sm font-medium">Connect to change events</h4>
          <p className="text-sm text-muted-foreground">
            Subscribe this schema on the{' '}
            <code className="font-mono">/database/</code> Socket.IO namespace.
            Events are metadata only — no document body.
          </p>
        </div>

        {!realtimeEnabled && (
          <p className="text-xs text-muted-foreground">
            Enable live updates and save before this socket will receive events.
          </p>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <CopyRow label="Client URL" value={socketEndpoint(clientSocketUrl)} />
          <CopyRow label="Admin URL" value={socketEndpoint(adminSocketUrl)} />
          <CopyRow label="Handshake path" value={DATABASE_SOCKET_PATH} />
          <CopyRow
            label="Listen for"
            value={DATABASE_SOCKET_LISTEN_EVENTS.join(', ')}
          />
        </div>

        <Tabs defaultValue="javascript" className="w-full">
          <TabsList className="h-9 w-full justify-start">
            <TabsTrigger value="javascript" className="cursor-pointer">
              JavaScript
            </TabsTrigger>
            <TabsTrigger value="postman" className="cursor-pointer">
              Postman
            </TabsTrigger>
            <TabsTrigger value="admin" className="cursor-pointer">
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="javascript" className="mt-3 space-y-3">
            {!cmsReadEnabled && (
              <p className="text-xs text-muted-foreground">
                CMS read is off, so client apps cannot subscribe. Turn on CRUD
                read, or use the Admin tab.
              </p>
            )}
            {authorizationEnabled && (
              <p className="text-xs text-muted-foreground">
                Authorization is on — client subscribe must include a document
                the user can read.
              </p>
            )}
            <SnippetBlock
              label="Client Socket.IO"
              value={clientSnippet}
              language="javascript"
            />
          </TabsContent>

          <TabsContent value="postman" className="mt-3 space-y-3">
            <ol className="list-decimal space-y-3 pl-5 text-sm">
              <li>
                New → Socket.IO Request. Postman has no Handshake Auth field —
                put the token on Headers instead.
              </li>
              <li>
                <CopyRow label="Server URL" value={postman.serverUrl} />
              </li>
              <li>
                Settings: handshake path{' '}
                <code className="font-mono">{postman.path}</code>, client
                version {postman.clientVersion}.
              </li>
              <li>
                Headers:
                <div className="mt-2 space-y-2">
                  {postman.headers.map(header => (
                    <CopyRow
                      key={header.key}
                      label={header.key}
                      value={`${header.key}: ${header.value}`}
                      display={header.value}
                    />
                  ))}
                </div>
              </li>
              <li>
                Listen for{' '}
                {postman.listenFor.map(event => (
                  <code key={event} className="mr-1 font-mono">
                    {event}
                  </code>
                ))}
                , click Connect, then emit:
              </li>
            </ol>
            <SnippetBlock
              label={`Emit ${postman.subscribeEvent}`}
              value={postman.subscribeBody}
              language="json"
            />
            <p className="text-xs text-muted-foreground">
              Event name must be exactly{' '}
              <code className="font-mono">{postman.subscribeEvent}</code>,
              format JSON. Run Admin login first so{' '}
              <code className="font-mono">adminToken</code> is set.
            </p>
          </TabsContent>

          <TabsContent value="admin" className="mt-3 space-y-3">
            <p className="text-xs text-muted-foreground">
              Same handshake as Data Explorer. Use an admin JWT, or a 30-second{' '}
              <code className="font-mono">POST /realtime/ticket</code> token in{' '}
              <code className="font-mono">auth.token</code>.
            </p>
            <SnippetBlock
              label="Admin Socket.IO"
              value={adminSnippet}
              language="javascript"
            />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}

function CopyRow({
  label,
  value,
  display,
}: {
  label: string;
  value: string;
  display?: string;
}) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-3 rounded-md border px-3 py-2">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-mono text-xs slashed-zero">
          {display ?? value}
        </p>
      </div>
      <CopyButton value={value} label={label} />
    </div>
  );
}

function SnippetBlock({
  label,
  value,
  language,
}: {
  label: string;
  value: string;
  language: 'javascript' | 'json';
}) {
  return (
    <div className="overflow-hidden rounded-md border bg-code-bg">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <CopyButton value={value} label={label} />
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-xs slashed-zero text-code-text">
        <code data-language={language}>{value}</code>
      </pre>
    </div>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast({ title: `${label} copied` });
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({
        title: 'Copy failed',
        variant: 'destructive',
      });
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 cursor-pointer"
          onClick={() => void handleCopy()}
          aria-label={copied ? `${label} copied` : `Copy ${label}`}
        >
          {copied ? (
            <Check className="h-4 w-4 text-status-healthy" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{copied ? 'Copied' : `Copy ${label}`}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function safeSocketUrl(
  hostUrl: unknown,
  derive: (url: string) => string,
  fallback: string
): string {
  if (typeof hostUrl !== 'string' || hostUrl.trim() === '') return fallback;
  try {
    return derive(hostUrl);
  } catch {
    return fallback;
  }
}
