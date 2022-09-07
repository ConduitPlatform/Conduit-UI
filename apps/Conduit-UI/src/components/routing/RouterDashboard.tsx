import React from 'react';
import { Container, Grid, Paper } from '@mui/material';
import ExtractGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';

const RouterDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ padding: 4, borderRadius: '24px' }}>
            <TotalRequestsByModule module="router" />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ padding: 4, borderRadius: '24px' }}>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_registered_routes_total[1h]))"
              graphTitle="Registered routes"
              label="Routes"
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RouterDashboard;
