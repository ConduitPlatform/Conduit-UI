'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  fetchRequestVolumeChartAction,
  fetchResponseTimeChartAction,
  fetchErrorRateChartAction,
  fetchSystemResourcesChartAction,
} from '@/lib/prometheus/metrics';
import type { MetricChartData } from '@/lib/prometheus/metrics';
import { Monitor, RefreshCw } from 'lucide-react';

type TimeRange = '1h' | '6h' | '24h' | '7d';
type TabKey = 'requests' | 'response' | 'errors' | 'resources';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'requests', label: 'Requests' },
  { key: 'response', label: 'Response' },
  { key: 'errors', label: 'Errors' },
  { key: 'resources', label: 'Resources' },
];

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '1h', label: '1h' },
  { value: '6h', label: '6h' },
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
];

const AUTO_REFRESH_MS = 30_000;

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md bg-popover px-3 py-2 text-popover-foreground border border-border shadow-[var(--shadow-2)]">
      <p className="text-xs font-medium mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p
          key={i}
          className="text-xs tabular-nums"
          style={{ color: entry.color }}
        >
          {entry.name}: {formatVal(entry.value, entry.name)}
        </p>
      ))}
    </div>
  );
}

function formatVal(value: number, metric: string): string {
  const m = metric.toLowerCase();
  if (m.includes('cpu') || m.includes('memory')) {
    if (value <= 1) return `${(value * 100).toFixed(0)}%`;
    return `${value.toFixed(0)}%`;
  }
  if (m.includes('request')) return `${value.toFixed(2)}/s`;
  if (m.includes('response'))
    return value < 1
      ? `${(value * 1000).toFixed(1)}ms`
      : `${value.toFixed(2)}s`;
  if (m.includes('error')) return `${value.toFixed(2)}%`;
  return value.toFixed(2);
}

function toChartData(d?: MetricChartData) {
  if (!d || d.timestamps.length === 0) return [];
  return d.timestamps.map((ts, i) => ({
    time: new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    value: d.values[i] ?? 0,
  }));
}

interface PerformanceChartsProps {
  initialData: {
    requestVolume: MetricChartData;
    responseTime: MetricChartData;
    errorRate: MetricChartData;
    systemResources: { cpu: MetricChartData; memory: MetricChartData };
  };
}

