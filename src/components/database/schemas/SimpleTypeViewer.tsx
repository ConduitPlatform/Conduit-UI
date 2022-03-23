import React, { FC } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import FieldIndicators from '../FieldIndicators';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import Grid from '@mui/material/Grid';
import { IRelationData } from '../../../models/database/BuildTypesModels';

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

const RelationType: FC<IProps> = ({ item, ...rest }) => {
  const classes = useStyles();

  return (
    <Box {...rest}>
      <Grid container>
        <Grid container item xs={6} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <Tooltip title={'Date field'}>
              <DeviceHubIcon className={classes.icon} />
            </Tooltip>
            <Typography variant={'body2'} style={{ opacity: 0.4 }}>
              relation placeholder
            </Typography>
          </Box>
        </Grid>
        <Grid container item xs={6} alignItems={'center'} justifyContent={'flex-end'}>
          <Box display={'flex'} alignItems={'center'}>
            <FieldIndicators item={item} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RelationType;

export const RelationGroupType: FC<IProps> = ({ item, ...rest }) => {
  const classes = useStyles();

  return (
    <Box {...rest}>
      <Grid container>
        <Grid container item xs={6} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <Tooltip title={'Date field'}>
              <DeviceHubIcon className={classes.icon} />
            </Tooltip>
            <Typography variant={'body2'} style={{ opacity: 0.4 }}>
              relation placeholder
            </Typography>
          </Box>
        </Grid>
        <Grid container item xs={6} alignItems={'center'} justifyContent={'flex-end'}>
          <Box display={'flex'} alignItems={'center'}>
            <FieldIndicators item={item} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
