import { Box, Typography } from '@mui/material';
import { ApexOptions } from 'apexcharts';
import React, { useEffect } from 'react';
import { asyncGetMetricsQuery } from '../../redux/slices/metricsSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { ModulesTypes } from '../../models/logs/LogsModels';
import { MetricsData } from '../../models/metrics/metricsModels';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const moduleName: ModulesTypes = 'database';

const DatabaseDashboard = () => {
  const dispatch = useAppDispatch();
  const data: MetricsData = useAppSelector(
    (state) => state?.metricsSlice?.metrics?.[moduleName]?.[0]
  );

  useEffect(() => {
    dispatch(asyncGetMetricsQuery({ module: moduleName }));
  }, [dispatch]);

  const options: ApexOptions = {
    chart: {
      id: 'basic-bar',
      fontFamily: 'JetBrains Mono',
      background: '#202030',
    },
    theme: {
      mode: 'dark',
      palette: 'palette4',
    },
    xaxis: {
      type: 'datetime',
      categories: data?.timestamps ?? [],
    },
  };

  const series = [
    {
      name: 'total requests',
      data: data?.counters ?? [],
    },
  ];

  return (
    <Box>
      <Box width="600px" display="flex" flexDirection="column" gap={3}>
        <Typography>Dataset 1:</Typography>
        <ReactApexChart options={options} series={series} type="line" width="100%" />
      </Box>
    </Box>
  );
};

export default DatabaseDashboard;
