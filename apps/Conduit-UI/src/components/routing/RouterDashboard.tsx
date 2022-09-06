import { Box, Container, Grid } from '@mui/material';
import React from 'react';
import ExtractGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';

const RouterDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
        <Box>
          <TotalRequestsByModule module="router" />
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_registered_routes_total[1h]))"
              graphTitle="Registered routes"
              label="Routes"
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default RouterDashboard;
