import React, { FC } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { FieldIndicators } from '@conduitplatform/ui-components';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import Grid from '@mui/material/Grid';
import { IRelationData } from '../../../models/BuildTypesModels';
import { CustomIcon } from '../SimpleType/SimpleType';

interface IProps {
  item: IRelationData;
}

const RelationType: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Box {...rest}>
      <Grid container>
        <Grid container item xs={6} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <Tooltip title={'Date field'}>
              <CustomIcon>
                <DeviceHubIcon />
              </CustomIcon>
            </Tooltip>
            <Typography variant={'body2'} sx={{ opacity: 0.4 }}>
              relation placeholder
            </Typography>
          </Box>
        </Grid>
        <Grid container item xs={6} alignItems={'center'} justifyContent={'flex-end'}>
          <Box display={'flex'} alignItems={'center'}>
            <FieldIndicators item={item} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RelationType;

export const RelationGroupType: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Box {...rest}>
      <Grid container>
        <Grid container item xs={6} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <Tooltip title={'Date field'}>
              <CustomIcon>
                <DeviceHubIcon />
              </CustomIcon>
            </Tooltip>
            <Typography variant={'body2'} sx={{ opacity: 0.4 }}>
              relation placeholder
            </Typography>
          </Box>
        </Grid>
        <Grid container item xs={6} alignItems={'center'} justifyContent={'flex-end'}>
          <Box display={'flex'} alignItems={'center'}>
            <FieldIndicators item={item} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
