import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { FC } from 'react';
import makeStyles from '@mui/styles/makeStyles';

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

interface Props {
  item: {
    isArray?: boolean;
    name: string;
    required: boolean;
    select: boolean;
    type: string;
    unique?: boolean;
  };
}

const FieldIndicators: FC<Props> = ({ item }) => {
  const classes = useStyles();

  return (
    <>
      {item.required && (
        <Tooltip title={'Required field'}>
          <Typography className={classes.icon} variant={'h6'}>
            R
          </Typography>
        </Tooltip>
      )}
      {item.unique && (
        <Tooltip title={'Unique field'}>
          <Typography className={classes.icon} variant={'h6'}>
            U
          </Typography>
        </Tooltip>
      )}
      {item.select && (
        <Tooltip title={'Selected field'}>
          <Typography className={classes.icon} variant={'h6'}>
            S
          </Typography>
        </Tooltip>
      )}
      {item.isArray && (
        <Tooltip title={'Array of selected type'}>
          <Typography className={classes.icon} variant={'h6'}>
            A
          </Typography>
        </Tooltip>
      )}
    </>
  );
};

export default FieldIndicators;
