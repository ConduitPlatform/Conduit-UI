import { Box, Container, Grid } from '@mui/material';
import React, { useEffect } from 'react';

import {
  asyncGetAuthenticationConfig,
  asyncGetAuthUserData,
} from '../../redux/slices/authenticationSlice';
import { useAppDispatch } from '../../redux/store';

import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import ExtractGraph from '../metrics/ExtractMetricGraph';

const AuthenticationDashboard = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncGetAuthenticationConfig());
  }, [dispatch]);

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
      <Grid container spacing={2}>
        <Grid item sm={12}>
          <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
            <TotalRequestsByModule module="authentication" />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_logged_in_users_total[5m]))"
              graphTitle="Logged in users"
              label="Users"
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_login_requests_total[5m]))"
              graphTitle="Total login requests"
              label="Requests"
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AuthenticationDashboard;
