'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  RefreshCcw,
  Search,
  Trash2,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { Relation, ResourceDefinition } from '@/lib/models/authorization';

type Props = {
  relations: Relation[];
  count: number;
  resources: ResourceDefinition[];
  fetchRelationsAction: (
    page: number,
    opts?: {
      search?: string;
      subjectType?: string;
      resourceType?: string;
    }
  ) => Promise<{ relations: Relation[]; count: number }>;
  deleteRelationAction: (relationId: string) => Promise<void>;
};

const ITEMS_PER_PAGE = 10;

export default function RelationsList({
  relations: initialRelations,
  count: initialCount,
  resources,
  fetchRelationsAction,
  deleteRelationAction,
}: Readonly<Props>) {
  const [relations, setRelations] = useState<Relation[]>(initialRelations);
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);
  const [subjectTypeFilter, setSubjectTypeFilter] = useState<
    string | undefined
  >(undefined);
  const [targetTypeFilter, setTargetTypeFilter] = useState<string | undefined>(
    undefined
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isValidSearch, setIsValidSearch] = useState(true);
  const [count, setCount] = useState(initialCount);
  const [relationToDelete, setRelationToDelete] = useState<string | null>(null);
  // Calculate pagination
  const totalPages = useMemo(() => Math.ceil(count / ITEMS_PER_PAGE), [count]);
  const resourceTypes = useMemo(
    () => resources.map(resource => resource.name),
    [resources]
  );

  // Filter relations based on search term and type filters
  useEffect(() => {
    fetchRelationsAction(1, {
      search: searchTerm,
      subjectType: subjectTypeFilter === 'any' ? undefined : subjectTypeFilter,
      resourceType: targetTypeFilter === 'any' ? undefined : targetTypeFilter,
    }).then(data => {
      'use client';
      setRelations(data.relations);
      setCurrentPage(1);
      setCount(data.count);
    });
  }, [searchTerm, subjectTypeFilter, targetTypeFilter]);

  // Handle deleting a relation
  const handleDeleteRelation = async (relationId: string) => {
    try {
      setIsDeleting(true);
      // In a real app, this would be an API call
      await deleteRelationAction(relationId);

      // Remove the relation from the list
      setRelations(prevRelations =>
        prevRelations.filter(relation => relation._id !== relationId)
      );
      setRelationToDelete(null);
    } catch (error) {
      console.error('Failed to delete relation:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm(undefined);
    setSubjectTypeFilter(undefined);
    setTargetTypeFilter(undefined);
    setCurrentPage(1);
  };

  // Validate if the search term follows the tuple format or is part of it
  const validateSearchTerm = (term: string): boolean => {
    if (term === '') return true;

    // Simple validation - check if it contains at least one of the special characters
    // or if it's a valid component of a tuple
    const hasSpecialChar =
      term.includes(':') || term.includes('#') || term.includes('@');

    // Check if it's a valid component (subject type, subject ID, relation, target type, target ID)
    const isValidComponent = relations.some(
      relation =>
        relation.subjectType.toLowerCase().includes(term.toLowerCase()) ||
        relation.subjectId.toLowerCase().includes(term.toLowerCase()) ||
        relation.relation.toLowerCase().includes(term.toLowerCase()) ||
        relation.resourceType.toLowerCase().includes(term.toLowerCase()) ||
        relation.resourceId.toLowerCase().includes(term.toLowerCase())
    );

    return hasSpecialChar || isValidComponent;
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Button>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Re-index
        </Button>
        <Link href="/authorization/relations/create">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Relation
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Entity Relations</CardTitle>
              <CardDescription>
                View and manage relations between entities
              </CardDescription>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex flex-col">
                <div className="text-sm font-medium mb-1">Subject Type</div>
                <Select
                  value={subjectTypeFilter}
                  onValueChange={setSubjectTypeFilter}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent className={'bg-background'}>
                    <SelectItem value="any">Any</SelectItem>
                    {resourceTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col">
                <div className="text-sm font-medium mb-1">Target Type</div>
                <Select
                  value={targetTypeFilter}
                  onValueChange={setTargetTypeFilter}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent className={'bg-background'}>
                    <SelectItem value="any">Any</SelectItem>
                    {resourceTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                className={'mt-5'}
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </div>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by relation tuple (e.g., User:user-123#member@Team)"
              className={`pl-8 ${!isValidSearch ? 'border-destructive' : ''}`}
              value={searchTerm}
              onChange={e => {
                const newTerm = e.target.value;
                setSearchTerm(newTerm);
                setIsValidSearch(validateSearchTerm(newTerm));
                setCurrentPage(1); // Reset to first page when search changes
              }}
            />
            {!isValidSearch && (
              <div className="text-destructive text-sm mt-1">
                Search must be part of a relation tuple:
                SubjectType:SubjectId#relation@TargetType:TargetId
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            Relation tuple format:
            SubjectType:SubjectId#relation@TargetType:TargetId
          </div>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Relation</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Relation Tuple</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No relations found
                    </TableCell>
                  </TableRow>
                ) : (
                  relations.map(relation => (
                    <TableRow key={relation._id}>
                      <TableCell>
                        <div className="font-medium">
                          {relation.subjectType}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {relation.subjectId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{relation.relation}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {relation.resourceType}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {relation.resourceId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {relation.computedTuple}
                        </code>
                      </TableCell>
                      <TableCell className="text-right">
                        {new Date(relation.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setRelationToDelete(relation._id)}
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>

        {totalPages > 1 && (
          <CardFooter className="flex justify-between items-center border-t px-6 py-4">
            <div className="text-sm text-muted-foreground">
              Showing{' '}
              {Math.min(
                (currentPage - 1) * ITEMS_PER_PAGE + 1,
                relations.length
              )}{' '}
              to {Math.min(currentPage * ITEMS_PER_PAGE, relations.length)} of{' '}
              {count} relations
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
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
          </CardFooter>
        )}
      </Card>

      {/*Delete Confirmation Dialog */}
      <Dialog
        open={!!relationToDelete}
        onOpenChange={open => !open && setRelationToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Relation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this relation? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRelationToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                relationToDelete && handleDeleteRelation(relationToDelete)
              }
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
