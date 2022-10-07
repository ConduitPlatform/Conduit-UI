import React, { FC } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { useTheme } from '@mui/material';
import { MultipleSeries } from '../../models/metrics/metricsModels';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

type AreaChartType =
  | 'line'
  | 'area'
  | 'bar'
  | 'histogram'
  | 'pie'
  | 'donut'
  | 'radialBar'
  | 'scatter'
  | 'bubble'
  | 'heatmap'
  | 'treemap'
  | 'boxPlot'
  | 'candlestick'
  | 'radar'
  | 'polarArea'
  | 'rangeBar';

interface Props {
  canZoom?: boolean;
  graphTitle?: string;
  timestamps?: number[];
  label?: string;
  counters?: number[];
  width?: string | number;
  height?: string | number;
  loading?: boolean;
  multipleSeries?: MultipleSeries[];
  type?: AreaChartType;
}
const AreaChart: FC<Props> = ({
  canZoom,
  graphTitle,
  timestamps,
  label,
  counters,
  width = '100%',
  height = '300px',
  loading,
  multipleSeries,
  type = 'area',
}) => {
  const theme = useTheme();

  const options: ApexOptions = {
    chart: {
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: canZoom,
      },

      id: 'basic-bar',
      fontFamily: 'JetBrains Mono',
      background: theme.palette.background.paper,
      stacked: false,
    },
    grid: {
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    title: {
      text: graphTitle ?? '',
      align: 'left',
    },
    theme: {
      mode: theme.palette.mode === 'dark' ? 'dark' : 'light',
      palette: theme.palette.mode === 'dark' ? 'palette4' : 'palette2',
    },
    xaxis: {
      type: 'datetime',
      categories: timestamps ?? [],
      labels: {
        datetimeUTC: false,
        format: 'HH:mm',
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 100],
        colorStops: [],
      },
    },
    stroke: {
      show: true,
      curve: 'smooth',
      lineCap: 'butt',
      colors: undefined,
      width: 2,
      dashArray: 0,
    },
    noData: {
      text: loading ? 'Loading...' : 'No Data',
      align: 'center',
      verticalAlign: 'middle',
      offsetX: 0,
      offsetY: 0,
      style: {
        color: theme.palette.mode === 'dark' ? 'white' : 'black',
        fontFamily: 'JetBrains Mono',
      },
    },
  };

  const series = multipleSeries
    ? multipleSeries
    : [
        {
          name: label,
          data: counters ?? [],
        },
      ];

  return (
    <ReactApexChart options={options} series={series} type={type} width={width} height={height} />
  );
};

export default AreaChart;
