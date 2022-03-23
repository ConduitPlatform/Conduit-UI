import React, { FC } from 'react';
import Box from '@mui/material/Box';
import FieldIndicators from '../../FieldIndicators';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import makeStyles from '@mui/styles/makeStyles';
import SelectIcon from '@mui/icons-material/FormatListBulleted';
import Grid from '@mui/material/Grid';
// import { IEnumData } from '../../../../models/cms/BuildTypesModels';

const useStyles = makeStyles((theme) => ({
  icon: {
    height: theme.spacing(3),
    width: theme.spacing(3),
    marginRight: theme.spacing(1),
    opacity: 0.6,
    display: 'flex',
    alignItems: 'center',
  },
}));

interface IProps {
  item: any; //todo add IEnumData;
}

const EnumTypeViewer: FC<IProps> = ({ item, ...rest }) => {
  const classes = useStyles();

  return (
    <Grid item xs={6} alignItems={'center'}>
      <Box display={'flex'} alignItems={'center'}>
        <Tooltip title={'Enum field'}>
          <SelectIcon className={classes.icon} />
        </Tooltip>
        <FieldIndicators item={item} />
      </Box>
    </Grid>
  );
};

export default EnumTypeViewer;

export const EnumGroupTypeViewer: FC<IProps> = ({ item }) => {
  const classes = useStyles();

  return (
    <Grid item xs={6} alignItems={'center'}>
      <Box display={'flex'} alignItems={'center'}>
        <Tooltip title={'Enum field'}>
          <SelectIcon className={classes.icon} />
        </Tooltip>
        <Typography variant={'body2'} style={{ opacity: 0.4 }}>
          enum placeholder
        </Typography>
        <FieldIndicators item={item} />
      </Box>
    </Grid>
  );
};
