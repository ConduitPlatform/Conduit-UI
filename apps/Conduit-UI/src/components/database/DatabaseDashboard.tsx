import { Box, Container, Grid } from '@mui/material';

import React from 'react';
import ExtractGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';

const DatabaseDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
            <TotalRequestsByModule module="database" />
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
            <ExtractGraph
              query="/query_range"
              expression="rate(conduit_database_queries_total[10m])*100"
              graphTitle="Database queries"
              label="Queries"
            />
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
            <ExtractGraph
              query="/query_range"
              expression="rate(conduit_registered_schemas_total[10m])"
              graphTitle="Registered schemas"
              label="Schemas"
            />
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
            <ExtractGraph
              query="/query_range"
              expression="rate(conduit_custom_endpoints_total[10m])"
              graphTitle="Total custom endpoints"
              label="Custom endpoints"
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DatabaseDashboard;
