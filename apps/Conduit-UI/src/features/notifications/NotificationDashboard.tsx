import React from 'react';
import { Container, Grid } from '@mui/material';
import TotalRequestsByModule from '../../components/metrics/TotalRequestsByModule';
import ModuleHealth from '../../components/metrics/ModuleHealth';
import RequestsLatency from '../../components/metrics/RequestLatency';

const NotificationDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <RequestsLatency small module="pushNotifications" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <ModuleHealth small module="pushNotifications" />
        </Grid>
        <Grid item xs={12}>
          <TotalRequestsByModule module="pushNotifications" />
        </Grid>
      </Grid>
    </Container>
  );
};

export default NotificationDashboard;
