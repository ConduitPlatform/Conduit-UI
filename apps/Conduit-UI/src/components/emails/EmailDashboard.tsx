import React from 'react';
import { Container, Grid, Paper } from '@mui/material';
import ExtractGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';

const EmailDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ padding: 4, borderRadius: '24px' }}>
            <TotalRequestsByModule module="email" />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 4, borderRadius: '24px' }}>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_email_templates_total[10m]))"
              graphTitle="Total email templates"
              label="Templates"
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 4, borderRadius: '24px' }}>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_emails_sent_total[10m]))"
              graphTitle="Total emails sent"
              label="Emails sent"
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EmailDashboard;
