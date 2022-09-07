import React from 'react';
import { Container, Grid } from '@mui/material';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import { GraphContainer } from '@conduitplatform/ui-components';

const NotificationDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
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
