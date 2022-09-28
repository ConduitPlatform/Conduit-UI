import React from 'react';
import { Container, Grid } from '@mui/material';
import ExtractQueryRangeGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';
import RequestsLatency from '../metrics/RequestLatency';
import ModuleHealth from '../metrics/ModuleHealth';

const SmsDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Grid container gap={2}>
        <Grid item container rowSpacing={1} columnSpacing={1.5}>
          <Grid item sm={3} xs={12}>
            <RequestsLatency small module="sms" />
          </Grid>
          <Grid item sm={3} xs={12}>
            <ModuleHealth small module="sms" />
          </Grid>
        </Grid>
        <Grid container item spacing={2}>
          <Grid item xs={12}>
            <TotalRequestsByModule module="sms" />
          </Grid>
          <Grid item md={12} lg={6}>
            <ExtractQueryRangeGraph
              expression="sum(increase(conduit_forms_total[10m]))"
              graphTitle="Total sms sent"
              label="Sms sent"
            />
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SmsDashboard;
