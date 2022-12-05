import React, { FC } from 'react';
import Box from '@mui/material/Box';
import CodeIcon from '@mui/icons-material/Code';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { FieldIndicators } from '@conduitplatform/ui-components';
import Grid from '@mui/material/Grid';
import { IObjectData } from '../../../models/BuildTypesModels';
import { CustomIcon } from '../SimpleType/SimpleType';

interface IProps {
  item: IObjectData;
}

const ObjectIdType: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Box {...rest}>
      <Grid container>
        <Grid container item xs={6} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <Tooltip title={'ObjectId field'}>
              <CustomIcon>
                <CodeIcon />
              </CustomIcon>
            </Tooltip>
            <Typography variant={'body2'} sx={{ opacity: 0.4 }}>
              object placeholder
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

export default ObjectIdType;

export const ObjectIdGroupType: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Box {...rest}>
      <Grid container>
        <Grid container item xs={6} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <Tooltip title={'ObjectId field'}>
              <CustomIcon>
                <CodeIcon />
              </CustomIcon>
            </Tooltip>
            <Typography variant={'body2'} sx={{ opacity: 0.4 }}>
              object placeholder
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
