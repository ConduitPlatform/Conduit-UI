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
        <Grid item container rowSpacing={1} columnSpacing={1.5}>
          <Grid item xs={6} sm={2}>
            <RequestsLatency small module="authentication" />
          </Grid>

          <Grid xs={6} item sm={2}>
            <ModuleHealth small module="authentication" />
          </Grid>
        </Grid>
        <Grid item sm={12} md={6}>
          <TotalRequestsByModule module="authentication" />
        </Grid>

        <Grid item sm={12} md={6}>
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
