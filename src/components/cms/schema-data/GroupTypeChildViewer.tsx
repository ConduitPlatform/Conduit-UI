import Box from '@material-ui/core/Box';
import React, { FC } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import GroupIcon from '@material-ui/icons/PlaylistAdd';
import FieldIndicators from '../FieldIndicators';
import Grid from '@material-ui/core/Grid';
import { IGroupChildData } from '../../../models/cms/BuildTypesModels';
import { SimpleGroupTypeViewer } from '../types/SimpleType/SimpleTypeViewer';
import { BooleanGroupTypeViewer } from '../types/BooleanType/BooleanTypeViewer';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: 100,
    width: '100%',
    border: '1px dotted black',
  },
  item: {
    display: 'flex',
    flexDirection: 'column-reverse',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
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
        <Grid container item xs={6} alignItems={'center'} justifyContent={'flex-end'}>
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
              <Grid container key={index}>
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
