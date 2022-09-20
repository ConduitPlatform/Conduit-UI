import React from 'react';
import { Container, Grid } from '@mui/material';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import ExtractQueryRangeGraph from '../metrics/ExtractMetricGraph';
import { GraphContainer } from '@conduitplatform/ui-components';
import RequestsLatency from '../metrics/RequestLatency';
import ModuleHealth from '../metrics/ModuleHealth';

const AuthenticationDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item sm={12}>
          <GraphContainer>
            <TotalRequestsByModule module="authentication" />
          </GraphContainer>
        </Grid>
        <Grid item md={12} lg={6}>
          <GraphContainer>
            <ExtractQueryRangeGraph
              query="/query_range"
              expression="sum(increase(conduit_logged_in_users_total[5m]))"
              graphTitle="Logged in users"
              label="Users"
            />
          </GraphContainer>
        </Grid>
        <Grid item md={12} lg={6}>
          <GraphContainer>
            <ExtractQueryRangeGraph
              query="/query_range"
              expression="sum(increase(conduit_login_requests_total[5m]))"
              graphTitle="Total login requests"
              label="Requests"
            />
          </GraphContainer>
        </Grid>
        <Grid item xs={4}>
          <RequestsLatency module="authentication" />
        </Grid>
        <Grid item xs={4}>
          <ModuleHealth module="authentication" />
        </Grid>
      </Grid>
    </Container>
  );
};

export default AuthenticationDashboard;
