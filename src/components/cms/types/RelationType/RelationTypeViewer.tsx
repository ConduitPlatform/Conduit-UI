import React, { FC } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import FieldIndicators from '../../FieldIndicators';
import DeviceHubIcon from '@material-ui/icons/DeviceHub';
import Grid from '@material-ui/core/Grid';
import { IRelationData } from '../../../../models/cms/BuildTypesModels';

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
  item: IRelationData;
}

const RelationTypeViewer: FC<IProps> = ({ item, ...rest }) => {
  const classes = useStyles();

  return (
    <Box {...rest}>
      <Grid container>
        <Grid container item xs={6} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <Tooltip title={'Date field'}>
              <DeviceHubIcon className={classes.icon} />
            </Tooltip>
            <FieldIndicators item={item} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RelationTypeViewer;

export const RelationGroupTypeViewer: FC<IProps> = ({ item, ...rest }) => {
  const classes = useStyles();

  return (
    <Grid container item xs={6} alignItems={'center'}>
      <Box display={'flex'} alignItems={'center'}>
        <Tooltip title={'Date field'}>
          <DeviceHubIcon className={classes.icon} />
        </Tooltip>
        <FieldIndicators item={item} />
      </Box>
    </Grid>
  );
};
