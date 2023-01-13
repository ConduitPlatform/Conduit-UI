import React from 'react';
import { Container, Grid } from '@mui/material';
import TotalRequestsByModule from '../../../components/metrics/TotalRequestsByModule';
import RequestsLatency from '../../../components/metrics/RequestLatency';
import ModuleHealth from '../../../components/metrics/ModuleHealth';
import MetricCount from '../../../components/metrics/MetricCount';

const StorageDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item container rowSpacing={1} columnSpacing={2}>
          <Grid item md={2} sm={6} xs={6}>
            <RequestsLatency small module="storage" />
          </Grid>
          <Grid item md={2} sm={6} xs={6}>
            <ModuleHealth small module="storage" />
          </Grid>
          <Grid item md={2} sm={6} xs={6}>
            <MetricCount
              small
              title="Containers"
              expression="conduit_containers_total{inject_labels}[10m]"
            />
          </Grid>
          <Grid item md={2} sm={6} xs={6}>
            <MetricCount
              small
              title="Folders"
              expression="conduit_folders_total{inject_labels}[10m]"
            />
          </Grid>
          <Grid item md={2} sm={6} xs={6}>
            <MetricCount small title="Files" expression="conduit_files_total{inject_labels}[10m]" />
          </Grid>
          <Grid item md={2} sm={6} xs={6}>
            <MetricCount
              small
              title="Size (bytes)"
              expression="conduit_storage_size_bytes_total{inject_labels}[10m]"
            />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <TotalRequestsByModule module="storage" />
        </Grid>
      </Grid>
    </Container>
  );
};

export default StorageDashboard;
