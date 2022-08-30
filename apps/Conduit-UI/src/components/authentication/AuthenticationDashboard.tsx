import { Box, Typography } from '@mui/material';
import { ApexOptions } from 'apexcharts';
import React from 'react';
import Chart from 'react-apexcharts';
const AuthenticationDashboard = () => {
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
      categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
    },
  };

  const series = [
    {
      name: 'series-1',
      data: [30, 40, 45, 50, 49, 60, 70, 91],
    },
  ];

  const radialOptions: ApexOptions = {
    chart: {
      height: 120,
      type: 'radialBar',
      offsetY: -10,
      background: '#262840',
    },
    theme: {
      mode: 'dark',
      palette: 'palette4',
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        dataLabels: {
          name: {
            fontSize: '16px',
            color: undefined,
            offsetY: 120,
          },
          value: {
            offsetY: 76,
            fontSize: '22px',
            color: undefined,
            formatter: function (val) {
              return val + '%';
            },
          },
        },
      },
    },
    stroke: {
      dashArray: 2,
    },
    labels: ['Median Ratio'],
  };

  const radialSeries = [67];
  return (
    <Box display="flex" flexDirection="column" gap={4}>
      <Box display="flex" flexDirection="column" gap={3}>
        <Typography>Dataset 1:</Typography>
        <Chart options={options} series={series} type="bar" width="500" />
      </Box>
      <Box display="flex" flexDirection="column" gap={3}>
        <Typography>Dataset 2:</Typography>
        <Chart options={options} series={series} type="line" width="500" />
      </Box>
      <Box display="flex" flexDirection="column" gap={3}>
        <Typography>Dataset 3:</Typography>
        <Chart options={radialOptions} series={radialSeries} type="radialBar" width="500" />
      </Box>
    </Box>
  );
};

export default AuthenticationDashboard;
