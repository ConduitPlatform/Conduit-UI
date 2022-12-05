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

const BooleanTypeViewer: FC<IProps> = ({ item, ...rest }) => {
  return (
    <>
      <Grid item container xs={1}>
        <Box display="flex" justifyContent="flex-start" alignItems="center">
          <Typography variant={'body2'} sx={{ opacity: 0.4 }}>
            {item.placeholderFalse}
          </Typography>
          <Switch disabled sx={{ ml: -1 }} checked={item.default} value="Boolean" />
          <Typography variant={'body2'} sx={{ opacity: 0.4 }}>
            {item.placeholderTrue}
          </Typography>
        </Box>
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

export default BooleanTypeViewer;

export const BooleanGroupTypeViewer: FC<IProps> = ({ item, ...rest }) => {
  return (
    <>
      <Grid item container xs={1}>
        <Box display="flex" justifyContent="flex-start" alignItems="center">
          <Typography variant={'body2'} sx={{ opacity: 0.4 }}>
            {item.placeholderFalse}
          </Typography>
          <Switch disabled checked={item.default} sx={{ ml: -1 }} value="Boolean" />
          <Typography variant={'body2'} sx={{ opacity: 0.4 }}>
            {item.placeholderTrue}
          </Typography>
        </Box>
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
