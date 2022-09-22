import React from 'react';
import { Container, Grid } from '@mui/material';
import ExtractQueryRangeGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import { GraphContainer } from '@conduitplatform/ui-components';
import RequestsLatency from '../metrics/RequestLatency';
import ModuleHealth from '../metrics/ModuleHealth';

const ChatDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <GraphContainer>
            <TotalRequestsByModule module="chat" />
          </GraphContainer>
        </Grid>
        <Grid item md={12} lg={6}>
          <GraphContainer>
            <ExtractQueryRangeGraph
              expression="sum(increase(conduit_chat_rooms_total[10m]))"
              graphTitle="Chat rooms"
              label="Rooms"
            />
          </GraphContainer>
        </Grid>
        <Grid item md={12} lg={6}>
          <GraphContainer>
            <ExtractQueryRangeGraph
              expression="sum(increase(conduit_messages_sent_total[10m]))"
              graphTitle="Messages sent"
              label="Messages"
            />
          </GraphContainer>
        </Grid>
        <Grid item xs={4}>
          <RequestsLatency module="chat" />
        </Grid>
        <Grid item xs={4}>
          <ModuleHealth module="chat" />
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChatDashboard;
