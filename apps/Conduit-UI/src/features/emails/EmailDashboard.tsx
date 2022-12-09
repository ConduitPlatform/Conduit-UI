import React from 'react';
import { Container, Grid } from '@mui/material';

import TotalRequestsByModule from '../../components/metrics/TotalRequestsByModule';
import RequestsLatency from '../../components/metrics/RequestLatency';
import ModuleHealth from '../../components/metrics/ModuleHealth';
import MetricCount from '../../components/metrics/MetricCount';

const EmailDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item container rowSpacing={1} columnSpacing={2}>
          <Grid item xs={6} sm={3}>
            <RequestsLatency small module="email" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <ModuleHealth small module="email" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCount
              small
              title="Email Templates"
              expression="conduit_email_templates_total[10m]"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCount small title="Sent Emails" expression="conduit_emails_sent_total[10m]" />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <TotalRequestsByModule module="email" />
        </Grid>
      </Grid>
    </Container>
  );
};

export default EmailDashboard;
