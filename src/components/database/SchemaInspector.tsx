'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Database, Table, Column, Key, Index, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SchemaField {
  name: string;
  type: string;
  nullable?: boolean;
  primaryKey?: boolean;
  foreignKey?: boolean;
  defaultValue?: any;
  description?: string;
  constraints?: string[];
}

interface SchemaTable {
  name: string;
  type: 'table' | 'view' | 'collection';
  fields: SchemaField[];
  indexes?: Array<{
    name: string;
    columns: string[];
    type: 'primary' | 'unique' | 'index';
  }>;
  rowCount?: number;
  size?: number;
  lastModified?: Date;
}

interface SchemaInspectorProps {
  schema: SchemaTable[];
  databaseType: 'mongodb' | 'postgresql' | 'mysql' | 'sqlite';
}

export function SchemaInspector({ schema, databaseType }: SchemaInspectorProps) {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const toggleTableExpansion = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  const getFieldIcon = (field: SchemaField) => {
    if (field.primaryKey) return <Key className="h-3 w-3 text-yellow-500" />;
    if (field.foreignKey) return <Key className="h-3 w-3 text-blue-500" />;
    return <Column className="h-3 w-3 text-gray-500" />;
  };

  const getFieldTypeColor = (type: string) => {
    if (type.includes('int') || type.includes('number')) return 'bg-blue-100 text-blue-800';
    if (type.includes('string') || type.includes('text') || type.includes('char')) return 'bg-green-100 text-green-800';
    if (type.includes('date') || type.includes('time')) return 'bg-purple-100 text-purple-800';
    if (type.includes('bool')) return 'bg-orange-100 text-orange-800';
    if (type.includes('json') || type.includes('object')) return 'bg-indigo-100 text-indigo-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getTableIcon = (type: string) => {
    switch (type) {
      case 'table':
        return <Table className="h-4 w-4 text-blue-500" />;
      case 'view':
        return <Eye className="h-4 w-4 text-green-500" />;
      case 'collection':
        return <Database className="h-4 w-4 text-purple-500" />;
      default:
        return <Table className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Database Schema</h3>
          <p className="text-sm text-muted-foreground">
            {databaseType.toUpperCase()} - {schema.length} objects
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandedTables(new Set(schema.map(t => t.name)))}
          >
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandedTables(new Set())}
          >
            Collapse All
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-2">
          {schema.map((table) => (
            <Card key={table.name} className="border-l-4 border-l-blue-500">
              <Collapsible
                open={expandedTables.has(table.name)}
                onOpenChange={() => toggleTableExpansion(table.name)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {expandedTables.has(table.name) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          {getTableIcon(table.type)}
                          <CardTitle className="text-base">{table.name}</CardTitle>
                        </div>
                        <Badge variant="outline">{table.type}</Badge>
                        {table.rowCount && (
                          <Badge variant="secondary">{table.rowCount.toLocaleString()} rows</Badge>
                        )}
                        {table.size && (
                          <Badge variant="secondary">
                            {(table.size / 1024).toFixed(1)} KB
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      {table.fields.length} fields
                      {table.indexes && table.indexes.length > 0 && ` • ${table.indexes.length} indexes`}
                    </CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Fields */}
                      <div>
                        <h4 className="font-medium mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                          Fields
                        </h4>
                        <div className="space-y-2">
                          {table.fields.map((field) => (
                            <div
                              key={field.name}
                              className="flex items-center justify-between p-2 rounded-md border bg-muted/30"
                            >
                              <div className="flex items-center gap-2">
                                {getFieldIcon(field)}
                                <span className="font-medium text-sm">{field.name}</span>
                                <Badge className={getFieldTypeColor(field.type)}>
                                  {field.type}
                                </Badge>
                                {field.nullable === false && (
                                  <Badge variant="outline" className="text-xs">
                                    NOT NULL
                                  </Badge>
                                )}
                                {field.defaultValue !== undefined && (
                                  <Badge variant="outline" className="text-xs">
                                    Default: {String(field.defaultValue)}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                {field.primaryKey && (
                                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                    Primary Key
                                  </Badge>
                                )}
                                {field.foreignKey && (
                                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                                    Foreign Key
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Indexes */}
                      {table.indexes && table.indexes.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                            Indexes
                          </h4>
                          <div className="space-y-2">
                            {table.indexes.map((index) => (
                              <div
                                key={index.name}
                                className="flex items-center justify-between p-2 rounded-md border bg-muted/30"
                              >
                                <div className="flex items-center gap-2">
                                  <Index className="h-3 w-3 text-gray-500" />
                                  <span className="font-medium text-sm">{index.name}</span>
                                  <Badge
                                    variant={
                                      index.type === 'primary'
                                        ? 'default'
                                        : index.type === 'unique'
                                        ? 'secondary'
                                        : 'outline'
                                    }
                                  >
                                    {index.type}
                                  </Badge>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {index.columns.join(', ')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Constraints */}
                      {table.fields.some(f => f.constraints && f.constraints.length > 0) && (
                        <div>
                          <h4 className="font-medium mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                            Constraints
                          </h4>
                          <div className="space-y-2">
                            {table.fields
                              .filter(f => f.constraints && f.constraints.length > 0)
                              .map((field) => (
                                <div
                                  key={field.name}
                                  className="p-2 rounded-md border bg-muted/30"
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{field.name}:</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {field.constraints!.map((constraint, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {constraint}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}