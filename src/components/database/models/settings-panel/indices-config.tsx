'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Database, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

type Index = {
  fields: string[];
  options?: {
    name?: string;
    unique?: boolean;
    sparse?: boolean;
    background?: boolean;
    [key: string]: unknown;
  };
  types?: string[] | string;
};

type IndicesConfigProps = {
  indices: Index[];
  onChange: (indices: Index[]) => void;
  schemaFields: string[];
  disabled?: boolean;
  isLoading?: boolean;
};

const indexTypeOptions = [
  { value: '1', label: 'Ascending' },
  { value: '-1', label: 'Descending' },
  { value: 'text', label: 'Text' },
  { value: '2dsphere', label: 'Geospatial (2dsphere)' },
];

export function IndicesConfig({
  indices,
  onChange,
  schemaFields,
  disabled,
  isLoading = false,
}: IndicesConfigProps) {
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [newIndex, setNewIndex] = React.useState<{
    field: string;
    type: string;
    unique: boolean;
    sparse: boolean;
  }>({
    field: '',
    type: '1',
    unique: false,
    sparse: false,
  });

  const handleAddIndex = () => {
    if (!newIndex.field) return;

    const index: Index = {
      fields: [newIndex.field],
      types: [newIndex.type],
      options: {},
    };

    if (newIndex.unique) index.options!.unique = true;
    if (newIndex.sparse) index.options!.sparse = true;

    onChange([...indices, index]);
    setNewIndex({ field: '', type: '1', unique: false, sparse: false });
    setIsAddOpen(false);
  };

  const handleRemoveIndex = (indexToRemove: number) => {
    onChange(indices.filter((_, index) => index !== indexToRemove));
  };

  const getIndexTypeLabel = (type: string[] | string | undefined) => {
    const normalizedType = Array.isArray(type) ? type[0] : type;
    const option = indexTypeOptions.find(o => o.value === normalizedType);
    return option?.label || normalizedType || 'Ascending';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Indices
            </CardTitle>
            <CardDescription>
              Configure database indices for better query performance
            </CardDescription>
          </div>
          {!disabled && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Index
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Index</DialogTitle>
                  <DialogDescription>
                    Create a new index to optimize queries on this schema
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Field</Label>
                    <Select
                      value={newIndex.field}
                      onValueChange={value =>
                        setNewIndex({ ...newIndex, field: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field..." />
                      </SelectTrigger>
                      <SelectContent>
                        {schemaFields.map(field => (
                          <SelectItem key={field} value={field}>
                            {field}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Index Type</Label>
                    <Select
                      value={newIndex.type}
                      onValueChange={value =>
                        setNewIndex({ ...newIndex, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {indexTypeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="unique">Unique</Label>
                    <Switch
                      id="unique"
                      checked={newIndex.unique}
                      onCheckedChange={checked =>
                        setNewIndex({ ...newIndex, unique: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sparse">Sparse</Label>
                    <Switch
                      id="sparse"
                      checked={newIndex.sparse}
                      onCheckedChange={checked =>
                        setNewIndex({ ...newIndex, sparse: checked })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddIndex} disabled={!newIndex.field}>
                    Add Index
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>Loading custom indices...</p>
          </div>
        ) : indices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No custom indices defined</p>
            <p className="text-sm mt-1">
              MongoDB automatically creates an index on the _id field
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {indices.map((index, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-muted">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {index.fields.map((field, fi) => (
                        <Badge key={fi} variant="outline">
                          {field}
                        </Badge>
                      ))}
                      <Badge variant="secondary" className="text-xs">
                        {getIndexTypeLabel(index.types)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {index.options?.unique && (
                        <span className="text-xs text-muted-foreground">
                          Unique
                        </span>
                      )}
                      {index.options?.sparse && (
                        <span className="text-xs text-muted-foreground">
                          Sparse
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {!disabled && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveIndex(i)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
