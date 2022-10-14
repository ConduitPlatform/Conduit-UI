import React from 'react';
import { Container, Grid } from '@mui/material';
import ExtractQueryRangeGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import RequestsLatency from '../metrics/RequestLatency';
import ModuleHealth from '../metrics/ModuleHealth';
import MetricCount from '../metrics/MetricCount';

const DatabaseDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item container rowSpacing={1} columnSpacing={2}>
          <Grid item md={3} sm={6} xs={6}>
            <RequestsLatency small module="database" />
          </Grid>
          <Grid item md={3} sm={6} xs={6}>
            <ModuleHealth small module="database" />
          </Grid>
          <Grid item md={3} sm={6} xs={6}>
            <MetricCount
              small
              title="Conduit Schemas"
              expression="conduit_registered_schemas_total{imported='false'}[10m]"
            />
          </Grid>
          <Grid item md={3} sm={6} xs={6}>
            <MetricCount
              small
              title="Imported Schemas"
              expression="conduit_registered_schemas_total{imported='true'}[10m]"
            />
          </Grid>
        </Grid>
        <Grid item xs={12} lg={6}>
          <TotalRequestsByModule module="database" />
        </Grid>
        <Grid item xs={12} lg={6}>
          <ExtractQueryRangeGraph
            expression="sum(increase(conduit_database_queries_total[10m]))"
            graphTitle="Database Queries"
            label="Queries"
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default DatabaseDashboard;
