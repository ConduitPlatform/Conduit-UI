import React, { FC } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import CodeIcon from '@material-ui/icons/Code';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import FieldIndicators from '../../FieldIndicators';
import Grid from '@material-ui/core/Grid';
import { IObjectData } from '../../../../models/database/BuildTypesModels';

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
  item: IObjectData;
}

const ObjectIdTypeViewer: FC<IProps> = ({ item, ...rest }) => {
  const classes = useStyles();

  return (
    <>
      <Grid item container xs={1}>
        <CodeIcon className={classes.icon} />
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

export default ObjectIdTypeViewer;

export const ObjectIdGroupTypeViewer: FC<IProps> = ({ item, ...rest }) => {
  const classes = useStyles();

  return (
    <>
      <Grid item container xs={1}>
        <CodeIcon className={classes.icon} />
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
