import { Box, Container, Grid, Icon, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { Carousel } from '@mantine/carousel';
import { HomePageCard } from '@conduitplatform/ui-components';
import {
  asyncGetAuthenticationConfig,
  asyncGetAuthUserData,
} from '../../redux/slices/authenticationSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import ConduitCheckbox from './ConduitCheckbox';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import ExtractGraph from '../metrics/ExtractMetricGraph';
import ModuleHealth from '../metrics/ModuleHealth';
import { Lightbulb } from '@mui/icons-material';

const AuthenticationDashboard = () => {
  const dispatch = useAppDispatch();
  const { count } = useAppSelector((state) => state.authenticationSlice.data.authUsers);
  const { config } = useAppSelector((state) => state.authenticationSlice.data);

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

  return (
    <Container maxWidth="xl">
      <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
        <Carousel
          breakpoints={[
            { maxWidth: 'xs', slideSize: '100%' },
            { maxWidth: 'sm', slideSize: '100%' },
            { maxWidth: 'md', slideSize: '100%' },
            { maxWidth: 'lg', slideSize: '33,3333%' },
          ]}
          slideSize="33.333333%"
          orientation="horizontal"
          slideGap="sm"
          height={200}
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
                <Box display="flex" flexDirection="column">
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
                <Box display="flex" flexDirection="column">
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
                <Box display="flex" flexDirection="column">
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
        <Grid container spacing={1}>
          <Grid item sm={12}>
            <Box>
              <TotalRequestsByModule module="authentication" />
            </Box>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ExtractGraph
                query="/query_range"
                expression="sum(increase(conduit_logged_in_users_total[5m]))"
                graphTitle="Logged in users"
                label="Users"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ExtractGraph
                query="/query_range"
                expression="sum(increase(conduit_login_requests_total[5m]))"
                graphTitle="Total login requests"
                label="Requests"
              />
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AuthenticationDashboard;
