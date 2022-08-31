import { Box, Typography } from '@mui/material';
import { ApexOptions } from 'apexcharts';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { getRequestProm } from '../../http/requestsConfig';

const DatabaseDashboard = () => {
  const [timestamps, setTimestamps] = useState<number[]>([]);
  const [values, setValues] = useState<string[]>([]);

  useEffect(() => {
    getRequestProm('query?query=conduit_admin_grpc_requests_total[1w]').then((res) => {
      const totalData: number[] = [];
      const totalCategories: string[] = [];

      res?.data?.data?.result?.[0]?.values.forEach((e: any) => {
        totalCategories.push(moment.unix(e[0]).format('DD/MM'));
        totalData.push(e[1]);
      });

      setTimestamps(totalData);
      setValues(totalCategories);
    });
  }, []);

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
      categories: values,
    },
  };

  const series = [
    {
      name: 'total requests',
      data: timestamps,
    },
  ];
  return (
    <Box>
      <Box width="1000px" display="flex" flexDirection="column" gap={3}>
        <Typography>Dataset 1:</Typography>
        <ReactApexChart options={options} series={series} type="line" width="100%" />
      </Box>
    </Box>
  );
};

export default DatabaseDashboard;
