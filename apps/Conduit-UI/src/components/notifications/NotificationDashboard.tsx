import React from 'react';
import { Container, Grid } from '@mui/material';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import ModuleHealth from '../metrics/ModuleHealth';
import RequestsLatency from '../metrics/RequestLatency';

const NotificationDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={12} sm={2}>
          <RequestsLatency small module="pushNotifications" />
        </Grid>
        <Grid item xs={12} sm={2}>
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
