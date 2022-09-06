import { Carousel } from '@mantine/carousel';
import { Box, Container, Grid } from '@mui/material';
import React from 'react';
import ExtractGraph from '../metrics/ExtractMetricGraph';
import TotalRequestsByModule from '../metrics/TotalRequestsByModule';

const StorageDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Box p={4} sx={{ background: '#202030', borderRadius: '24px' }}>
        <Box>
          <TotalRequestsByModule module="storage" />
          <Carousel
            height={390}
            slideSize="100%"
            orientation="horizontal"
            slideGap="sm"
            align="start"
            withControls={false}
            withIndicators
            styles={{
              indicator: {
                width: 12,
                height: 4,
                transition: 'width 250ms ease',

                '&[data-active]': {
                  width: 25,
                  backgroundColor: '#07D9C4',
                },
              },
            }}>
            <Carousel.Slide>
              <ExtractGraph
                query="/query_range"
                expression="sum(increase(conduit_storage_size_bytes_total[10m]))"
                graphTitle="Storage size"
                label="Size (in bytes)"
              />
            </Carousel.Slide>
            <Carousel.Slide>
              <ExtractGraph
                query="/query_range"
                expression="sum(increase(conduit_containers_total[10m]))"
                graphTitle="Containers"
                label="Containers"
              />
            </Carousel.Slide>
            <Carousel.Slide>
              <ExtractGraph
                query="/query_range"
                expression="sum(increase(conduit_folders_total[10m]))"
                graphTitle="Folders"
                label="Folders"
              />
            </Carousel.Slide>
            <Carousel.Slide>
              <ExtractGraph
                query="/query_range"
                expression="sum(increase(conduit_files_total[10m]))"
                graphTitle="Files"
                label="Files"
              />
            </Carousel.Slide>
          </Carousel>
        </Box>
      </Box>
    </Container>
  );
};

export default StorageDashboard;
