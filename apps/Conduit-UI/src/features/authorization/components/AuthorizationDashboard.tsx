import React from 'react';
import { Container, Grid } from '@mui/material';

import TotalRequestsByModule from '../../../components/metrics/TotalRequestsByModule';
import RequestsLatency from '../../../components/metrics/RequestLatency';
import ModuleHealth from '../../../components/metrics/ModuleHealth';
import MetricCount from '../../../components/metrics/MetricCount';

const AuthorizationDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item container rowSpacing={1} columnSpacing={2}>
          <Grid item xs={6} sm={3}>
            <RequestsLatency small module="authorization" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <ModuleHealth small module="authorization" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCount
              small
              title="Authorization Rules"
              expression="authorization_rules_total[10m]"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCount small title="Roles" expression="authorization_roles_total[10m]" />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <TotalRequestsByModule module="authorization" />
        </Grid>
      </Grid>
    </Container>
  );
};

export default AuthorizationDashboard;
