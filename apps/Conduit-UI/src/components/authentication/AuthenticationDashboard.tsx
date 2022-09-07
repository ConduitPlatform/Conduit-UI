import React from 'react';
import { Container, Grid, Paper } from '@mui/material';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import ExtractGraph from '../metrics/ExtractMetricGraph';

const AuthenticationDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item sm={12}>
          <Paper sx={{ padding: 4, borderRadius: '24px' }}>
            <TotalRequestsByModule module="authentication" />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 4, borderRadius: '24px' }}>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_logged_in_users_total[5m]))"
              graphTitle="Logged in users"
              label="Users"
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 4, borderRadius: '24px' }}>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_login_requests_total[5m]))"
              graphTitle="Total login requests"
              label="Requests"
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AuthenticationDashboard;
