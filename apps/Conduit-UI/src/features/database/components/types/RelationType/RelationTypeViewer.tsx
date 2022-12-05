import React, { FC } from 'react';
import Box from '@mui/material/Box';
import { FieldIndicators } from '@conduitplatform/ui-components';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import Grid from '@mui/material/Grid';
import { IRelationData } from '../../../models/BuildTypesModels';
import { CustomIcon } from '../SimpleType/SimpleType';

interface IProps {
  item: IRelationData;
}

const RelationTypeViewer: FC<IProps> = ({ item, ...rest }) => {
  return (
    <>
      <Grid item container xs={1}>
        <CustomIcon>
          <DeviceHubIcon />
        </CustomIcon>
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

export default RelationTypeViewer;

export const RelationGroupTypeViewer: FC<IProps> = ({ item, ...rest }) => {
  return (
    <>
      <Grid item container xs={1}>
        <CustomIcon>
          <DeviceHubIcon />
        </CustomIcon>
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
