import React from 'react';
import { Container, Grid } from '@mui/material';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import RequestsLatency from '../metrics/RequestLatency';
import ModuleHealth from '../metrics/ModuleHealth';
import MetricCount from '../metrics/MetricCount';

const SmsDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container gap={2}>
        <Grid item container rowSpacing={1} columnSpacing={2}>
          <Grid item sm={3} xs={6}>
            <RequestsLatency small module="sms" />
          </Grid>
          <Grid item sm={3} xs={6}>
            <ModuleHealth small module="sms" />
          </Grid>
          <Grid item sm={3} xs={6}>
            <MetricCount small title="SMS Sent" expression="conduit_sms_sent_total[5m]" />
          </Grid>
        </Grid>
        <Grid container item spacing={2}>
          <Grid item xs={12}>
            <TotalRequestsByModule module="sms" />
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SmsDashboard;
