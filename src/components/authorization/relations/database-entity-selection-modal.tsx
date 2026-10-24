'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { getSchemaDocs } from '@/lib/api/database';
import { isObject } from 'lodash';

interface DatabaseEntitySelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: string;
  onSelect: (entityId: string) => void;
  title?: string;
  description?: string;
}

const ITEMS_PER_PAGE = 10;

export default function DatabaseEntitySelectionModal({
  open,
  onOpenChange,
  entityType,
  onSelect,
  title,
  description,
}: Readonly<DatabaseEntitySelectionModalProps>) {
  const [docs, setDocs] = useState<({ _id: string } & unknown)[]>([]);
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = useMemo(() => Math.ceil(count / ITEMS_PER_PAGE), [count]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // Reset selected entity and page when the modal opens
  useEffect(() => {
    if (open) {
      setSelectedEntityId(null);
      setCurrentPage(1);
      setSearchTerm('');
    }
  }, [open]);

  const fetchData = useCallback(
    (page: number, term?: string) => {
      getSchemaDocs(
        entityType,
        term
          ? {
              query: { _id: term },
            }
          : undefined,
        { skip: (page - 1) * ITEMS_PER_PAGE, limit: ITEMS_PER_PAGE }
      ).then(res => {
        setDocs(res.documents);
        setCount(res.count);
      });
    },
    [entityType]
  );

  useEffect(() => {
    fetchData(currentPage, searchTerm);
  }, [entityType, currentPage, searchTerm]);

  // Get display fields based on entity type
  const displayFields = useMemo(() => {
    // Get all keys except id
    const sampleEntity = docs?.[0] ?? {};
    return Object.keys(sampleEntity).filter(key => key !== '_id');
  }, [docs]);

  const handleSelect = () => {
    if (selectedEntityId) {
      onSelect(selectedEntityId);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[80vw] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title ?? `Select ${entityType}`}</DialogTitle>
          <DialogDescription>
            {description ??
              `Choose a ${entityType.toLowerCase()} entity from the database`}
          </DialogDescription>
        </DialogHeader>

        <div className="relative my-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${entityType.toLowerCase()}...`}
            className="pl-8"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when search changes
            }}
          />
        </div>

        <ScrollArea className="border rounded-md h-[60vh] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>_id</TableHead>
                {displayFields.map(field => (
                  <TableHead key={field}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2 + displayFields.length}
                    className="h-24 text-center"
                  >
                    No entities found
                  </TableCell>
                </TableRow>
              ) : (
                docs.map(entity => (
                  <TableRow
                    key={entity._id}
                    className="cursor-pointer hover:bg-accent/50"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedEntityId === entity._id}
                        onCheckedChange={() => setSelectedEntityId(entity._id)}
                        aria-label={`Select ${entity._id}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {entity._id}
                    </TableCell>
                    {displayFields.map(field => (
                      <TableCell key={field} className="max-w-[250px] truncate">
                        {isObject(entity[field as keyof typeof entity])
                          ? JSON.stringify(entity[field as keyof typeof entity])
                          : entity[field as keyof typeof entity]?.toString()}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        {totalPages > 1 && (
          <div className="flex justify-between items-center border-t pt-4 mt-4">
            <div className="text-sm text-muted-foreground">
              Showing{' '}
              {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, docs.length)} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, docs.length)} of {count}{' '}
              entities
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {totalPages <= 5 ? (
                // Show all pages if 5 or fewer
                Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  )
                )
              ) : (
                // Show a subset of pages with ellipsis for many pages
                <>
                  <Button
                    variant={currentPage === 1 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    className="w-8 h-8 p-0"
                  >
                    1
                  </Button>

                  {currentPage > 3 && <span className="mx-1">...</span>}

                  {currentPage > 2 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="w-8 h-8 p-0"
                    >
                      {currentPage - 1}
                    </Button>
                  )}

                  {currentPage !== 1 && currentPage !== totalPages && (
                    <Button variant="default" size="sm" className="w-8 h-8 p-0">
                      {currentPage}
                    </Button>
                  )}

                  {currentPage < totalPages - 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="w-8 h-8 p-0"
                    >
                      {currentPage + 1}
                    </Button>
                  )}

                  {currentPage < totalPages - 2 && (
                    <span className="mx-1">...</span>
                  )}

                  <Button
                    variant={currentPage === totalPages ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-8 h-8 p-0"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(prev => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!selectedEntityId}>
            Select Entity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
