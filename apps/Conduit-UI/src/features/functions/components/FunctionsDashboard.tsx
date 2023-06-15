import React from 'react';
import { Container, Grid } from '@mui/material';
import TotalRequestsByModule from '../../../components/metrics/TotalRequestsByModule';
import RequestsLatency from '../../../components/metrics/RequestLatency';
import ModuleHealth from '../../../components/metrics/ModuleHealth';
import MetricCount from '../../../components/metrics/MetricCount';

const FunctionsDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item container rowSpacing={1} columnSpacing={2}>
          <Grid item xs={6} sm={3}>
            <RequestsLatency small module="functions" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <ModuleHealth small module="functions" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCount
              small
              title="Function Executions"
              expression="conduit_executed_functions_total{inject_labels}[10m]"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCount
              small
              title="Failed Functions"
              expression="conduit_failed_functions_total{inject_labels}[10m]"
            />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <TotalRequestsByModule module="functions" />
        </Grid>
      </Grid>
    </Container>
  );
};

export default FunctionsDashboard;
