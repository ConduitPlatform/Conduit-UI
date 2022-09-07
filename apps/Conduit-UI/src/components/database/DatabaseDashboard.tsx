import React from 'react';
import { Container, Grid } from '@mui/material';
import ExtractGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import { GraphContainer } from '@conduitplatform/ui-components';

const DatabaseDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <GraphContainer>
            <TotalRequestsByModule module="database" />
          </GraphContainer>
        </Grid>
        <Grid item xs={12} sm={6}>
          <GraphContainer>
            <ExtractGraph
              query="/query_range"
              expression="rate(conduit_database_queries_total[10m])*100"
              graphTitle="Database queries"
              label="Queries"
            />
          </GraphContainer>
        </Grid>
        <Grid item xs={12} sm={6}>
          <GraphContainer>
            <ExtractGraph
              query="/query_range"
              expression="rate(conduit_registered_schemas_total[10m])"
              graphTitle="Registered schemas"
              label="Schemas"
            />
          </GraphContainer>
        </Grid>
        <Grid item xs={12} sm={6}>
          <GraphContainer>
            <ExtractGraph
              query="/query_range"
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
