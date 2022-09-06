import { Box, Container, Grid } from '@mui/material';
import React from 'react';
import ExtractGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';

const ChatDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
            <TotalRequestsByModule module="chat" />
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_chat_rooms_total[10m]))"
              graphTitle="Chat rooms"
              label="Rooms"
            />
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_messages_sent_total[10m]))"
              graphTitle="Messages sent"
              label="Messages"
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChatDashboard;
