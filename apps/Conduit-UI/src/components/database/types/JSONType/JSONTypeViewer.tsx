import React, { FC } from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { FieldIndicators } from '@conduitplatform/ui-components';
import Grid from '@mui/material/Grid';
import { CustomIcon } from '../SimpleType/SimpleType';
import { IntegrationInstructionsRounded } from '@mui/icons-material';

interface IProps {
  item: any; //todo add ISimpleData;
}

const JSONTypeViewer: FC<IProps> = ({ item }) => {
  return (
    <>
      <Grid item container xs={1}>
        <Tooltip title={'JSON field'}>
          <CustomIcon>
            <IntegrationInstructionsRounded />
          </CustomIcon>
        </Tooltip>
      </Grid>
      <Grid item container justifyContent="flex-end" xs={5}>
        <Grid item xs={6}>
          <Box display={'flex'} alignItems={'center'}>
            <FieldIndicators item={item} />
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default JSONTypeViewer;

export const JSONGroupTypeViewer: FC<IProps> = ({ item }) => {
  return (
    <>
      <Grid item container xs={1}>
        <Tooltip title={'JSON field'}>
          <CustomIcon>
            <IntegrationInstructionsRounded />
          </CustomIcon>
        </Tooltip>
      </Grid>
      <Grid item container justifyContent="flex-end" xs={5}>
        <Grid item xs={6}>
          <Box display={'flex'} alignItems={'center'}>
            <FieldIndicators item={item} />
          </Box>
        </Grid>
      </Grid>
    </>
  );
};
