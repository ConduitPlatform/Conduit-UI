import { Box, Container, Grid } from '@mui/material';
import React from 'react';
import ExtractGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';

const EmailDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
            <TotalRequestsByModule module="email" />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_email_templates_total[10m]))"
              graphTitle="Total email templates"
              label="Templates"
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_emails_sent_total[10m]))"
              graphTitle="Total emails sent"
              label="Emails sent"
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EmailDashboard;
