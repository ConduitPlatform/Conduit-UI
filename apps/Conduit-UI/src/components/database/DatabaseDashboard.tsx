import React from 'react';
import { Container, Grid, Paper } from '@mui/material';
import ExtractGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';

const DatabaseDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ padding: 4, borderRadius: '24px' }}>
            <TotalRequestsByModule module="database" />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ padding: 4, borderRadius: '24px' }}>
            <ExtractGraph
              query="/query_range"
              expression="rate(conduit_database_queries_total[10m])*100"
              graphTitle="Database queries"
              label="Queries"
            />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ padding: 4, borderRadius: '24px' }}>
            <ExtractGraph
              query="/query_range"
              expression="rate(conduit_registered_schemas_total[10m])"
              graphTitle="Registered schemas"
              label="Schemas"
            />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ padding: 4, borderRadius: '24px' }}>
            <ExtractGraph
              query="/query_range"
              expression="rate(conduit_custom_endpoints_total[10m])"
              graphTitle="Total custom endpoints"
              label="Custom endpoints"
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DatabaseDashboard;
