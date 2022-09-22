import React from 'react';
import { Container, Grid } from '@mui/material';
import ExtractQueryRangeGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import { GraphContainer } from '@conduitplatform/ui-components';
import RequestsLatency from '../metrics/RequestLatency';
import ModuleHealth from '../metrics/ModuleHealth';

const RouterDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <GraphContainer>
            <TotalRequestsByModule module="router" />
          </GraphContainer>
        </Grid>
        <Grid item md={12} lg={6}>
          <GraphContainer>
            <ExtractQueryRangeGraph
              expression="sum(increase(conduit_registered_routes_total[1h]))"
              graphTitle="Registered routes"
              label="Routes"
            />
          </GraphContainer>
        </Grid>
        <Grid item xs={3}>
          <RequestsLatency module="router" />
        </Grid>
        <Grid item xs={3}>
          <ModuleHealth module="router" />
        </Grid>
      </Grid>
    </Container>
  );
};

export default RouterDashboard;
