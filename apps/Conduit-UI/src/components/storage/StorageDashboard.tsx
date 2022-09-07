import React from 'react';
import { Container, Grid } from '@mui/material';
import ExtractGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import { GraphContainer } from '@conduitplatform/ui-components';

const StorageDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <GraphContainer>
            <TotalRequestsByModule module="storage" />
          </GraphContainer>
        </Grid>
        <Grid item xs={12} sm={6}>
          <GraphContainer>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_storage_size_bytes_total[10m]))"
              graphTitle="Storage size"
              label="Size (in bytes)"
            />
          </GraphContainer>
        </Grid>
        <Grid item xs={12} sm={6}>
          <GraphContainer>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_containers_total[10m]))"
              graphTitle="Containers"
              label="Containers"
            />
          </GraphContainer>
        </Grid>
        <Grid item xs={12} sm={6}>
          <GraphContainer>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_folders_total[10m]))"
              graphTitle="Folders"
              label="Folders"
            />
          </GraphContainer>
        </Grid>
        <Grid item xs={12} sm={6}>
          <GraphContainer>
            <ExtractGraph
              query="/query_range"
              expression="sum(increase(conduit_files_total[10m]))"
              graphTitle="Files"
              label="Files"
            />
          </GraphContainer>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StorageDashboard;
