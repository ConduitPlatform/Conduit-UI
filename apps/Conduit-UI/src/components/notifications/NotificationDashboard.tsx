import React from 'react';
import { Container, Grid, Paper } from '@mui/material';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';

const NotificationDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ padding: 4, borderRadius: '24px' }}>
            <TotalRequestsByModule module="pushNotifications" />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default NotificationDashboard;
