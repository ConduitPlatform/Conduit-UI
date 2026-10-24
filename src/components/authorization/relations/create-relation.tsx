'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  ArrowRight,
  Database,
  PlusCircle,
  TriangleAlert,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ResourceSelectionModal from '@/components/authorization/resources/resource-selection-modal';
import DatabaseEntitySelectionModal from '@/components/authorization/relations/database-entity-selection-modal';
import { Badge } from '@/components/ui/badge';
import { getSchemas } from '@/lib/api/database';
import { ResourceDefinition } from '@/lib/models/authorization';
import { createRelation } from '@/lib/api/authorization';

type CreateRelationFormProps = {
  resourceTypes: { [key: string]: ResourceDefinition };
};

export default function CreateRelationForm({
  resourceTypes,
}: Readonly<CreateRelationFormProps>) {
  const router = useRouter();

  // State for creating a new relation
  const [subjectType, setSubjectType] = useState('');
  const [targetType, setTargetType] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [selectedRelation, setSelectedRelation] = useState('');
  const [availableRelations, setAvailableRelations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [subjectTypeHasDbSchema, setSubjectTypeHasDbSchema] = useState(false);
  const [targetTypeHasDbSchema, setTargetTypeHasDbSchema] = useState(false);

  // Modal states
  const [isSubjectTypeModalOpen, setIsSubjectTypeModalOpen] = useState(false);
  const [isTargetTypeModalOpen, setIsTargetTypeModalOpen] = useState(false);
  const [isSubjectEntityModalOpen, setIsSubjectEntityModalOpen] =
    useState(false);
  const [isTargetEntityModalOpen, setIsTargetEntityModalOpen] = useState(false);

  // Update available relations when subject or target type changes
  useEffect(() => {
    if (subjectType && targetType) {
      const targetRelations =
        resourceTypes[targetType as keyof typeof resourceTypes]?.relations ||
        {};

      // Find relations where the subject type is allowed
      const allowedRelations = Object.entries(targetRelations)
        .filter(([_, allowedTypes]) => {
          return (
            allowedTypes.includes(subjectType) || allowedTypes.includes('*')
          );
        })
        .map(([relation]) => relation);

      setAvailableRelations(allowedRelations);

      // Reset selected relation if it's no longer valid
      if (
        selectedRelation &&
        !allowedRelations.includes(selectedRelation) &&
        !allowedRelations.includes('*')
      ) {
        setSelectedRelation('');
      }
    } else {
      setAvailableRelations([]);
      setSelectedRelation('');
    }
  }, [subjectType, targetType]);

  useEffect(() => {
    getSchemas({ skip: 0, limit: 1000, search: subjectType }).then(res => {
      'use client';
      setSubjectTypeHasDbSchema(res.schemas?.length > 0);
    });
  }, [subjectType]);

  useEffect(() => {
    getSchemas({ skip: 0, limit: 1000, search: subjectType }).then(res => {
      'use client';
      setTargetTypeHasDbSchema(res.schemas?.length > 0);
    });
  }, [targetTypeHasDbSchema]);

  // Handle creating a new relation
  const handleCreateRelation = useCallback(async () => {
    // Validate inputs
    if (!subjectType) {
      setError('Subject type is required');
      return;
    }
    if (!targetType) {
      setError('Target type is required');
      return;
    }
    if (!subjectId) {
      setError('Subject ID is required');
      return;
    }
    if (!targetId) {
      setError('Target ID is required');
      return;
    }
    if (!selectedRelation) {
      setError('Relation is required');
      return;
    }

    // In a real app, this would be an API call
    setIsCreating(true);
    await createRelation({
      subject: `${subjectType}:${subjectId}`,
      relation: selectedRelation,
      resource: `${targetType}:${targetId}`,
    });
    router.push('/authorization/relations');
  }, [subjectType, targetType, subjectId, targetId, selectedRelation, router]);

  return (
    <div className="container mx-auto py-6">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push('/authorization/relations')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Relations List
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create New Relation</CardTitle>
          <CardDescription>
            Define a relation between two entities based on their types and the
            allowed relations
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject Selection */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Subject</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  The entity that will have the relation
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject-type">Subject Type</Label>
                <div className="flex gap-2">
                  <Input
                    id="subject-type"
                    value={subjectType}
                    readOnly
                    placeholder="Select subject type"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setIsSubjectTypeModalOpen(true)}
                  >
                    Select
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject-id">Subject ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="subject-id"
                    value={subjectId}
                    onChange={e => setSubjectId(e.target.value)}
                    placeholder={
                      subjectType
                        ? subjectTypeHasDbSchema
                          ? 'Select from database or enter ID'
                          : 'Enter subject ID'
                        : 'First select subject type'
                    }
                    disabled={!subjectType}
                    className="flex-1"
                  />
                  {subjectType && subjectTypeHasDbSchema && (
                    <Button
                      variant="outline"
                      onClick={() => setIsSubjectEntityModalOpen(true)}
                      disabled={!subjectType}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Browse
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Target Selection */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Target</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  The entity that will be related to the subject
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-type">Target Type</Label>
                <div className="flex gap-2">
                  <Input
                    id="target-type"
                    value={targetType}
                    readOnly
                    placeholder="Select target type"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setIsTargetTypeModalOpen(true)}
                  >
                    Select
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-id">Target ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="target-id"
                    value={targetId}
                    onChange={e => setTargetId(e.target.value)}
                    placeholder={
                      targetType
                        ? targetTypeHasDbSchema
                          ? 'Select from database or enter ID'
                          : 'Enter target ID'
                        : 'First select target type'
                    }
                    disabled={!targetType}
                    className="flex-1"
                  />
                  {targetType && targetTypeHasDbSchema && (
                    <Button
                      variant="outline"
                      onClick={() => setIsTargetEntityModalOpen(true)}
                      disabled={!targetType}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Browse
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Relation Selection */}
          <div className="pt-4 border-t">
            <div className="mb-4">
              <Label className="text-base font-medium">Relation</Label>
              <p className="text-sm text-muted-foreground">
                Select the relation between the subject and target
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 flex items-center gap-2">
                <Badge>{subjectType || 'Subject'}</Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={selectedRelation}
                  onValueChange={setSelectedRelation}
                  disabled={availableRelations.length === 0}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select relation" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRelations.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        {!subjectType || !targetType
                          ? 'Select subject and target types first'
                          : 'No available relations for these types'}
                      </div>
                    ) : (
                      availableRelations.map(relation => (
                        <SelectItem key={relation} value={relation}>
                          {relation}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Badge>{targetType || 'Target'}</Badge>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between gap-2">
          <div
            className={
              'flex flex-row items-center text-sm text-callout-warning-foreground'
            }
          >
            <TriangleAlert className={'w-4 h-4'} />
            <span className={''}>
              Warning: Creating relations manually may bypass module operations
              causing unintended errors. Proceed with caution
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSubjectType('');
                setTargetType('');
                setSubjectId('');
                setTargetId('');
                setSelectedRelation('');
                setError(null);
              }}
            >
              Reset
            </Button>
            <Button
              onClick={handleCreateRelation}
              disabled={
                !subjectType ||
                !targetType ||
                !subjectId ||
                !targetId ||
                !selectedRelation ||
                isCreating
              }
            >
              {isCreating ? 'Creating...' : 'Create Relation'}
              {!isCreating && <PlusCircle className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Resource Selection Modals */}
      <ResourceSelectionModal
        open={isSubjectTypeModalOpen}
        onOpenChange={setIsSubjectTypeModalOpen}
        selectedResources={subjectType ? [subjectType] : []}
        selectForRelation={true}
        onSelect={resources => {
          if (resources.length > 0) {
            setSubjectType(resources[0]);
            setSubjectId('');
          }
        }}
        onSelectWildcard={() => {
          // Wildcard not applicable for entity types
        }}
        title="Select Subject Type"
        description="Choose the type of entity that will have the relation"
      />

      <ResourceSelectionModal
        open={isTargetTypeModalOpen}
        onOpenChange={setIsTargetTypeModalOpen}
        selectedResources={targetType ? [targetType] : []}
        selectForRelation={true}
        onSelect={resources => {
          if (resources.length > 0) {
            setTargetType(resources[0]);
            setTargetId('');
          }
        }}
        onSelectWildcard={() => {
          // Wildcard not applicable for entity types
        }}
        title="Select Target Type"
        description="Choose the type of entity that will be related to the subject"
      />

      {/* Database Entity Selection Modals */}
      {subjectType && (
        <DatabaseEntitySelectionModal
          open={isSubjectEntityModalOpen}
          onOpenChange={setIsSubjectEntityModalOpen}
          entityType={subjectType}
          onSelect={entityId => {
            setSubjectId(entityId);
          }}
        />
      )}

      {targetType && (
        <DatabaseEntitySelectionModal
          open={isTargetEntityModalOpen}
          onOpenChange={setIsTargetEntityModalOpen}
          entityType={targetType}
          onSelect={entityId => {
            setTargetId(entityId);
          }}
        />
      )}
    </div>
  );
}
