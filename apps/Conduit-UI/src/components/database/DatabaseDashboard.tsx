import React from 'react';
import { Container, Grid } from '@mui/material';
import ExtractQueryRangeGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import { GraphContainer } from '@conduitplatform/ui-components';
import RequestsLatency from '../metrics/RequestLatency';
import ModuleHealth from '../metrics/ModuleHealth';
import MetricCount from '../metrics/MetricCount';

const DatabaseDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={6} sm={4}>
          <RequestsLatency module="database" />
        </Grid>
        <Grid item xs={6} sm={4}>
          <ModuleHealth module="database" />
        </Grid>
        <Grid item xs={6} sm={4}>
          <MetricCount
            title="Non imported Schemas"
            expression="conduit_registered_schemas_total{imported='false'}[5m]"
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <MetricCount
            title="Imported Schemas"
            expression="conduit_registered_schemas_total{imported='true'}[5m]"
          />
        </Grid>
        <Grid item xs={12}>
          <GraphContainer>
            <TotalRequestsByModule module="database" />
          </GraphContainer>
        </Grid>
        <Grid item md={12} lg={6}>
          <GraphContainer>
            <ExtractQueryRangeGraph
              expression="rate(conduit_database_queries_total[10m])*100"
              graphTitle="Database queries"
              label="Queries"
            />
          </GraphContainer>
        </Grid>
        <Grid item md={12} lg={6}>
          <GraphContainer>
            <ExtractQueryRangeGraph
              expression="rate(conduit_registered_schemas_total[10m])"
              graphTitle="Registered schemas"
              label="Schemas"
            />
          </GraphContainer>
        </Grid>
        <Grid item md={12} lg={6}>
          <GraphContainer>
            <ExtractQueryRangeGraph
              expression="rate(conduit_custom_endpoints_total[10m])"
              graphTitle="Total custom endpoints"
              label="Custom endpoints"
            />
          </GraphContainer>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DatabaseDashboard;
