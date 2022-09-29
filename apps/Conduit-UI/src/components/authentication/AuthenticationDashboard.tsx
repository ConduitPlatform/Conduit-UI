import React from 'react';
import { Container, Grid } from '@mui/material';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import ExtractQueryRangeGraph from '../metrics/ExtractMetricGraph';
import RequestsLatency from '../metrics/RequestLatency';
import ModuleHealth from '../metrics/ModuleHealth';
import MetricCount from '../metrics/MetricCount';

const AuthenticationDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item container rowSpacing={1} columnSpacing={1.5}>
          <Grid item xs={6} sm={2}>
            <RequestsLatency small module="authentication" />
          </Grid>

          <Grid item xs={6} sm={2}>
            <ModuleHealth small module="authentication" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCount
              small
              title="Logged in users"
              expression="conduit_logged_in_users_total[5m]"
            />
          </Grid>
        </Grid>
        <Grid item sm={12} lg={6}>
          <TotalRequestsByModule module="authentication" />
        </Grid>
        <Grid item sm={12} lg={6}>
          <ExtractQueryRangeGraph
            expression="sum(increase(conduit_login_requests_total[5m]))"
            graphTitle="Login requests"
            label="Requests"
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default AuthenticationDashboard;
