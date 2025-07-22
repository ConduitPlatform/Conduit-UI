'use client';

import React, { useState, useEffect } from 'react';
import { Controller, Control } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/lib/hooks/use-toast';
import {
  getSchemas,
  getSchemaDocs,
  getSchemaDocument,
} from '@/lib/api/database';
import { DeclaredSchema } from '@/lib/models/database';
import { Search, Link, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface RelationFieldInputProps {
  fieldName: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
  relatedModel?: string;
  isArray?: boolean;
  control: Control<any>;
  value?: any; // Current value from the document
}

interface DocumentOption {
  _id: string;
  [key: string]: any;
}

export function RelationFieldInput({
  fieldName,
  label,
  placeholder,
  required,
  description,
  relatedModel,
  isArray = false,
  control,
  value,
}: RelationFieldInputProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [schemas, setSchemas] = useState<DeclaredSchema[]>([]);
  const [documents, setDocuments] = useState<DocumentOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<DocumentOption[]>(
    []
  );
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Load available schemas
  useEffect(() => {
    const loadSchemas = async () => {
      try {
        const response = await getSchemas({ skip: 0, limit: 1000 });
        setSchemas(response.schemas || []);
      } catch (error) {
        console.error('Error loading schemas:', error);
        toast({
          title: 'Error',
          description: 'Failed to load schemas',
          variant: 'destructive',
        });
      }
    };
    loadSchemas();
  }, [relatedModel, toast]);

  // Load existing relations if value is provided
  useEffect(() => {
    if (value && relatedModel) {
      console.log(`Loading existing relations for ${fieldName}:`, {
        value,
        relatedModel,
        isArray,
      });
      const loadExistingRelations = async () => {
        try {
          const targetSchema = schemas.find(s => s.name === relatedModel);
          if (!targetSchema) {
            console.warn(`Schema not found for ${relatedModel}`);
            return;
          }

          const ids = isArray ? value : [value];
          const existingDocs: DocumentOption[] = [];

          for (const id of ids) {
            if (id) {
              try {
                console.log(`Loading document ${id} from ${relatedModel}`);
                const doc = await getSchemaDocument(relatedModel, id);
                console.log(`Document response:`, doc);
                if (doc) {
                  existingDocs.push({
                    _id: id,
                    ...doc,
                  });
                }
              } catch (error) {
                console.warn(`Failed to load document ${id}:`, error);
              }
            }
          }

          console.log(`Setting selected documents:`, existingDocs);
          setSelectedDocuments(existingDocs);
        } catch (error) {
          console.error('Error loading existing relations:', error);
        }
      };

      loadExistingRelations();
    }
  }, [value, relatedModel, schemas, isArray, fieldName]);

  // Load documents when relatedModel is available
  useEffect(() => {
    if (relatedModel) {
      loadDocuments();
    }
  }, [relatedModel, page, searchTerm]);

  const loadDocuments = async () => {
    if (!relatedModel) return;

    setLoading(true);
    try {
      const response = await getSchemaDocs(
        relatedModel,
        {
          query: searchTerm
            ? {
                $or: [
                  { name: { $regex: searchTerm, $options: 'i' } },
                  { title: { $regex: searchTerm, $options: 'i' } },
                  { email: { $regex: searchTerm, $options: 'i' } },
                  { username: { $regex: searchTerm, $options: 'i' } },
                ],
              }
            : {},
        },
        {
          skip: page * 20,
          limit: 20,
        }
      );

      if (page === 0) {
        setDocuments(response.documents || []);
      } else {
        setDocuments(prev => [...prev, ...(response.documents || [])]);
      }

      setHasMore((response.documents || []).length === 20);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadDocuments();
  };

  const handleSelectDocument = (document: DocumentOption) => {
    if (isArray) {
      const isAlreadySelected = selectedDocuments.some(
        doc => doc._id === document._id
      );
      if (isAlreadySelected) {
        setSelectedDocuments(prev =>
          prev.filter(doc => doc._id !== document._id)
        );
      } else {
        setSelectedDocuments(prev => [...prev, document]);
      }
    } else {
      setSelectedDocuments([document]);
    }
  };

  const getDisplayValue = (document: DocumentOption) => {
    // Try to find a meaningful display field
    const displayFields = ['name', 'title', 'label', 'email', 'username'];
    for (const field of displayFields) {
      if (document[field]) {
        return document[field];
      }
    }
    // Fallback to _id
    return document._id;
  };

  return (
    <Controller
      name={fieldName}
      control={control}
      render={({ field }) => {
        // Initialize selected documents from form value
        useEffect(() => {
          if (field.value) {
            if (isArray && Array.isArray(field.value)) {
              setSelectedDocuments(field.value);
            } else if (!isArray && field.value) {
              setSelectedDocuments([field.value]);
            }
          }
        }, [field.value, isArray]);

        const handleConfirm = () => {
          const value = isArray
            ? selectedDocuments
            : selectedDocuments[0] || null;
          field.onChange(value);
          setIsOpen(false);
        };

        const handleRemoveDocument = (documentId: string) => {
          const newSelected = selectedDocuments.filter(
            doc => doc._id !== documentId
          );
          setSelectedDocuments(newSelected);
          const value = isArray ? newSelected : newSelected[0] || null;
          field.onChange(value);
        };

        return (
          <div className="space-y-2">
            <Label htmlFor={fieldName}>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </Label>

            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}

            {/* Display selected documents */}
            {selectedDocuments.length > 0 && (
              <div className="space-y-2">
                {selectedDocuments.map(doc => (
                  <Card key={doc._id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Link className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {getDisplayValue(doc)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {doc._id}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDocument(doc._id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Relation picker dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {isArray ? 'Add Relations' : 'Select Relation'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    {isArray ? 'Select Relations' : 'Select Relation'}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {relatedModel && (
                    <>
                      <Separator />

                      {/* Search */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search documents..."
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                        <Button onClick={handleSearch} disabled={loading}>
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Documents list */}
                      <ScrollArea className="h-[400px] border rounded-md">
                        <div className="p-4 space-y-2">
                          {documents.map(doc => {
                            const isSelected = selectedDocuments.some(
                              selected => selected._id === doc._id
                            );
                            return (
                              <Card
                                key={doc._id}
                                className={`p-3 cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'border-primary bg-primary/5'
                                    : 'hover:bg-muted/50'
                                }`}
                                onClick={() => handleSelectDocument(doc)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                      {getDisplayValue(doc)}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {doc._id}
                                    </Badge>
                                  </div>
                                  {isSelected && (
                                    <Badge
                                      variant="default"
                                      className="text-xs"
                                    >
                                      Selected
                                    </Badge>
                                  )}
                                </div>
                              </Card>
                            );
                          })}

                          {loading && (
                            <div className="text-center py-4">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mx-auto" />
                              <p className="text-sm text-muted-foreground mt-2">
                                Loading...
                              </p>
                            </div>
                          )}

                          {!loading && hasMore && (
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => setPage(prev => prev + 1)}
                            >
                              Load More
                            </Button>
                          )}
                        </div>
                      </ScrollArea>

                      {/* Selection summary */}
                      {selectedDocuments.length > 0 && (
                        <div className="space-y-2">
                          <Separator />
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Selected: {selectedDocuments.length}{' '}
                              {isArray ? 'documents' : 'document'}
                            </span>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setSelectedDocuments([])}
                              >
                                Clear All
                              </Button>
                              <Button onClick={handleConfirm}>
                                Confirm Selection
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        );
      }}
    />
  );
}
