import React from 'react';
import { Container, Grid } from '@mui/material';
import ExtractGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import { GraphContainer } from '@conduitplatform/ui-components';

const EmailDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <GraphContainer>
            <TotalRequestsByModule module="email" />
          </GraphContainer>
        </Grid>
        <Grid item xs={12} md={6}>
          <GraphContainer>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_email_templates_total[10m]))"
              graphTitle="Total email templates"
              label="Templates"
            />
          </GraphContainer>
        </Grid>
        <Grid item xs={12} md={6}>
          <GraphContainer>
            <ExtractGraph
              query="/query_range"
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
