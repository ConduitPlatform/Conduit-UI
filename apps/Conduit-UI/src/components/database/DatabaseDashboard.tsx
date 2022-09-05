import { Box, Container, Grid } from '@mui/material';

import React from 'react';
import ExtractGraph from '../metrics/ExtractGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';

const DatabaseDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Box>
        <Box>
          <TotalRequestsByModule module="database" />
          <Grid container>
            <Grid item xs={6}>
              <ExtractGraph
                query="/query_range"
                expression="rate(conduit_database_queries_total[5m])*100"
                graphTitle="Total database queries"
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default DatabaseDashboard;
