'use client';
import { Code, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CustomEndpoint } from '@/lib/models/database/custom-endpoints';

interface QueryListItemProps {
  query: CustomEndpoint;
  isSelected: boolean;
  onClick: () => void;
}

export function QueryListItem({
  query,
  isSelected,
  onClick,
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
      className={`flex items-center p-3 mb-2 rounded-md cursor-pointer ${isSelected ? 'bg-accent' : 'hover:bg-accent'}`}
      onClick={onClick}
    >
      {query.operation === 0 ? (
        <Search className="w-4 h-4 mr-2 text-blue-500" />
      ) : (
        <Code className="w-4 h-4 mr-2 text-green-500" />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{query.name}</div>
        <div className="text-xs text-muted-foreground truncate">
          {query.selectedSchemaName}
        </div>
      </div>
      <Badge variant={query.operation === 0 ? 'secondary' : 'outline'}>
        {mapOperationToType(query.operation)}
      </Badge>
    </div>
  );
}
