'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Monitor,
  TrendingUp,
  Activity,
  Clock,
  AlertTriangle,
  Cpu,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { cn } from '@/lib/utils';
import {
  fetchRequestVolumeChartAction,
  fetchResponseTimeChartAction,
  fetchErrorRateChartAction,
  fetchSystemResourcesChartAction,
} from '@/lib/prometheus/metrics';

export interface SystemPerformanceChartsProps {
  className?: string;
  initialData?: {
    requestVolume: MetricChartData;
    responseTime: MetricChartData;
    errorRate: MetricChartData;
    systemResources: {
      cpu: MetricChartData;
      memory: MetricChartData;
    };
  };
}

export interface MetricChartData {
  timestamps: number[];
  values: number[];
  labels: string[];
}

const timeRangeOptions = [
  { value: '1h', label: '1 Hour' },
  { value: '6h', label: '6 Hours' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
] as const;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 border rounded-lg shadow-lg bg-white text-black dark:bg-zinc-900 dark:text-zinc-100">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatTooltipValue(entry.value, entry.name)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function formatTooltipValue(value: number, metric: string): string {
  if (
    metric.toLowerCase().includes('cpu') ||
    metric.toLowerCase().includes('memory')
  ) {
    if (value <= 1) return `${(value * 100).toFixed(0)}%`;
    if (value > 1000) {
      if (value > 1024 * 1024 * 1024)
        return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
      if (value > 1024 * 1024)
        return `${(value / (1024 * 1024)).toFixed(2)} MB`;
      return `${(value / 1024).toFixed(2)} KB`;
    }
    return `${value.toFixed(0)}%`;
  }
  if (metric.toLowerCase().includes('request')) return `${value.toFixed(2)}/s`;
  if (metric.toLowerCase().includes('response'))
    return value < 1
      ? `${(value * 1000).toFixed(2)}ms`
      : `${value.toFixed(2)}s`;
  if (metric.toLowerCase().includes('error')) return `${value.toFixed(2)}%`;
  return value.toFixed(2);
}

const getStatusColor = (value: number, metric: string): string => {
  switch (metric) {
    case 'responseTime':
      return value > 1
        ? 'text-red-600'
        : value > 0.5
          ? 'text-yellow-600'
          : 'text-green-600';
    case 'errorRate':
      return value > 5
        ? 'text-red-600'
        : value > 1
          ? 'text-yellow-600'
          : 'text-green-600';
    case 'cpu':
    case 'memory':
      return value > 80
        ? 'text-red-600'
        : value > 60
          ? 'text-yellow-600'
          : 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

export const SystemPerformanceCharts: React.FC<
  SystemPerformanceChartsProps
> = ({ className, initialData }) => {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [requestVolume, setRequestVolume] = useState<
    MetricChartData | undefined
  >(initialData?.requestVolume);
  const [responseTime, setResponseTime] = useState<MetricChartData | undefined>(
    initialData?.responseTime
  );
  const [errorRate, setErrorRate] = useState<MetricChartData | undefined>(
    initialData?.errorRate
  );
  const [systemResources, setSystemResources] = useState<
    { cpu: MetricChartData; memory: MetricChartData } | undefined
  >(initialData?.systemResources);

  const fetchAll = async (range: '1h' | '6h' | '24h' | '7d') => {
    setIsLoading(true);
    const [req, resp, err, sys] = await Promise.all([
      fetchRequestVolumeChartAction(range),
      fetchResponseTimeChartAction(range),
      fetchErrorRateChartAction(range),
      fetchSystemResourcesChartAction(range),
    ]);
    setRequestVolume(req);
    setResponseTime(resp);
    setErrorRate(err);
    setSystemResources(sys);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!initialData || timeRange !== '1h') {
      fetchAll(timeRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const handleTimeRangeChange = (range: '1h' | '6h' | '24h' | '7d') => {
    setTimeRange(range);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAll(timeRange);
    setIsRefreshing(false);
  };

  // Convert chart data to Recharts format
  const convertToChartData = (metricData?: MetricChartData) => {
    if (!metricData || metricData.timestamps.length === 0) return [];

    return metricData.timestamps.map((timestamp, index) => ({
      time: new Date(timestamp).toLocaleTimeString(),
      value: metricData.values[index] || 0,
      timestamp: timestamp,
    }));
  };

  const requestVolumeData = convertToChartData(requestVolume);
  const responseTimeData = convertToChartData(responseTime);
  const errorRateData = convertToChartData(errorRate);
  const cpuData = convertToChartData(systemResources?.cpu);
  const memoryData = convertToChartData(systemResources?.memory);

  const hasData =
    requestVolumeData.length > 0 ||
    responseTimeData.length > 0 ||
    errorRateData.length > 0 ||
    cpuData.length > 0 ||
    memoryData.length > 0;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Monitor className="h-5 w-5" />
            <span>System Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
              <p className="text-sm text-muted-foreground">
                Loading performance data...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Monitor className="h-5 w-5" />
            <span>System Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No performance data available</p>
              <p className="text-xs">Check your Prometheus configuration</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Monitor className="h-5 w-5" />
            <span>System Performance</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {timeRangeOptions.map(option => (
                <Button
                  key={option.value}
                  variant={timeRange === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeRangeChange(option.value)}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
              />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Request Volume Chart */}
        {requestVolumeData.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Activity className="h-4 w-4" />
              <h3 className="text-sm font-medium">Request Volume</h3>
              <Badge variant="secondary">
                {requestVolumeData.length > 0
                  ? formatTooltipValue(
                      requestVolumeData[requestVolumeData.length - 1]?.value ||
                        0,
                      'requestVolume'
                    )
                  : '0/s'}
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={requestVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Response Time and Error Rate Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Response Time Chart */}
          {responseTimeData.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="h-4 w-4" />
                <h3 className="text-sm font-medium">Response Time</h3>
                <Badge
                  variant="secondary"
                  className={getStatusColor(
                    responseTimeData[responseTimeData.length - 1]?.value || 0,
                    'responseTime'
                  )}
                >
                  {responseTimeData.length > 0
                    ? formatTooltipValue(
                        responseTimeData[responseTimeData.length - 1]?.value ||
                          0,
                        'responseTime'
                      )
                    : '0ms'}
                </Badge>
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <AreaChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Error Rate Chart */}
          {errorRateData.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="h-4 w-4" />
                <h3 className="text-sm font-medium">Error Rate</h3>
                <Badge
                  variant="secondary"
                  className={getStatusColor(
                    errorRateData[errorRateData.length - 1]?.value || 0,
                    'errorRate'
                  )}
                >
                  {errorRateData.length > 0
                    ? formatTooltipValue(
                        errorRateData[errorRateData.length - 1]?.value || 0,
                        'errorRate'
                      )
                    : '0%'}
                </Badge>
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={errorRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#ef4444" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* System Resources Chart */}
        {(cpuData.length > 0 || memoryData.length > 0) && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Cpu className="h-4 w-4" />
              <h3 className="text-sm font-medium">System Resources</h3>
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <ComposedChart data={cpuData.length > 0 ? cpuData : memoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                {cpuData.length > 0 && (
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="CPU"
                    dot={false}
                  />
                )}
                {memoryData.length > 0 && (
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Memory"
                    dot={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-2 text-xs text-muted-foreground">
              {cpuData.length > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-amber-500 rounded"></div>
                  <span>CPU</span>
                </div>
              )}
              {memoryData.length > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span>Memory</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
