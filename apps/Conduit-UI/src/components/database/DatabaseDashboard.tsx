import { Box, Container, Grid } from '@mui/material';

import React from 'react';
import ExtractGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';

const DatabaseDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
        <Box>
          <TotalRequestsByModule module="database" />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <ExtractGraph
                query="/query_range"
                expression="rate(conduit_database_queries_total[10m])*100"
                graphTitle="Total database queries"
                label="Queries"
              />
            </Grid>
            <Grid item xs={6}>
              <ExtractGraph
                query="/query_range"
                expression="rate(conduit_custom_endpoints_total[10m])"
                graphTitle="Total custom endpoints"
                label="Custom endpoints"
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default DatabaseDashboard;
