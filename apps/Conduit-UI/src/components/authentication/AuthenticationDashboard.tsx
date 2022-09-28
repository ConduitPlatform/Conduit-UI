import React from 'react';
import { Container, Grid } from '@mui/material';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import ExtractQueryRangeGraph from '../metrics/ExtractMetricGraph';
import RequestsLatency from '../metrics/RequestLatency';
import ModuleHealth from '../metrics/ModuleHealth';

const AuthenticationDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={6} sm={4}>
          <RequestsLatency module="authentication" />
        </Grid>
        <Grid xs={6} item sm={4}>
          <ModuleHealth module="authentication" />
        </Grid>
        <Grid item sm={12}>
          <TotalRequestsByModule module="authentication" />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={6}>
          <ExtractQueryRangeGraph
            expression="sum(increase(conduit_logged_in_users_total[5m]))"
            graphTitle="Logged in users"
            label="Users"
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={6}>
          <ExtractQueryRangeGraph
            expression="sum(increase(conduit_login_requests_total[5m]))"
            graphTitle="Total login requests"
            label="Requests"
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default AuthenticationDashboard;
