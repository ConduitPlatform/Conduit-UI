'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from '@/lib/hooks/use-toast';
import type { PendingSchemas } from '@/lib/models/database';
import Link from 'next/link';
import {
  finalizeIntrospectionSchemasAction,
  runDatabaseIntrospectionAction,
} from './actions';

type Props = {
  initialPending: { schemas: PendingSchemas[]; count: number };
};

export function IntrospectionClient({ initialPending }: Props) {
  const [pending, setPending] = React.useState(initialPending.schemas);
  const [running, setRunning] = React.useState(false);
  const [finalizing, setFinalizing] = React.useState(false);

  React.useEffect(() => {
    setPending(initialPending.schemas);
  }, [initialPending.schemas]);

  const handleRun = async () => {
    setRunning(true);
    try {
      const msg = await runDatabaseIntrospectionAction();
      toast({ title: 'Introspection complete', description: String(msg) });
      window.location.reload();
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast({
        title: 'Introspection failed',
        description: err.message ?? 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setRunning(false);
    }
  };

  const handleFinalizeAll = async () => {
    if (pending.length === 0) return;
    setFinalizing(true);
    try {
      const msg = await finalizeIntrospectionSchemasAction(pending);
      toast({ title: 'Schemas finalized', description: String(msg) });
      window.location.reload();
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast({
        title: 'Finalize failed',
        description: err.message ?? 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Run introspection</CardTitle>
          <CardDescription>
            Scan the database for unknown collections and register them as
            pending schemas. Then finalize them into CMS models from the list
            below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={handleRun} disabled={running}>
            {running ? 'Running…' : 'Run introspection'}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/database/models-new">Back to models</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending schemas ({pending.length})</CardTitle>
          <CardDescription>
            Finalizing imports collections as CMS schemas (see server rules for
            naming).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No pending schemas. Run introspection or check an empty database.
            </p>
          ) : (
            <>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {pending.map(s => (
                  <li key={s._id}>{s.name}</li>
                ))}
              </ul>
              <Button
                variant="destructive"
                onClick={handleFinalizeAll}
                disabled={finalizing}
              >
                {finalizing ? 'Finalizing…' : 'Finalize all pending schemas'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
