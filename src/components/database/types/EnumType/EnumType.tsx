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

const EnumType: FC<IProps> = ({ item, ...rest }) => {
  const classes = useStyles();

  return (
    <>
      <Grid item container xs={1}>
        <SelectIcon className={classes.icon} />
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

export default EnumType;

export const EnumGroupType: FC<IProps> = ({ item, ...rest }) => {
  const classes = useStyles();

  return (
    <>
      <Grid item container xs={1}>
        <SelectIcon className={classes.icon} />
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
