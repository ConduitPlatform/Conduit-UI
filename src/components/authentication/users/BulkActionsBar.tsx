'use client';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { BulkStatus } from '@/components/authentication/users/useBulkUserActions';

function progressLabel(
  status: Extract<BulkStatus, { kind: 'running' }>
): string {
  const verb =
    status.action === 'delete'
      ? 'Deleting'
      : status.action === 'block'
        ? 'Blocking'
        : 'Unblocking';
  return `${verb} ${status.done} / ${status.total}…`;
}

export function BulkActionsBar({
  count,
  blockCount,
  unblockCount,
  status,
  onBlock,
  onUnblock,
  onDelete,
  onClear,
}: Readonly<{
  count: number;
  blockCount: number;
  unblockCount: number;
  status: BulkStatus;
  onBlock: () => void;
  onUnblock: () => void;
  onDelete: () => void;
  onClear: () => void;
}>) {
  const running = status.kind === 'running';
  const failed = status.kind === 'finished' ? status.failed : [];

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-3 py-2"
      role="region"
      aria-label="Bulk actions"
    >
      <p className="text-sm tabular-nums text-muted-foreground">
        {running ? progressLabel(status) : `${count} selected`}
      </p>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {failed.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                {failed.length} failed
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <ul className="flex flex-col gap-2 text-sm">
                {failed.map(failure => (
                  <li key={failure.id}>
                    <p className="font-medium">{failure.label}</p>
                    <p className="text-pretty text-muted-foreground">
                      {failure.message}
                    </p>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBlock}
          disabled={running || blockCount === 0}
        >
          Block
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onUnblock}
          disabled={running || unblockCount === 0}
        >
          Unblock
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={running || count === 0}
        >
          Delete
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={running}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
