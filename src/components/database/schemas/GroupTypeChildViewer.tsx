import Box from '@mui/material/Box';
import React, { FC } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Tooltip from '@mui/material/Tooltip';
import GroupIcon from '@mui/icons-material/PlaylistAdd';
import FieldIndicators from '../FieldIndicators';
import Grid from '@mui/material/Grid';
import { IGroupChildData } from '../../../models/database/BuildTypesModels';
import { SimpleGroupTypeViewer } from '../types/SimpleType/SimpleTypeViewer';
import { BooleanGroupTypeViewer } from '../types/BooleanType/BooleanTypeViewer';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: 100,
    width: '100%',
    border: '1px dotted black',
    padding: theme.spacing(3),
  },
  item: {
    padding: theme.spacing(2),
  },
  groupIcon: {
    height: theme.spacing(3),
    width: theme.spacing(3),
    marginRight: theme.spacing(1),
    opacity: 0.6,
    display: 'flex',
    alignItems: 'center',
  },
}));

interface IProps {
  item: IGroupChildData;
  groupIndex: number;
  itemIndex: number;
}

const GroupTypeChildViewer: FC<IProps> = ({ item, groupIndex, itemIndex, ...rest }) => {
  const classes = useStyles();

  const handleGroupContent = (item: any) => {
    switch (item.type) {
      case 'Text':
        return <SimpleGroupTypeViewer item={item} />;
      case 'Number':
        return <SimpleGroupTypeViewer item={item} />;
      case 'Date':
        return <SimpleGroupTypeViewer item={item} />;
      case 'Boolean':
        return <BooleanGroupTypeViewer item={item} />;
      default:
        return null;
    }
  };

  return (
    <Box style={{ width: '100%' }} {...rest}>
      <Grid container>
        <Grid container item xs={6} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <Tooltip title={'Group field'}>
              <GroupIcon className={classes.groupIcon} />
            </Tooltip>
          </Box>
        </Grid>
        <Grid container item xs={5} alignItems={'center'} justifyContent={'flex-end'}>
          <Box display={'flex'} alignItems={'center'}>
            <FieldIndicators item={item} />
          </Box>
        </Grid>
      </Grid>
      <div className={classes.root}>
        {item.content &&
          Array.isArray(item.content) &&
          item.content.length > 0 &&
          item.content.map((groupItem, index) => {
            return (
              <Grid container className={classes.item} key={index}>
                <Grid item xs={6}>
                  {groupItem.name}
                </Grid>
                {handleGroupContent(groupItem)}
              </Grid>
            );
          })}
      </div>
    </Box>
  );
};

export default GroupTypeChildViewer;
