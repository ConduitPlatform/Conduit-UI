import React from 'react';
import { Container, Grid } from '@mui/material';
import ExtractQueryRangeGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import { GraphContainer } from '@conduitplatform/ui-components';
import RequestsLatency from '../metrics/RequestLatency';
import ModuleHealth from '../metrics/ModuleHealth';
import MetricCount from '../metrics/MetricCount';

const FormsDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <RequestsLatency module="forms" />
        </Grid>
        <Grid item xs={4}>
          <ModuleHealth module="forms" />
        </Grid>
        <Grid item xs={4}>
          <MetricCount title="Forms" expression="conduit_forms_total[5m]" />
        </Grid>
        <Grid item xs={12}>
          <GraphContainer>
            <TotalRequestsByModule module="forms" />
          </GraphContainer>
        </Grid>
        <Grid item md={12} lg={6}>
          <GraphContainer>
            <ExtractQueryRangeGraph
              expression="sum(increase(conduit_forms_total[10m]))"
              graphTitle="Conduit forms"
              label="Forms"
            />
          </GraphContainer>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FormsDashboard;
