'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Minus, X, Database, Table, Column, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface QueryField {
  table: string;
  column: string;
  alias?: string;
}

interface QueryCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logicalOperator: 'AND' | 'OR';
}

interface QueryOrder {
  field: string;
  direction: 'ASC' | 'DESC';
}

interface QueryBuilderProps {
  databaseType: 'mongodb' | 'postgresql' | 'mysql' | 'sqlite';
  tables: Array<{
    name: string;
    columns: Array<{
      name: string;
      type: string;
    }>;
  }>;
  onQueryChange: (query: string) => void;
}

const SQL_OPERATORS = [
  '=', '!=', '<', '>', '<=', '>=', 'LIKE', 'NOT LIKE', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'
];

const MONGODB_OPERATORS = [
  '=', '!=', '<', '>', '<=', '>=', 'regex', 'in', 'nin', 'exists', 'type'
];

export function QueryBuilder({ databaseType, tables, onQueryChange }: QueryBuilderProps) {
  const [selectedFields, setSelectedFields] = useState<QueryField[]>([]);
  const [conditions, setConditions] = useState<QueryCondition[]>([]);
  const [orderBy, setOrderBy] = useState<QueryOrder[]>([]);
  const [limit, setLimit] = useState<number>(10);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [customQuery, setCustomQuery] = useState<string>('');

  useEffect(() => {
    if (tables.length > 0 && !selectedTable) {
      setSelectedTable(tables[0].name);
    }
  }, [tables, selectedTable]);

  const addField = () => {
    if (selectedTable) {
      const newField: QueryField = {
        table: selectedTable,
        column: '',
      };
      setSelectedFields([...selectedFields, newField]);
    }
  };

  const removeField = (index: number) => {
    setSelectedFields(selectedFields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, field: Partial<QueryField>) => {
    const newFields = [...selectedFields];
    newFields[index] = { ...newFields[index], ...field };
    setSelectedFields(newFields);
  };

  const addCondition = () => {
    const newCondition: QueryCondition = {
      id: Date.now().toString(),
      field: '',
      operator: '=',
      value: '',
      logicalOperator: 'AND',
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, updates: Partial<QueryCondition>) => {
    setConditions(conditions.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  const addOrderBy = () => {
    const newOrder: QueryOrder = {
      field: '',
      direction: 'ASC',
    };
    setOrderBy([...orderBy, newOrder]);
  };

  const removeOrderBy = (index: number) => {
    setOrderBy(orderBy.filter((_, i) => i !== index));
  };

  const updateOrderBy = (index: number, updates: Partial<QueryOrder>) => {
    const newOrderBy = [...orderBy];
    newOrderBy[index] = { ...newOrderBy[index], ...updates };
    setOrderBy(newOrderBy);
  };

  const buildQuery = () => {
    if (databaseType === 'mongodb') {
      return buildMongoDBQuery();
    } else {
      return buildSQLQuery();
    }
  };

  const buildMongoDBQuery = () => {
    let query = 'db.';
    query += selectedTable || 'collection';
    query += '.find(';

    // Build filter
    if (conditions.length > 0) {
      const filter: any = {};
      conditions.forEach((condition, index) => {
        if (condition.field && condition.value) {
          if (condition.operator === '=') {
            filter[condition.field] = condition.value;
          } else if (condition.operator === 'regex') {
            filter[condition.field] = { $regex: condition.value, $options: 'i' };
          } else if (condition.operator === 'in') {
            filter[condition.field] = { $in: condition.value.split(',').map(v => v.trim()) };
          } else if (condition.operator === 'nin') {
            filter[condition.field] = { $nin: condition.value.split(',').map(v => v.trim()) };
          } else if (condition.operator === 'exists') {
            filter[condition.field] = { $exists: condition.value === 'true' };
          } else {
            filter[condition.field] = { [`$${condition.operator}`]: condition.value };
          }
        }
      });
      query += JSON.stringify(filter, null, 2);
    } else {
      query += '{}';
    }

    query += ')';

    // Add projection
    if (selectedFields.length > 0) {
      const projection: any = {};
      selectedFields.forEach(field => {
        if (field.column) {
          projection[field.column] = 1;
        }
      });
      if (Object.keys(projection).length > 0) {
        query += '.project(' + JSON.stringify(projection, null, 2) + ')';
      }
    }

    // Add sort
    if (orderBy.length > 0) {
      const sort: any = {};
      orderBy.forEach(order => {
        if (order.field) {
          sort[order.field] = order.direction === 'ASC' ? 1 : -1;
        }
      });
      if (Object.keys(sort).length > 0) {
        query += '.sort(' + JSON.stringify(sort, null, 2) + ')';
      }
    }

    // Add limit
    if (limit > 0) {
      query += `.limit(${limit})`;
    }

    return query;
  };

  const buildSQLQuery = () => {
    let query = 'SELECT ';

    // Build SELECT clause
    if (selectedFields.length > 0) {
      query += selectedFields.map(field => {
        if (field.column) {
          return field.alias ? `${field.table}.${field.column} AS ${field.alias}` : `${field.table}.${field.column}`;
        }
        return '';
      }).filter(Boolean).join(', ');
    } else {
      query += '*';
    }

    query += ` FROM ${selectedTable || 'table'}`;

    // Build WHERE clause
    if (conditions.length > 0) {
      query += ' WHERE ';
      query += conditions.map((condition, index) => {
        if (condition.field && condition.value) {
          const prefix = index > 0 ? ` ${condition.logicalOperator} ` : '';
          if (condition.operator === 'LIKE' || condition.operator === 'NOT LIKE') {
            return `${prefix}${condition.field} ${condition.operator} '${condition.value}'`;
          } else if (condition.operator === 'IN' || condition.operator === 'NOT IN') {
            return `${prefix}${condition.field} ${condition.operator} (${condition.value})`;
          } else if (condition.operator === 'IS NULL' || condition.operator === 'IS NOT NULL') {
            return `${prefix}${condition.field} ${condition.operator}`;
          } else {
            return `${prefix}${condition.field} ${condition.operator} '${condition.value}'`;
          }
        }
        return '';
      }).filter(Boolean).join('');
    }

    // Build ORDER BY clause
    if (orderBy.length > 0) {
      query += ' ORDER BY ';
      query += orderBy.map(order => {
        if (order.field) {
          return `${order.field} ${order.direction}`;
        }
        return '';
      }).filter(Boolean).join(', ');
    }

    // Build LIMIT clause
    if (limit > 0) {
      query += ` LIMIT ${limit}`;
    }

    return query;
  };

  const generateQuery = () => {
    const query = buildQuery();
    onQueryChange(query);
    setCustomQuery(query);
  };

  const getAvailableColumns = () => {
    const table = tables.find(t => t.name === selectedTable);
    return table ? table.columns : [];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Query Builder
        </CardTitle>
        <CardDescription>
          Build queries visually for {databaseType.toUpperCase()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="builder">Visual Builder</TabsTrigger>
            <TabsTrigger value="custom">Custom Query</TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-6">
            {/* Table Selection */}
            <div className="space-y-2">
              <Label>Table/Collection</Label>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table) => (
                    <SelectItem key={table.name} value={table.name}>
                      {table.name}
                    </SelectContent>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fields Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Fields</Label>
                <Button size="sm" onClick={addField} disabled={!selectedTable}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Field
                </Button>
              </div>
              <div className="space-y-2">
                {selectedFields.map((field, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      value={field.column}
                      onValueChange={(value) => updateField(index, { column: value })}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableColumns().map((col) => (
                          <SelectItem key={col.name} value={col.name}>
                            {col.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Alias (optional)"
                      value={field.alias || ''}
                      onChange={(e) => updateField(index, { alias: e.target.value })}
                      className="w-32"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeField(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Conditions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Conditions</Label>
                <Button size="sm" onClick={addCondition}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Condition
                </Button>
              </div>
              <div className="space-y-2">
                {conditions.map((condition, index) => (
                  <div key={condition.id} className="flex items-center gap-2">
                    {index > 0 && (
                      <Select
                        value={condition.logicalOperator}
                        onValueChange={(value: 'AND' | 'OR') => 
                          updateCondition(condition.id, { logicalOperator: value })
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">AND</SelectItem>
                          <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Select
                      value={condition.field}
                      onValueChange={(value) => updateCondition(condition.id, { field: value })}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableColumns().map((col) => (
                          <SelectItem key={col.name} value={col.name}>
                            {col.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={condition.operator}
                      onValueChange={(value) => updateCondition(condition.id, { operator: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(databaseType === 'mongodb' ? MONGODB_OPERATORS : SQL_OPERATORS).map((op) => (
                          <SelectItem key={op} value={op}>
                            {op}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Value"
                      value={condition.value}
                      onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                      className="w-32"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeCondition(condition.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Order By */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Order By</Label>
                <Button size="sm" onClick={addOrderBy}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Order
                </Button>
              </div>
              <div className="space-y-2">
                {orderBy.map((order, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      value={order.field}
                      onValueChange={(value) => updateOrderBy(index, { field: value })}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableColumns().map((col) => (
                          <SelectItem key={col.name} value={col.name}>
                            {col.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={order.direction}
                      onValueChange={(value: 'ASC' | 'DESC') => 
                        updateOrderBy(index, { direction: value })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ASC">
                          <SortAsc className="h-4 w-4 mr-2" />
                          Ascending
                        </SelectItem>
                        <SelectItem value="DESC">
                          <SortDesc className="h-4 w-4 mr-2" />
                          Descending
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeOrderBy(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Limit */}
            <div className="space-y-2">
              <Label>Limit</Label>
              <Input
                type="number"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 0)}
                className="w-32"
                min="0"
              />
            </div>

            {/* Generate Query Button */}
            <Button onClick={generateQuery} className="w-full">
              Generate Query
            </Button>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-2">
              <Label>Custom Query</Label>
              <Textarea
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder={
                  databaseType === 'mongodb'
                    ? 'db.collection.find({}).limit(10)'
                    : 'SELECT * FROM table LIMIT 10'
                }
                className="min-h-[200px] font-mono"
              />
            </div>
            <Button 
              onClick={() => onQueryChange(customQuery)} 
              className="w-full"
              disabled={!customQuery.trim()}
            >
              Use Custom Query
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}