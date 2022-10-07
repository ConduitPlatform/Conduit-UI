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
        <Grid item container rowSpacing={1} columnSpacing={1.5}>
          <Grid item xs={6} sm={2}>
            <RequestsLatency small module="chat" />
          </Grid>
          <Grid item xs={6} sm={2}>
            <ModuleHealth small module="chat" />
          </Grid>
          <Grid item xs={6} sm={2}>
            <MetricCount small title="Chat rooms" expression="conduit_chat_rooms_total[10m]" />
          </Grid>
        </Grid>
        <Grid item xs={12} lg={6}>
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
