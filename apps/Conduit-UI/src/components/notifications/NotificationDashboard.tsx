import React from 'react';
import { Container, Grid } from '@mui/material';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import ModuleHealth from '../metrics/ModuleHealth';
import RequestsLatency from '../metrics/RequestLatency';

const NotificationDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <RequestsLatency module="pushNotifications" />
        </Grid>
        <Grid item xs={4}>
          <ModuleHealth module="pushNotifications" />
        </Grid>
        <Grid item xs={12}>
          <TotalRequestsByModule module="pushNotifications" />
        </Grid>
      </Grid>
    </Container>
  );
};

export default NotificationDashboard;
