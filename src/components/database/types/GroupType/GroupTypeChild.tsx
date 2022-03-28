import Box from '@mui/material/Box';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import React, { FC } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { SimpleGroupType } from '../SimpleType/SimpleType';
import { BooleanGroupType } from '../BooleanType/BooleanType';
import Tooltip from '@mui/material/Tooltip';
import GroupIcon from '@mui/icons-material/PlaylistAdd';
import FieldIndicators from '../../FieldIndicators';
import Grid from '@mui/material/Grid';
import { IGroupChildData } from '../../../../models/database/BuildTypesModels';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: 100,
    width: '100%',
    border: '1px dotted black',
  },
  rootDragging: {
    minHeight: 100,
    width: '100%',
    backgroundColor: theme.palette.grey['500'],
  },
  icon: {
    height: theme.spacing(3),
    width: theme.spacing(3),
    marginLeft: theme.spacing(1),
    cursor: 'pointer',
  },
  item: {
    display: 'flex',
    flexDirection: 'column-reverse',
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
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
  handleGroupDelete: (index: number, groupIndex: number, itemIndex: number) => void;
  handleGroupDrawer: (groupItem: any, index: number, groupIndex: number, itemIndex: number) => void;
}

const GroupGroupType: FC<IProps> = ({
  item,
  groupIndex,
  itemIndex,
  handleGroupDelete,
  handleGroupDrawer,
  ...rest
}) => {
  const classes = useStyles();

  const handleGroupContent = (item: any) => {
    switch (item.type) {
      case 'Text':
        return <SimpleGroupType item={item} />;
      case 'Number':
        return <SimpleGroupType item={item} />;
      case 'Date':
        return <SimpleGroupType item={item} />;
      case 'Boolean':
        return <BooleanGroupType item={item} />;
      default:
        return null;
    }
  };

  const groupId = `child-${item.name}`;

  return (
    <Box sx={{ width: '100%' }} {...rest}>
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
      <Droppable droppableId={groupId} isCombineEnabled>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            className={snapshot.isDraggingOver ? classes.rootDragging : classes.root}>
            {item.content && Array.isArray(item.content) && item.content.length > 0 ? (
              item.content.map((groupItem, index) => {
                return (
                  <Draggable
                    key={groupItem.name}
                    draggableId={groupItem.name}
                    index={index}
                    isDragDisabled>
                    {(provided) => (
                      <div
                        className={classes.item}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}>
                        <Box width={'99%'}>{handleGroupContent(groupItem)}</Box>
                        <Box display={'flex'} flexDirection={'column'} width={'99%'} mb={2}>
                          <Box display={'flex'} width={'100%'} justifyContent={'space-between'}>
                            <Box display={'flex'}>
                              <Typography variant={'body2'} sx={{ marginRight: 8 }}>
                                {groupItem.name}
                              </Typography>
                            </Box>
                            <Box display={'flex'}>
                              <DeleteIcon
                                className={classes.icon}
                                onClick={() => handleGroupDelete(index, groupIndex, itemIndex)}
                              />
                              <SettingsIcon
                                className={classes.icon}
                                onClick={() =>
                                  handleGroupDrawer(groupItem, index, groupIndex, itemIndex)
                                }
                              />
                            </Box>
                          </Box>
                        </Box>
                      </div>
                    )}
                  </Draggable>
                );
              })
            ) : (
              <Box>Place items</Box>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Box>
  );
};

export default GroupGroupType;
