import { Database } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full text-center text-muted-foreground">
      <div>
        <Database className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <h3 className="text-lg font-medium">No Query Selected</h3>
        <p>Select a query from the list or create a new one</p>
      </div>
    </div>
  );
}
