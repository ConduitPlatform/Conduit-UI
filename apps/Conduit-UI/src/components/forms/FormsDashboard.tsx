import { Box, Container, Grid } from '@mui/material';
import React from 'react';
import ExtractGraph from '../metrics/ExtractGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';

const FormsDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
        <Box>
          <TotalRequestsByModule module="forms" />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ExtractGraph
                query="/query_range"
                expression="sum(increase(conduit_forms_total[10m]))"
                graphTitle="Total conduit forms"
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default FormsDashboard;
