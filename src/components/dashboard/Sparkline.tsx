'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
  strokeColor?: string;
  fillColor?: string;
}

export function Sparkline({
  values,
  width = 120,
  height = 32,
  className,
  strokeColor = 'currentColor',
  fillColor,
}: Readonly<SparklineProps>) {
  const { linePath, areaPath } = useMemo(() => {
    if (values.length < 2) {
      return { linePath: '', areaPath: '' };
    }

    const padding = 1;
    const w = width - padding * 2;
    const h = height - padding * 2;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = values.map((v, i) => ({
      x: padding + (i / (values.length - 1)) * w,
      y: padding + h - ((v - min) / range) * h,
    }));

    const line = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
      .join(' ');
    const area = `${line} L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`;

    return { linePath: line, areaPath: area };
  }, [values, width, height]);

  if (values.length < 2) return null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
      aria-hidden="true"
    >
      {fillColor && <path d={areaPath} fill={fillColor} opacity={0.15} />}
      <path
        d={linePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
