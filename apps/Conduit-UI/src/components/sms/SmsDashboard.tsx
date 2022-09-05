import { Box, Container, Grid } from '@mui/material';
import React from 'react';
import ExtractGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';

const SmsDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
        <Box>
          <TotalRequestsByModule module="sms" />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ExtractGraph
                query="/query_range"
                expression="sum(increase(conduit_forms_total[5m]))"
                graphTitle="Total sms sent"
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default SmsDashboard;
