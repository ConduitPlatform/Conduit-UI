import React, { FC } from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Switch from '@material-ui/core/Switch';
import FieldIndicators from '../../FieldIndicators';
import Grid from '@material-ui/core/Grid';
import { IBooleanData } from '../../../../models/cms/BuildTypesModels';

interface IProps {
  item: IBooleanData;
}

const BooleanTypeViewer: FC<IProps> = ({ item, ...rest }) => {
  return (
    <>
      <Grid item container alignItems="center" xs={1}>
        <Typography variant={'body2'} style={{ opacity: 0.4 }}>
          {item.placeholderFalse}
        </Typography>
        <Switch disabled checked={item.default} value="Boolean" />
        <Typography variant={'body2'} style={{ opacity: 0.4 }}>
          {item.placeholderTrue}
        </Typography>
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
      <Grid item container alignItems="center" xs={1}>
        <Typography variant={'body2'} style={{ opacity: 0.4 }}>
          {item.placeholderFalse}
        </Typography>
        <Switch disabled checked={item.default} value="Boolean" />
        <Typography variant={'body2'} style={{ opacity: 0.4 }}>
          {item.placeholderTrue}
        </Typography>
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
