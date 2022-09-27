import React from 'react';
import { Container, Grid } from '@mui/material';
import ExtractQueryRangeGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import { GraphContainer } from '@conduitplatform/ui-components';
import RequestsLatency from '../metrics/RequestLatency';
import ModuleHealth from '../metrics/ModuleHealth';
import MetricCount from '../metrics/MetricCount';

const EmailDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <RequestsLatency module="email" />
        </Grid>
        <Grid item xs={3}>
          <ModuleHealth module="email" />
        </Grid>
        <Grid item xs={3}>
          <MetricCount title="Email templates" expression="conduit_email_templates_total[5m]" />
        </Grid>
        <Grid item xs={3}>
          <MetricCount title="Sent emails" expression="conduit_emails_sent_total[5m]" />
        </Grid>
        <Grid item xs={12}>
          <GraphContainer>
            <TotalRequestsByModule module="email" />
          </GraphContainer>
        </Grid>
        <Grid item md={12} lg={6}>
          <GraphContainer>
            <ExtractQueryRangeGraph
              expression="sum(increase(conduit_email_templates_total[10m]))"
              graphTitle="Total email templates"
              label="Templates"
            />
          </GraphContainer>
        </Grid>
        <Grid item md={12} lg={6}>
          <GraphContainer>
            <ExtractQueryRangeGraph
              expression="sum(increase(conduit_emails_sent_total[10m]))"
              graphTitle="Total emails sent"
              label="Emails sent"
            />
          </GraphContainer>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EmailDashboard;
