import React from 'react';
import { Container, Grid } from '@mui/material';
import ExtractGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import { GraphContainer } from '@conduitplatform/ui-components';

const ChatDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <GraphContainer>
            <TotalRequestsByModule module="chat" />
          </GraphContainer>
        </Grid>
        <Grid item xs={12} sm={6}>
          <GraphContainer>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_chat_rooms_total[10m]))"
              graphTitle="Chat rooms"
              label="Rooms"
            />
          </GraphContainer>
        </Grid>
        <Grid item xs={12} sm={6}>
          <GraphContainer>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_messages_sent_total[10m]))"
              graphTitle="Messages sent"
              label="Messages"
            />
          </GraphContainer>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChatDashboard;
