import React, { FC } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import { FieldIndicators } from '@conduitplatform/ui-components';
import Grid from '@mui/material/Grid';
import { IBooleanData } from '../../../models/BuildTypesModels';

interface IProps {
  item: IBooleanData;
}

const BooleanType: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Box {...rest}>
      <Grid container>
        <Grid container item xs={6} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <Typography variant={'body2'} sx={{ opacity: 0.4 }}>
              {item.placeholderFalse}
            </Typography>
            <Switch disabled checked={item.default} value="Boolean" />
            <Typography variant={'body2'} sx={{ opacity: 0.4 }}>
              {item.placeholderTrue}
            </Typography>
          </Box>
        </Grid>
        <Grid container item xs={6} justifyContent={'flex-end'}>
          <Box display={'flex'} alignItems={'center'}>
            <FieldIndicators item={item} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BooleanType;

export const BooleanGroupType: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Box {...rest}>
      <Grid container>
        <Grid container item xs={6} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <Typography variant={'body2'} sx={{ opacity: 0.4 }}>
              {item.placeholderFalse}
            </Typography>
            <Switch disabled checked={item.default} value="Boolean" />
            <Typography variant={'body2'} sx={{ opacity: 0.4 }}>
              {item.placeholderTrue}
            </Typography>
          </Box>
        </Grid>
        <Grid container item xs={6} justifyContent={'flex-end'} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <FieldIndicators item={item} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
