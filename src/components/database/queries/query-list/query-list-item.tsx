'use client';
import { Code, Search, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomEndpoint } from '@/lib/models/database/custom-endpoints';

interface QueryListItemProps {
  query: CustomEndpoint;
  isSelected: boolean;
  onClick: () => void;
  onDelete?: (id: string) => void;
}

export function QueryListItem({
  query,
  isSelected,
  onClick,
  onDelete,
}: Readonly<QueryListItemProps>) {
  const mapOperationToType = (operation: number) => {
    switch (operation) {
      case 0:
        return 'Read';
      case 1:
        return 'Mutation';
      case 2:
        return 'Update';
      case 3:
        return 'Delete';
      case 4:
        return 'Patch';
      default:
        return 'Unknown';
    }
  };
  return (
    <div
      className={`group flex items-center gap-1 p-3 mb-2 rounded-md cursor-pointer ${isSelected ? 'bg-accent' : 'hover:bg-accent'}`}
      onClick={onClick}
    >
      {query.operation === 0 ? (
        <Search className="h-4 w-4 shrink-0 text-status-info" />
      ) : (
        <Code className="h-4 w-4 shrink-0 text-status-healthy" />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{query.name}</div>
        <div className="text-xs text-muted-foreground truncate">
          {query.selectedSchemaName}
        </div>
      </div>
      {onDelete && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          aria-label={`Delete ${query.name}`}
          onClick={e => {
            e.stopPropagation();
            onDelete(query._id);
          }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
      <Badge
        variant={query.operation === 0 ? 'secondary' : 'outline'}
        className="shrink-0"
      >
        {mapOperationToType(query.operation)}
      </Badge>
    </div>
  );
}
