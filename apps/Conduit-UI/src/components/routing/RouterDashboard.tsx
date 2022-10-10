import React from 'react';
import { Container, Grid } from '@mui/material';
import ExtractQueryRangeGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import RequestsLatency from '../metrics/RequestLatency';
import ModuleHealth from '../metrics/ModuleHealth';
import { ExpressionsRoutesArray } from '../../models/metrics/metricsModels';
import MultipleMetricGraph from '../metrics/MultipleMetricGraph';

const expressionClientRoutes: ExpressionsRoutesArray[] = [
  {
    title: 'graphql',
    expression: 'sum(increase(conduit_client_routes_total{transport="graphql"}[10m]))',
  },
  {
    title: 'rest',
    expression: 'sum(increase(conduit_client_routes_total{transport="rest"}[10m]))',
  },
  {
    title: 'socket',
    expression: 'sum(increase(conduit_client_routes_total{transport="socket"}[10m]))',
  },
];

const RouterDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item container rowSpacing={1} columnSpacing={1.5}>
          <Grid item xs={6} sm={2}>
            <RequestsLatency small module="router" />
          </Grid>
          <Grid item xs={6} sm={2}>
            <ModuleHealth small module="router" />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <MultipleMetricGraph
            label="Requests"
            expressionsRoutes={expressionClientRoutes}
            hasControls={false}
            graphTitle={'Client Routes'}
          />
        </Grid>
        <Grid item xs={12} lg={6}>
          <TotalRequestsByModule module="router" />
        </Grid>
        <Grid item md={12} lg={6}>
          <ExtractQueryRangeGraph
            expression="sum(increase(conduit_registered_routes_total[1h]))"
            graphTitle="Registered Routes"
            label="Routes"
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default RouterDashboard;
