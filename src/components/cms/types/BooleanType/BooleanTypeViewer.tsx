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
    <Box {...rest}>
      <Grid container>
        <Grid container item xs={6} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <Typography variant={'body2'} style={{ opacity: 0.4 }}>
              {item.placeholderFalse}
            </Typography>
            <Switch disabled checked={item.default} value="Boolean" />
            <Typography variant={'body2'} style={{ opacity: 0.4 }}>
              {item.placeholderTrue}
            </Typography>
            <FieldIndicators item={item} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BooleanTypeViewer;

export const BooleanGroupTypeViewer: FC<IProps> = ({ item, ...rest }) => {
  return (
    <Box {...rest}>
      <Grid container>
        <Grid container item xs={6} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <Typography variant={'body2'} style={{ opacity: 0.4 }}>
              {item.placeholderFalse}
            </Typography>
            <Switch disabled checked={item.default} value="Boolean" />
            <Typography variant={'body2'} style={{ opacity: 0.4 }}>
              {item.placeholderTrue}
            </Typography>
            <FieldIndicators item={item} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
