import React, { FC } from 'react';
import Box from '@material-ui/core/Box';
import FieldIndicators from '../../FieldIndicators';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import SelectIcon from '@material-ui/icons/FormatListBulleted';
import Grid from '@material-ui/core/Grid';
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