export function PerformanceCharts({
  initialData,
}: Readonly<PerformanceChartsProps>) {
  const [tab, setTab] = useState<TabKey>('requests');
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState(initialData);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const fetchAll = useCallback(async (range: TimeRange) => {
    setIsRefreshing(true);
    try {
      const [req, resp, err, sys] = await Promise.all([
        fetchRequestVolumeChartAction(range),
        fetchResponseTimeChartAction(range),
        fetchErrorRateChartAction(range),
        fetchSystemResourcesChartAction(range),
      ]);
      setData({
        requestVolume: req,
        responseTime: resp,
        errorRate: err,
        systemResources: sys,
      });
      setLastUpdated(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (timeRange !== '1h') {
      fetchAll(timeRange);
    }
  }, [timeRange, fetchAll]);

  useEffect(() => {
    timerRef.current = setInterval(() => fetchAll(timeRange), AUTO_REFRESH_MS);
    return () => clearInterval(timerRef.current);
  }, [timeRange, fetchAll]);

  const requestsData = toChartData(data.requestVolume);
  const responseData = toChartData(data.responseTime);
  const errorsData = toChartData(data.errorRate);
  const cpuData = toChartData(data.systemResources.cpu);
  const memData = toChartData(data.systemResources.memory);

  const resourcesData =
    cpuData.length > 0
      ? cpuData.map((point, i) => ({
          ...point,
          cpu: point.value,
          memory: memData[i]?.value ?? 0,
        }))
      : memData.map(point => ({
          ...point,
          cpu: 0,
          memory: point.value,
        }));

  const updatedLabel = lastUpdated.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="rounded-lg border border-border bg-surface-1 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Monitor className="size-3.5 text-muted-foreground" />
          <span className="text-[13px] font-semibold">Performance</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground tabular-nums hidden sm:inline">
            {updatedLabel}
          </span>
          <button
            onClick={() => fetchAll(timeRange)}
            disabled={isRefreshing}
            className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors duration-100 disabled:opacity-50"
          >
            <RefreshCw
              className={cn('size-3', isRefreshing && 'animate-spin')}
            />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-border/60">
        <div className="flex gap-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'px-2.5 py-1 text-xs rounded-md transition-colors duration-100',
                tab === t.key
                  ? 'bg-primary-muted text-primary-muted-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-0.5 ml-auto">
          {TIME_RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => setTimeRange(r.value)}
              className={cn(
                'px-2 py-[3px] text-[11px] rounded transition-colors duration-100',
                timeRange === r.value
                  ? 'bg-surface-2 text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart body */}
      <div className="h-[200px] px-3.5 pt-3 pb-2">
        {tab === 'requests' && (
          <ChartPanel
            data={requestsData}
            type="area"
            color="var(--color-chart-1)"
          />
        )}
        {tab === 'response' && (
          <ChartPanel
            data={responseData}
            type="area"
            color="var(--color-chart-2)"
          />
        )}
        {tab === 'errors' && (
          <ChartPanel
            data={errorsData}
            type="bar"
            color="var(--color-chart-3)"
          />
        )}
        {tab === 'resources' && <ResourceChart data={resourcesData} />}
      </div>
    </div>
  );
}

function ChartPanel({
  data,
  type,
  color,
}: {
  data: { time: string; value: number }[];
  type: 'line' | 'area' | 'bar';
  color: string;
}) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-[13px] text-muted-foreground">
        No data available for this time range
      </div>
    );
  }

  const gridProps = {
    strokeDasharray: '3 3',
    stroke: 'var(--color-chart-grid)',
    strokeWidth: 1,
  };
  const xProps = {
    dataKey: 'time' as const,
    tick: { fontSize: 10, fill: 'var(--color-chart-axis)' },
    interval: 'preserveStartEnd' as const,
    tickLine: false,
    axisLine: false,
  };
  const yProps = {
    tick: { fontSize: 10, fill: 'var(--color-chart-axis)' },
    tickLine: false,
    axisLine: false,
    width: 40,
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      {type === 'area' ? (
        <AreaChart data={data}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid {...gridProps} />
          <XAxis {...xProps} />
          <YAxis {...yProps} />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            name="Value"
            stroke={color}
            fill="url(#areaGrad)"
            strokeWidth={2}
            strokeLinecap="round"
            activeDot={{
              r: 3.5,
              fill: color,
              stroke: 'var(--color-surface-1)',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      ) : type === 'line' ? (
        <LineChart data={data}>
          <CartesianGrid {...gridProps} />
          <XAxis {...xProps} />
          <YAxis {...yProps} />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            name="Value"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            dot={false}
            activeDot={{
              r: 3.5,
              fill: color,
              stroke: 'var(--color-surface-1)',
              strokeWidth: 2,
            }}
          />
        </LineChart>
      ) : (
        <BarChart data={data}>
          <CartesianGrid {...gridProps} />
          <XAxis {...xProps} />
          <YAxis {...yProps} />
          <Tooltip content={<ChartTooltip />} />
          <Bar
            dataKey="value"
            name="Errors"
            fill={color}
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}

function ResourceChart({
  data,
}: {
  data: { time: string; cpu: number; memory: number }[];
}) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-[13px] text-muted-foreground">
        No data available for this time range
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-chart-grid)"
            strokeWidth={1}
          />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'var(--color-chart-axis)' }}
            interval="preserveStartEnd"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--color-chart-axis)' }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="cpu"
            name="CPU"
            stroke="var(--color-chart-4)"
            strokeWidth={2}
            strokeLinecap="round"
            dot={false}
            activeDot={{ r: 3.5, strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="memory"
            name="Memory"
            stroke="var(--color-chart-5)"
            strokeWidth={2}
            strokeLinecap="round"
            dot={false}
            activeDot={{ r: 3.5, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 pt-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-sm bg-chart-4" />
          CPU
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-sm bg-chart-5" />
          Memory
        </div>
      </div>
    </div>
  );
}
