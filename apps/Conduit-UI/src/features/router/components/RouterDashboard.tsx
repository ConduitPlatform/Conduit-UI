import React from 'react';
import { Container, Grid } from '@mui/material';
import TotalRequestsByModule from '../../../components/metrics/TotalRequestsByModule';
import RequestsLatency from '../../../components/metrics/RequestLatency';
import ModuleHealth from '../../../components/metrics/ModuleHealth';
import { ExpressionsRoutesArray } from '../../../models/metrics/metricsModels';
import MultipleMetricGraph from '../../../components/metrics/MultipleMetricGraph';

const expressionClientRoutes: ExpressionsRoutesArray[] = [
  {
    title: 'graphql',
    labels: { transport: 'graphql' },
    expression: 'sum(increase(conduit_client_routes_total{inject_labels}[10m]))',
  },
  {
    title: 'rest',
    labels: { transport: 'rest' },
    expression: 'sum(increase(conduit_client_routes_total{inject_labels}[10m]))',
  },
  {
    title: 'socket',
    labels: { transport: 'socket' },
    expression: 'sum(increase(conduit_client_routes_total{inject_labels}[10m]))',
  },
];

const RouterDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item container rowSpacing={1} columnSpacing={2}>
          <Grid item xs={6} sm={3}>
            <RequestsLatency small module="router" />
          </Grid>
          <Grid item xs={6} sm={3}>
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
        <Grid item xs={12} lg={12}>
          <TotalRequestsByModule module="router" />
        </Grid>
      </Grid>
    </Container>
  );
};

export default RouterDashboard;
