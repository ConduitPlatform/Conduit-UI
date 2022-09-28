import React from 'react';
import { Container, Grid } from '@mui/material';
import ExtractQueryRangeGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import RequestsLatency from '../metrics/RequestLatency';
import ModuleHealth from '../metrics/ModuleHealth';
import MetricCount from '../metrics/MetricCount';

const EmailDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item container rowSpacing={1} columnSpacing={1.5}>
          <Grid item xs={6} sm={2}>
            <RequestsLatency small module="email" />
          </Grid>
          <Grid item xs={6} sm={2}>
            <ModuleHealth small module="email" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCount
              small
              title="Email templates"
              expression="conduit_email_templates_total[5m]"
            />
          </Grid>
          <Grid item xs={4} sm={2}>
            <MetricCount small title="Sent emails" expression="conduit_emails_sent_total[5m]" />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <TotalRequestsByModule module="email" />
        </Grid>
        <Grid item md={12} lg={6}>
          <ExtractQueryRangeGraph
            expression="sum(increase(conduit_email_templates_total[10m]))"
            graphTitle="Total email templates"
            label="Templates"
          />
        </Grid>
        <Grid item md={12} lg={6}>
          <ExtractQueryRangeGraph
            expression="sum(increase(conduit_emails_sent_total[10m]))"
            graphTitle="Total emails sent"
            label="Emails sent"
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default EmailDashboard;
