import { Box, Container, Grid, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { Carousel } from '@mantine/carousel';
import { HomePageCard } from '@conduitplatform/ui-components';
import { Info, People } from '@mui/icons-material';
import {
  asyncGetAuthenticationConfig,
  asyncGetAuthUserData,
} from '../../redux/slices/authenticationSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { ApexOptions } from 'apexcharts';
import ConduitCheckbox from './ConduitCheckbox';
import { asyncGetMetricsQuery } from '../../redux/slices/metricsSlice';
import el from 'apexcharts/dist/locales/el.json';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const AuthenticationDashboard = () => {
  const dispatch = useAppDispatch();
  const { count } = useAppSelector((state) => state.authenticationSlice.data.authUsers);
  const { config } = useAppSelector((state) => state.authenticationSlice.data);

  const data = useAppSelector((state) => state?.metricsSlice?.metrics?.['authentication']?.[0]);

  useEffect(() => {
    dispatch(asyncGetMetricsQuery({ module: 'authentication' }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(asyncGetAuthenticationConfig());
  }, [dispatch]);

  const activeMethods = Object.values(config).filter((e: any) => e.enabled === true).length - 1;

  useEffect(() => {
    dispatch(
      asyncGetAuthUserData({
        skip: 0,
        limit: 25,
      })
    );
  }, [dispatch]);

  const placeholderOptions: ApexOptions = {
    chart: {
      id: 'basic-bar',
      fontFamily: 'JetBrains Mono',
      background: '#202030',
      locales: [el],
      defaultLocale: 'el',
    },
    title: {
      text: 'Placeholder diagram',
      align: 'left',
    },
    theme: {
      mode: 'dark',
      palette: 'palette4',
    },
    xaxis: {
      categories: ['30/8', '31/8', '01/9'],
    },
  };

  const placeholderSeries = [
    {
      name: 'total requests',
      data: [20, 50, 130],
    },
  ];

  const options: ApexOptions = {
    chart: {
      id: 'basic-bar',
      fontFamily: 'JetBrains Mono',
      background: '#202030',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },
    title: {
      text: 'Total module requests',
      align: 'left',
    },
    theme: {
      mode: 'dark',
      palette: 'palette4',
    },
    xaxis: {
      type: 'datetime',
      categories: data?.timestamps ?? [],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: undefined, // optional, if not defined - uses the shades of same color in series
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 100],
        colorStops: [],
      },
    },
  };

  const series = [
    {
      name: 'total requests',
      data: data?.counters ?? [],
    },
  ];

  return (
    <Container maxWidth="xl">
      <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
        <Carousel
          breakpoints={[{ maxWidth: 'sm', slideSize: '33.333333%' }]}
          height={220}
          slideSize="33.333333%"
          orientation="horizontal"
          slideGap="sm"
          align="start"
          withControls={false}
          withIndicators
          styles={{
            indicator: {
              width: 12,
              height: 4,
              transition: 'width 250ms ease',

              '&[data-active]': {
                width: 25,
                backgroundColor: '#07D9C4',
              },
            },
          }}>
          <Carousel.Slide>
            <HomePageCard
              theme="light"
              title="At a glance"
              descriptionContent={
                <Box display="flex" height="100px" flexDirection="column">
                  <Typography variant="subtitle2">
                    Module is {config.active ? 'enabled' : 'disabled'}
                  </Typography>
                  <Typography variant="subtitle2">Total users: {count}</Typography>
                  <Typography variant="subtitle2">
                    Active sign-in methods: {activeMethods}
                  </Typography>
                  <Typography variant="subtitle2">JWT secret: {config.jwtSecret}</Typography>
                </Box>
              }
            />
          </Carousel.Slide>
          <Carousel.Slide>
            <HomePageCard
              theme="light"
              title="Placeholder"
              descriptionContent={
                <Box display="flex" height="100px" flexDirection="column">
                  <Typography variant="subtitle2">
                    Placeholder unchecked <ConduitCheckbox />
                  </Typography>
                  <Typography variant="subtitle2">
                    Placeholder checked <ConduitCheckbox defaultChecked />{' '}
                  </Typography>
                  <Typography variant="subtitle2">
                    Placeholder disabled <ConduitCheckbox disabled />
                  </Typography>
                </Box>
              }
            />
          </Carousel.Slide>
          <Carousel.Slide>
            <HomePageCard
              theme="light"
              title="Placeholder"
              descriptionContent={
                <Box display="flex" height="100px" flexDirection="column">
                  <Typography variant="subtitle2">
                    Placeholder unchecked <ConduitCheckbox />
                  </Typography>
                  <Typography variant="subtitle2">
                    Placeholder checked <ConduitCheckbox defaultChecked />{' '}
                  </Typography>
                  <Typography variant="subtitle2">
                    Placeholder disabled <ConduitCheckbox disabled />
                  </Typography>
                </Box>
              }
            />
          </Carousel.Slide>
        </Carousel>

        <Grid container spacing={4}>
          <Grid item sm={6}>
            <ReactApexChart
              options={options}
              series={series}
              type="line"
              width="100%"
              height="300px"
            />
          </Grid>

          <Grid item sm={6}>
            <ReactApexChart
              options={placeholderOptions}
              series={placeholderSeries}
              type="scatter"
              width="100%"
              height="300px"
            />
          </Grid>
          <Grid item sm={6}>
            <ReactApexChart
              options={placeholderOptions}
              series={placeholderSeries}
              type="area"
              width="100%"
              height="300px"
            />
          </Grid>

          <Grid item sm={6}>
            <ReactApexChart
              options={placeholderOptions}
              series={placeholderSeries}
              type="bar"
              width="100%"
              height="300px"
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AuthenticationDashboard;
