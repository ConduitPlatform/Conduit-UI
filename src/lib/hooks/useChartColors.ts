'use client';

import { useEffect, useState } from 'react';

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

function cssVarToHex(varName: string): string {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  if (!raw) return '#888888';
  const parts = raw.split(/\s+/).map(Number);
  if (parts.length >= 3) {
    return hslToHex(parts[0], parts[1], parts[2]);
  }
  return '#888888';
}

export function useChartColors() {
  const [colors, setColors] = useState({
    chart1: '#3b82f6',
    chart2: '#10b981',
    chart3: '#ef4444',
    chart4: '#f59e0b',
    chart5: '#8b5cf6',
    chartGrid: '#f0f0f0',
    background: '#f8fafc',
  });

  useEffect(() => {
    setColors({
      chart1: cssVarToHex('--chart-1'),
      chart2: cssVarToHex('--chart-2'),
      chart3: cssVarToHex('--chart-3'),
      chart4: cssVarToHex('--chart-4'),
      chart5: cssVarToHex('--chart-5'),
      chartGrid: cssVarToHex('--chart-grid'),
      background: cssVarToHex('--background'),
    });
  }, []);

  return colors;
}
