import React from 'react';
import { Container, Grid } from '@mui/material';
import TotalRequestsByModule from '../../../components/metrics/TotalRequestsByModule';
import ExtractQueryRangeGraph from '../../../components/metrics/ExtractMetricGraph';
import RequestsLatency from '../../../components/metrics/RequestLatency';
import ModuleHealth from '../../../components/metrics/ModuleHealth';
import MetricCount from '../../../components/metrics/MetricCount';

const AuthenticationDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item container rowSpacing={1} columnSpacing={2}>
          <Grid item xs={6} sm={3}>
            <RequestsLatency small module="authentication" />
          </Grid>

          <Grid item xs={6} sm={3}>
            <ModuleHealth small module="authentication" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCount
              small
              title="Logged-in Users"
              expression="conduit_logged_in_users_total{inject_labels}[10m]"
            />
          </Grid>
        </Grid>
        <Grid item xs={12} lg={6}>
          <TotalRequestsByModule module="authentication" />
        </Grid>
        <Grid item xs={12} lg={6}>
          <ExtractQueryRangeGraph
            expression="sum(increase(conduit_login_requests_total{inject_labels}[10m]))"
            graphTitle="Login Requests"
            label="Requests"
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default AuthenticationDashboard;
