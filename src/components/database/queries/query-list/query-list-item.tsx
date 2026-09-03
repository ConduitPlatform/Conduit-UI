'use client';

import { MoreHorizontal, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  CustomEndpoint,
  OperationsEnum,
} from '@/lib/models/database/custom-endpoints';
import { getOperationMeta } from '@/components/database/queries/query-operations';
import { cn } from '@/lib/utils';

interface QueryListItemProps {
  query: CustomEndpoint;
  isSelected: boolean;
  onClick: () => void;
  onDelete?: (id: string, name: string) => void;
}

export function QueryListItem({
  query,
  isSelected,
  onClick,
  onDelete,
}: Readonly<QueryListItemProps>) {
  const meta = getOperationMeta(query.operation);
  const badgeVariant =
    query.operation === OperationsEnum.DELETE
      ? 'destructive'
      : query.operation === OperationsEnum.GET
        ? 'secondary'
        : 'outline';

  return (
    <div
      className={cn(
        'group mb-2 flex items-center gap-1 rounded-md',
        isSelected ? 'bg-accent' : 'hover:bg-accent/70'
      )}
    >
      <button
        type="button"
        onClick={onClick}
        aria-current={isSelected ? 'page' : undefined}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-md p-3 text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{query.name}</div>
          <div className="truncate font-mono text-xs text-muted-foreground">
            {meta.method} · {query.selectedSchemaName || 'No model'}
          </div>
        </div>
        <Badge variant={badgeVariant} className="shrink-0 font-normal">
          {meta.label}
        </Badge>
      </button>
      {onDelete && (
        <TooltipProvider delayDuration={300}>
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mr-1 size-8 shrink-0"
                    aria-label={`Actions for ${query.name}`}
                    onClick={event => event.stopPropagation()}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Query actions</TooltipContent>
            </Tooltip>
            <DropdownMenuContent
              align="end"
              onClick={event => event.stopPropagation()}
            >
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(query._id, query.name)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipProvider>
      )}
    </div>
  );
}
