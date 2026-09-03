'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { toOpaqueHexColor } from '@/lib/semantic-colors';

type ChartColors = {
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  chartGrid: string;
  background: string;
  graphEdge: string;
  graphMiddleware: string;
};

const semanticColorFallbacks: ChartColors = {
  chart1: 'var(--color-chart-1, currentColor)',
  chart2: 'var(--color-chart-2, currentColor)',
  chart3: 'var(--color-chart-3, currentColor)',
  chart4: 'var(--color-chart-4, currentColor)',
  chart5: 'var(--color-chart-5, currentColor)',
  chartGrid: 'var(--color-chart-grid, currentColor)',
  background: 'var(--color-background, Canvas)',
  graphEdge: 'var(--color-graph-edge, currentColor)',
  graphMiddleware: 'var(--color-graph-middleware, currentColor)',
};

function readCssColor(varName: string, fallback: string): string {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  if (!raw) return fallback;

  return toOpaqueHexColor(raw) ?? fallback;
}

export function useChartColors() {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState<ChartColors>(semanticColorFallbacks);

  useEffect(() => {
    const root = document.documentElement;
    let frameId: number | null = null;

    const readColors = () => {
      frameId = null;
      setColors({
        chart1: readCssColor('--chart-1', semanticColorFallbacks.chart1),
        chart2: readCssColor('--chart-2', semanticColorFallbacks.chart2),
        chart3: readCssColor('--chart-3', semanticColorFallbacks.chart3),
        chart4: readCssColor('--chart-4', semanticColorFallbacks.chart4),
        chart5: readCssColor('--chart-5', semanticColorFallbacks.chart5),
        chartGrid: readCssColor(
          '--chart-grid',
          semanticColorFallbacks.chartGrid
        ),
        background: readCssColor(
          '--background',
          semanticColorFallbacks.background
        ),
        graphEdge: readCssColor(
          '--graph-edge',
          semanticColorFallbacks.graphEdge
        ),
        graphMiddleware: readCssColor(
          '--graph-middleware',
          semanticColorFallbacks.graphMiddleware
        ),
      });
    };

    const scheduleRead = () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(readColors);
    };

    const observer = new MutationObserver(scheduleRead);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    scheduleRead();

    return () => {
      observer.disconnect();
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [resolvedTheme]);

  return colors;
}
