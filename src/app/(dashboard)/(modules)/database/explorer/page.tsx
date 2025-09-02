'use client';

import React, { useState, useEffect } from 'react';
import { Database, Server, Database as DatabaseIcon, Table, FileText, Search, Plus, Settings, RefreshCw, Eye, Edit, Trash2, BarChart3, Code, Database as SchemaIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table as TableComponent, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SchemaInspector } from '@/components/database/SchemaInspector';
import { QueryBuilder } from '@/components/database/QueryBuilder';
import { DataVisualizer } from '@/components/database/DataVisualizer';

interface DatabaseConnection {
  id: string;
  name: string;
  type: 'mongodb' | 'postgresql' | 'mysql' | 'sqlite';
  host: string;
  port: number;
  database: string;
  username?: string;
  password?: string;
  connectionString?: string;
  isConnected: boolean;
}

interface DatabaseObject {
  name: string;
  type: 'collection' | 'table' | 'view';
  size?: number;
  count?: number;
  lastModified?: Date;
}

interface QueryResult {
  columns: string[];
  rows: any[];
  executionTime: number;
  affectedRows?: number;
}

interface SchemaTable {
  name: string;
  type: 'table' | 'view' | 'collection';
  fields: Array<{
    name: string;
    type: string;
    nullable?: boolean;
    primaryKey?: boolean;
    foreignKey?: boolean;
    defaultValue?: any;
    description?: string;
    constraints?: string[];
  }>;
  indexes?: Array<{
    name: string;
    columns: string[];
    type: 'primary' | 'unique' | 'index';
  }>;
  rowCount?: number;
  size?: number;
  lastModified?: Date;
}

