import { Box, Container, Grid } from '@mui/material';
import React from 'react';
import ExtractGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';

const FormsDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
            <TotalRequestsByModule module="forms" />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_forms_total[10m]))"
              graphTitle="Conduit forms"
              label="Forms"
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FormsDashboard;
