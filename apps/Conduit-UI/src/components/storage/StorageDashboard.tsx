import React from 'react';
import { Container, Grid, Paper } from '@mui/material';
import ExtractGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';

const StorageDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ padding: 4, borderRadius: '24px' }}>
            <TotalRequestsByModule module="storage" />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ padding: 4, borderRadius: '24px' }}>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_storage_size_bytes_total[10m]))"
              graphTitle="Storage size"
              label="Size (in bytes)"
            />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ padding: 4, borderRadius: '24px' }}>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_containers_total[10m]))"
              graphTitle="Containers"
              label="Containers"
            />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ padding: 4, borderRadius: '24px' }}>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_folders_total[10m]))"
              graphTitle="Folders"
              label="Folders"
            />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ padding: 4, borderRadius: '24px' }}>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_files_total[10m]))"
              graphTitle="Files"
              label="Files"
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StorageDashboard;