export default function DatabaseExplorer() {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<DatabaseConnection | null>(null);
  const [databaseObjects, setDatabaseObjects] = useState<DatabaseObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<DatabaseObject | null>(null);
  const [objectData, setObjectData] = useState<any[]>([]);
  const [query, setQuery] = useState<string>('');
  const [queryResults, setQueryResults] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewConnectionDialog, setShowNewConnectionDialog] = useState(false);
  const [newConnection, setNewConnection] = useState<Partial<DatabaseConnection>>({
    type: 'mongodb',
    host: 'localhost',
    port: 27017,
    database: '',
  });
  const [activeTab, setActiveTab] = useState('explorer');
  const [schema, setSchema] = useState<SchemaTable[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    const mockConnections: DatabaseConnection[] = [
      {
        id: '1',
        name: 'Local MongoDB',
        type: 'mongodb',
        host: 'localhost',
        port: 27017,
        database: 'testdb',
        isConnected: true,
      },
      {
        id: '2',
        name: 'PostgreSQL Production',
        type: 'postgresql',
        host: 'prod-db.company.com',
        port: 5432,
        database: 'production',
        username: 'admin',
        isConnected: false,
      },
    ];
    setConnections(mockConnections);

    // Mock schema data
    const mockSchema: SchemaTable[] = [
      {
        name: 'users',
        type: 'table',
        fields: [
          { name: 'id', type: 'integer', primaryKey: true, nullable: false },
          { name: 'username', type: 'varchar(255)', nullable: false },
          { name: 'email', type: 'varchar(255)', nullable: false },
          { name: 'created_at', type: 'timestamp', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' },
          { name: 'status', type: 'varchar(50)', nullable: true },
        ],
        indexes: [
          { name: 'users_pkey', columns: ['id'], type: 'primary' },
          { name: 'users_username_idx', columns: ['username'], type: 'unique' },
          { name: 'users_email_idx', columns: ['email'], type: 'unique' },
        ],
        rowCount: 1250,
        size: 1024000,
      },
      {
        name: 'orders',
        type: 'table',
        fields: [
          { name: 'id', type: 'integer', primaryKey: true, nullable: false },
          { name: 'user_id', type: 'integer', foreignKey: true, nullable: false },
          { name: 'total_amount', type: 'decimal(10,2)', nullable: false },
          { name: 'status', type: 'varchar(50)', nullable: false },
          { name: 'created_at', type: 'timestamp', nullable: false },
        ],
        indexes: [
          { name: 'orders_pkey', columns: ['id'], type: 'primary' },
          { name: 'orders_user_id_idx', columns: ['user_id'], type: 'index' },
        ],
        rowCount: 567,
        size: 512000,
      },
    ];
    setSchema(mockSchema);
  }, []);

  const handleConnect = async (connection: DatabaseConnection) => {
    setIsLoading(true);
    try {
      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedConnections = connections.map(conn =>
        conn.id === connection.id ? { ...conn, isConnected: true } : conn
      );
      setConnections(updatedConnections);
      setSelectedConnection(connection);
      
      // Load database objects
      await loadDatabaseObjects(connection);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = (connection: DatabaseConnection) => {
    const updatedConnections = connections.map(conn =>
      conn.id === connection.id ? { ...conn, isConnected: false } : conn
    );
    setConnections(updatedConnections);
    if (selectedConnection?.id === connection.id) {
      setSelectedConnection(null);
      setDatabaseObjects([]);
      setObjectData([]);
      setQueryResults(null);
    }
  };

  const loadDatabaseObjects = async (connection: DatabaseConnection) => {
    // Mock database objects
    const mockObjects: DatabaseObject[] = [
      { name: 'users', type: connection.type === 'mongodb' ? 'collection' : 'table', count: 1250, size: 1024000 },
      { name: 'orders', type: connection.type === 'mongodb' ? 'collection' : 'table', count: 567, size: 512000 },
      { name: 'products', type: connection.type === 'mongodb' ? 'collection' : 'table', count: 89, size: 256000 },
      { name: 'user_stats', type: 'view', count: 1250 },
    ];
    setDatabaseObjects(mockObjects);
  };

  const handleObjectSelect = async (object: DatabaseObject) => {
    setSelectedObject(object);
    // Mock data loading
    const mockData = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      email: `item${i + 1}@example.com`,
      created: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    }));
    setObjectData(mockData);
  };

  const executeQuery = async () => {
    if (!query.trim() || !selectedConnection) return;
    
    setIsLoading(true);
    try {
      // Simulate query execution
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock query results
      const mockResult: QueryResult = {
        columns: ['id', 'name', 'email', 'created'],
        rows: Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          name: `Result ${i + 1}`,
          email: `result${i + 1}@example.com`,
          created: new Date().toISOString(),
        })),
        executionTime: 45,
        affectedRows: 5,
      };
      setQueryResults(mockResult);
    } catch (error) {
      console.error('Query execution failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addNewConnection = () => {
    const connection: DatabaseConnection = {
      id: Date.now().toString(),
      name: newConnection.name || 'New Connection',
      type: newConnection.type || 'mongodb',
      host: newConnection.host || 'localhost',
      port: newConnection.port || 27017,
      database: newConnection.database || '',
      username: newConnection.username,
      password: newConnection.password,
      isConnected: false,
    };
    
    setConnections([...connections, connection]);
    setNewConnection({
      type: 'mongodb',
      host: 'localhost',
      port: 27017,
      database: '',
    });
    setShowNewConnectionDialog(false);
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'mongodb':
        return <DatabaseIcon className="h-4 w-4 text-green-500" />;
      case 'postgresql':
        return <DatabaseIcon className="h-4 w-4 text-blue-500" />;
      case 'mysql':
        return <DatabaseIcon className="h-4 w-4 text-orange-500" />;
      case 'sqlite':
        return <DatabaseIcon className="h-4 w-4 text-purple-500" />;
      default:
        return <DatabaseIcon className="h-4 w-4" />;
    }
  };

  const getConnectionBadgeColor = (type: string) => {
    switch (type) {
      case 'mongodb':
        return 'bg-green-100 text-green-800';
      case 'postgresql':
        return 'bg-blue-100 text-blue-800';
      case 'mysql':
        return 'bg-orange-100 text-orange-800';
      case 'sqlite':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTablesForQueryBuilder = () => {
    return schema.map(table => ({
      name: table.name,
      columns: table.fields.map(field => ({
        name: field.name,
        type: field.type,
      })),
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Explorer</h1>
          <p className="text-muted-foreground">
            Connect to and explore MongoDB, PostgreSQL, MySQL, and SQLite databases
          </p>
        </div>
        <Button onClick={() => setShowNewConnectionDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Connection
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Connections Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Connections
            </CardTitle>
            <CardDescription>Manage database connections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedConnection?.id === connection.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedConnection(connection)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getConnectionIcon(connection.type)}
                    <span className="font-medium">{connection.name}</span>
                  </div>
                  <Badge variant={connection.isConnected ? 'default' : 'secondary'}>
                    {connection.isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {connection.host}:{connection.port}/{connection.database}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getConnectionBadgeColor(connection.type)}>
                    {connection.type}
                  </Badge>
                  {connection.isConnected ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDisconnect(connection);
                      }}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnect(connection);
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Connect'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {selectedConnection ? (
            <>
              {/* Main Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="explorer" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Explorer
                  </TabsTrigger>
                  <TabsTrigger value="query" className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Query
                  </TabsTrigger>
                  <TabsTrigger value="schema" className="flex items-center gap-2">
                    <SchemaIcon className="h-4 w-4" />
                    Schema
                  </TabsTrigger>
                  <TabsTrigger value="visualize" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Visualize
                  </TabsTrigger>
                </TabsList>

                {/* Explorer Tab */}
                <TabsContent value="explorer" className="space-y-6">
                  {/* Database Objects */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Table className="h-5 w-5" />
                        Database Objects
                      </CardTitle>
                      <CardDescription>
                        {selectedConnection.database} on {selectedConnection.host}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {databaseObjects.map((object) => (
                          <div
                            key={object.name}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedObject?.name === object.name
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => handleObjectSelect(object)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{object.name}</span>
                              <Badge variant="outline">
                                {object.type}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {object.count && `${object.count} records`}
                              {object.size && ` • ${(object.size / 1024).toFixed(1)} KB`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Object Data */}
                  {selectedObject && objectData.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {selectedObject.name}
                        </CardTitle>
                        <CardDescription>
                          {objectData.length} records • {selectedObject.type}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[400px]">
                          <TableComponent>
                            <TableHeader>
                              <TableRow>
                                {Object.keys(objectData[0]).map((key) => (
                                  <TableHead key={key}>{key}</TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {objectData.map((row, index) => (
                                <TableRow key={index}>
                                  {Object.values(row).map((value, valueIndex) => (
                                    <TableCell key={valueIndex}>
                                      {typeof value === 'object' 
                                        ? JSON.stringify(value)
                                        : String(value ?? '')
                                      }
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </TableComponent>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Query Tab */}
                <TabsContent value="query" className="space-y-6">
                  <QueryBuilder
                    databaseType={selectedConnection.type}
                    tables={getTablesForQueryBuilder()}
                    onQueryChange={setQuery}
                  />
                  
                  {/* Query Editor */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Query Editor
                      </CardTitle>
                      <CardDescription>
                        Execute queries against {selectedConnection.database}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="query">Query</Label>
                        <Textarea
                          id="query"
                          placeholder={
                            selectedConnection.type === 'mongodb'
                              ? 'db.users.find({})'
                              : 'SELECT * FROM users LIMIT 10'
                          }
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          className="min-h-[100px] font-mono"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={executeQuery} disabled={!query.trim() || isLoading}>
                          {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                          Execute Query
                        </Button>
                        <Button variant="outline" onClick={() => setQuery('')}>
                          Clear
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Query Results */}
                  {queryResults && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Query Results</CardTitle>
                        <CardDescription>
                          Execution time: {queryResults.executionTime}ms
                          {queryResults.affectedRows && ` • Affected rows: ${queryResults.affectedRows}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[400px]">
                          <TableComponent>
                            <TableHeader>
                              <TableRow>
                                {queryResults.columns.map((column) => (
                                  <TableHead key={column}>{column}</TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {queryResults.rows.map((row, index) => (
                                <TableRow key={index}>
                                  {queryResults.columns.map((column) => (
                                    <TableCell key={column}>
                                      {typeof row[column] === 'object' 
                                        ? JSON.stringify(row[column])
                                        : String(row[column] ?? '')
                                      }
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </TableComponent>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Schema Tab */}
                <TabsContent value="schema" className="space-y-6">
                  <SchemaInspector
                    schema={schema}
                    databaseType={selectedConnection.type}
                  />
                </TabsContent>

                {/* Visualize Tab */}
                <TabsContent value="visualize" className="space-y-6">
                  {queryResults ? (
                    <DataVisualizer
                      data={queryResults}
                      onExport={(format, data) => {
                        console.log(`Exporting ${format}:`, data);
                      }}
                    />
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Data to Visualize</h3>
                        <p className="text-muted-foreground text-center mb-4">
                          Execute a query first to see data visualization options
                        </p>
                        <Button onClick={() => setActiveTab('query')}>
                          Go to Query Tab
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Database className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Connection Selected</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Select a database connection from the left panel to start exploring
                </p>
                <Button onClick={() => setShowNewConnectionDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Connection
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* New Connection Dialog */}
      <Dialog open={showNewConnectionDialog} onOpenChange={setShowNewConnectionDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Database Connection</DialogTitle>
            <DialogDescription>
              Configure a new database connection
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Connection Name</Label>
              <Input
                id="name"
                placeholder="My Database"
                value={newConnection.name || ''}
                onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Database Type</Label>
              <Select
                value={newConnection.type}
                onValueChange={(value: any) => setNewConnection({ ...newConnection, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select database type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mongodb">MongoDB</SelectItem>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="sqlite">SQLite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host">Host</Label>
                <Input
                  id="host"
                  placeholder="localhost"
                  value={newConnection.host || ''}
                  onChange={(e) => setNewConnection({ ...newConnection, host: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  placeholder={newConnection.type === 'mongodb' ? '27017' : '5432'}
                  value={newConnection.port || ''}
                  onChange={(e) => setNewConnection({ ...newConnection, port: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="database">Database Name</Label>
              <Input
                id="database"
                placeholder="mydatabase"
                value={newConnection.database || ''}
                onChange={(e) => setNewConnection({ ...newConnection, database: e.target.value })}
              />
            </div>

            {newConnection.type !== 'mongodb' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="username"
                    value={newConnection.username || ''}
                    onChange={(e) => setNewConnection({ ...newConnection, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="password"
                    value={newConnection.password || ''}
                    onChange={(e) => setNewConnection({ ...newConnection, password: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowNewConnectionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={addNewConnection}>
                Create Connection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}