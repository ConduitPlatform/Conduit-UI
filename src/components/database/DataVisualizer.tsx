'use client';

import React, { useState, useMemo } from 'react';
import { BarChart3, PieChart, LineChart, Table as TableIcon, BarChart, PieChart as PieChartIcon, LineChart as LineChartIcon, Download, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface QueryResult {
  columns: string[];
  rows: any[];
  executionTime: number;
  affectedRows?: number;
}

interface DataVisualizerProps {
  data: QueryResult;
  onExport?: (format: string, data: any) => void;
}

type ChartType = 'bar' | 'pie' | 'line' | 'table';
type ChartOrientation = 'horizontal' | 'vertical';

export function DataVisualizer({ data, onExport }: DataVisualizerProps) {
  const [chartType, setChartType] = useState<ChartType>('table');
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxis, setYAxis] = useState<string>('');
  const [chartOrientation, setChartOrientation] = useState<ChartOrientation>('vertical');
  const [showGrid, setShowGrid] = useState(true);
  const [maxItems, setMaxItems] = useState<number>(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data.rows;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(row => 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        
        if (sortDirection === 'asc') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });
    }
    
    // Apply limit
    return filtered.slice(0, maxItems);
  }, [data.rows, searchTerm, sortColumn, sortDirection, maxItems]);

  // Get numeric columns for charts
  const numericColumns = useMemo(() => {
    if (data.rows.length === 0) return [];
    
    return data.columns.filter(col => {
      const sampleValues = data.rows.slice(0, 10).map(row => row[col]);
      return sampleValues.some(val => typeof val === 'number' && !isNaN(val));
    });
  }, [data.columns, data.rows]);

  // Get string columns for charts
  const stringColumns = useMemo(() => {
    if (data.rows.length === 0) return [];
    
    return data.columns.filter(col => {
      const sampleValues = data.rows.slice(0, 10).map(row => row[col]);
      return sampleValues.some(val => typeof val === 'string');
    });
  }, [data.columns, data.rows]);

  // Auto-select chart axes
  useMemo(() => {
    if (chartType !== 'table' && !xAxis && !yAxis) {
      if (stringColumns.length > 0) setXAxis(stringColumns[0]);
      if (numericColumns.length > 0) setYAxis(numericColumns[0]);
    }
  }, [chartType, xAxis, yAxis, stringColumns, numericColumns]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const exportData = (format: string) => {
    if (onExport) {
      onExport(format, processedData);
    } else {
      // Default export behavior
      const dataStr = format === 'json' 
        ? JSON.stringify(processedData, null, 2)
        : processedData.map(row => Object.values(row).join(',')).join('\n');
      
      const blob = new Blob([dataStr], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data-export.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const renderChart = () => {
    if (!xAxis || !yAxis) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Please select X and Y axes for the chart
        </div>
      );
    }

    // Simple chart rendering (in a real app, you'd use a charting library like Chart.js or Recharts)
    const chartData = processedData.slice(0, 10).map((row, index) => ({
      x: String(row[xAxis] || `Item ${index}`),
      y: Number(row[yAxis]) || 0,
    }));

    if (chartType === 'bar') {
      return (
        <div className="h-64 flex items-end justify-center gap-2 p-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`bg-primary rounded-t-sm min-w-[30px] ${
                  chartOrientation === 'vertical' 
                    ? 'w-8' 
                    : 'h-8'
                }`}
                style={{
                  height: chartOrientation === 'vertical' 
                    ? `${Math.max((item.y / Math.max(...chartData.map(d => d.y))) * 200, 20)}px`
                    : '32px',
                  width: chartOrientation === 'horizontal'
                    ? `${Math.max((item.y / Math.max(...chartData.map(d => d.y))) * 200, 20)}px`
                    : '32px',
                }}
              />
              <span className="text-xs mt-1 text-muted-foreground text-center max-w-[60px] truncate">
                {item.x}
              </span>
            </div>
          ))}
        </div>
      );
    }

    if (chartType === 'pie') {
      const total = chartData.reduce((sum, item) => sum + item.y, 0);
      return (
        <div className="h-64 flex items-center justify-center">
          <div className="relative w-48 h-48">
            {chartData.map((item, index) => {
              const percentage = total > 0 ? (item.y / total) * 100 : 0;
              const rotation = chartData
                .slice(0, index)
                .reduce((sum, d) => sum + (d.y / total) * 360, 0);
              
              return (
                <div
                  key={index}
                  className="absolute inset-0 rounded-full border-4 border-transparent"
                  style={{
                    background: `conic-gradient(from ${rotation}deg, hsl(${index * 60}, 70%, 60%) ${rotation}deg, hsl(${index * 60}, 70%, 60%) ${rotation + (percentage * 360 / 100)}deg, transparent ${rotation + (percentage * 360 / 100)}deg)`,
                  }}
                />
              );
            })}
            <div className="absolute inset-4 bg-background rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">{total.toFixed(0)}</span>
            </div>
          </div>
        </div>
      );
    }

    if (chartType === 'line') {
      return (
        <div className="h-64 flex items-center justify-center p-4">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            <polyline
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              points={chartData
                .map((item, index) => 
                  `${(index / (chartData.length - 1)) * 400},${200 - (item.y / Math.max(...chartData.map(d => d.y))) * 180}`
                )
                .join(' ')}
            />
            {chartData.map((item, index) => (
              <circle
                key={index}
                cx={(index / (chartData.length - 1)) * 400}
                cy={200 - (item.y / Math.max(...chartData.map(d => d.y))) * 180}
                r="4"
                fill="hsl(var(--primary))"
              />
            ))}
          </svg>
        </div>
      );
    }

    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Data Visualization
            </CardTitle>
            <CardDescription>
              {processedData.length} of {data.rows.length} rows • Execution time: {data.executionTime}ms
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData('csv')}
            >
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData('json')}
            >
              <Download className="h-4 w-4 mr-1" />
              JSON
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="table" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              Table
            </TabsTrigger>
            <TabsTrigger value="bar" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Bar
            </TabsTrigger>
            <TabsTrigger value="pie" className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Pie
            </TabsTrigger>
            <TabsTrigger value="line" className="flex items-center gap-2">
              <LineChartIcon className="h-4 w-4" />
              Line
            </TabsTrigger>
          </TabsList>

          {/* Chart Controls */}
          {chartType !== 'table' && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>X Axis</Label>
                  <Select value={xAxis} onValueChange={setXAxis}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select X axis" />
                    </SelectTrigger>
                    <SelectContent>
                      {stringColumns.map((col) => (
                        <SelectItem key={col} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Y Axis</Label>
                  <Select value={yAxis} onValueChange={setYAxis}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Y axis" />
                    </SelectTrigger>
                    <SelectContent>
                      {numericColumns.map((col) => (
                        <SelectItem key={col} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Orientation</Label>
                  <Select value={chartOrientation} onValueChange={(value: ChartOrientation) => setChartOrientation(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vertical">Vertical</SelectItem>
                      <SelectItem value="horizontal">Horizontal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max Items</Label>
                  <Input
                    type="number"
                    value={maxItems}
                    onChange={(e) => setMaxItems(parseInt(e.target.value) || 20)}
                    min="1"
                    max="100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Table View */}
          <TabsContent value="table" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="search">Search:</Label>
                  <Input
                    id="search"
                    placeholder="Search data..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="maxItems">Max rows:</Label>
                  <Input
                    id="maxItems"
                    type="number"
                    value={maxItems}
                    onChange={(e) => setMaxItems(parseInt(e.target.value) || 20)}
                    className="w-20"
                    min="1"
                    max="1000"
                  />
                </div>
              </div>
            </div>

            <ScrollArea className="h-[400px] border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    {data.columns.map((column) => (
                      <TableHead key={column} className="cursor-pointer hover:bg-muted/50">
                        <div
                          className="flex items-center gap-1"
                          onClick={() => handleSort(column)}
                        >
                          {column}
                          {sortColumn === column && (
                            <Badge variant="secondary" className="text-xs">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </Badge>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedData.map((row, index) => (
                    <TableRow key={index}>
                      {data.columns.map((column) => (
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
              </Table>
            </ScrollArea>
          </TabsContent>

          {/* Chart Views */}
          <TabsContent value="bar" className="mt-4">
            {renderChart()}
          </TabsContent>

          <TabsContent value="pie" className="mt-4">
            {renderChart()}
          </TabsContent>

          <TabsContent value="line" className="mt-4">
            {renderChart()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}