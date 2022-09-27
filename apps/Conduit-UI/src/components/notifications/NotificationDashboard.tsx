import React from 'react';
import { Container, Grid } from '@mui/material';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import { GraphContainer } from '@conduitplatform/ui-components';
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
          <GraphContainer>
            <TotalRequestsByModule module="pushNotifications" />
          </GraphContainer>
        </Grid>
      </Grid>
    </Container>
  );
};

export default NotificationDashboard;
