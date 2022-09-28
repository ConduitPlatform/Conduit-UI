import React from 'react';
import { Container, Grid } from '@mui/material';
import ExtractQueryRangeGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import RequestsLatency from '../metrics/RequestLatency';
import ModuleHealth from '../metrics/ModuleHealth';
import MetricCount from '../metrics/MetricCount';

const ChatDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={6} sm={4}>
          <RequestsLatency module="chat" />
        </Grid>
        <Grid item xs={6} sm={4}>
          <ModuleHealth module="chat" />
        </Grid>
        <Grid item xs={6} sm={4}>
          <MetricCount title="Chat rooms" expression="conduit_chat_rooms_total[1h]" />
        </Grid>
        <Grid item xs={12}>
          <TotalRequestsByModule module="chat" />
        </Grid>
        <Grid item md={12} lg={6}>
          <ExtractQueryRangeGraph
            expression="sum(increase(conduit_messages_sent_total[10m]))"
            graphTitle="Messages sent"
            label="Messages"
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChatDashboard;
