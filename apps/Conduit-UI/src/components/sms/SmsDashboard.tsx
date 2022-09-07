import React from 'react';
import { Container, Grid, Paper } from '@mui/material';
import ExtractGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';

const SmsDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ padding: 4, borderRadius: '24px' }}>
            <TotalRequestsByModule module="sms" />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ padding: 4, borderRadius: '24px' }}>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_forms_total[10m]))"
              graphTitle="Total sms sent"
              label="Sms sent"
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SmsDashboard;
