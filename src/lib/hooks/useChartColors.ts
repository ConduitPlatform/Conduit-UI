'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

type ChartColors = {
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  chartGrid: string;
  background: string;
};

const chartColorFallbacks: Record<'dark' | 'light', ChartColors> = {
  dark: {
    chart1: '#40cce7',
    chart2: '#59cf9a',
    chart3: '#eeb64f',
    chart4: '#a67ee7',
    chart5: '#e36d9e',
    chartGrid: '#2f3541',
    background: '#0b0d13',
  },
  light: {
    chart1: '#097695',
    chart2: '#1a8953',
    chart3: '#ae6709',
    chart4: '#6c34c5',
    chart5: '#b62b65',
    chartGrid: '#d5dae2',
    background: '#f8fafc',
  },
};

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function cssVarToHex(varName: string, fallback: string): string {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  const match = raw.match(
    /^(-?\d*\.?\d+)(?:deg)?[\s,]+(\d*\.?\d+)%[\s,]+(\d*\.?\d+)%/
  );
  if (!match) return fallback;

  return hslToHex(Number(match[1]), Number(match[2]), Number(match[3]));
}

export function useChartColors() {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState<ChartColors>(chartColorFallbacks.dark);

  useEffect(() => {
    const fallbacks =
      chartColorFallbacks[resolvedTheme === 'light' ? 'light' : 'dark'];

    setColors({
      chart1: cssVarToHex('--chart-1', fallbacks.chart1),
      chart2: cssVarToHex('--chart-2', fallbacks.chart2),
      chart3: cssVarToHex('--chart-3', fallbacks.chart3),
      chart4: cssVarToHex('--chart-4', fallbacks.chart4),
      chart5: cssVarToHex('--chart-5', fallbacks.chart5),
      chartGrid: cssVarToHex('--chart-grid', fallbacks.chartGrid),
      background: cssVarToHex('--background', fallbacks.background),
    });
  }, [resolvedTheme]);

  return colors;
}
