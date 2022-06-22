import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/PlaylistAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import React, { FC } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { FieldIndicators } from '@conduitplatform/ui-components';
import { BooleanGroupType } from '../BooleanType/BooleanType';
import { EnumGroupType } from '../EnumType/EnumType';
import { ObjectIdGroupType } from '../ObjectIdType/ObjectIdType';
import { RelationGroupType } from '../RelationType/RelationType';
import { CustomIcon, SimpleGroupType } from '../SimpleType/SimpleType';
import GroupGroupType from './GroupTypeChild';
import {
  IGroupChildContentData,
  IGroupChildData,
  IGroupData,
} from '../../../../models/database/BuildTypesModels';
import { Icon, styled } from '@mui/material';
import { JSONGroupType } from '../JSONType/JSONType';

interface IProps {
  item: IGroupData;
  groupIndex: number;
  handleDelete: (index: number, groupIndex: number) => void;
  handleDrawer: any;
  handleGroupDelete: any;
  handleGroupDrawer: any;
}

export const GroupItemIcon = styled(Icon)(({ theme }) => ({
  height: theme.spacing(3),
  width: theme.spacing(3),
  marginLeft: theme.spacing(1),
  cursor: 'pointer',
}));

const GroupType: FC<IProps> = ({
  item,
  groupIndex,
  handleDelete,
  handleDrawer,
  handleGroupDelete,
  handleGroupDrawer,
  ...rest
}) => {
  const handleGroupContent = (item: IGroupChildContentData | IGroupChildData, index: number) => {
    switch (item.type) {
      case 'Text':
        return item.isEnum ? (
          <EnumGroupType item={item} /> //needs changes
        ) : (
          <SimpleGroupType item={item} />
        );
      case 'Number':
        return item.isEnum ? <EnumGroupType item={item} /> : <SimpleGroupType item={item} />;
      case 'Date':
        return <SimpleGroupType item={item} />;
      case 'ObjectId':
        return <ObjectIdGroupType item={item} />;
      case 'Boolean':
        return <BooleanGroupType item={item} />;
      case 'Relation':
        return <RelationGroupType item={item} />;
      case 'JSON':
        return <JSONGroupType item={item} />;
      case 'Group':
        return (
          <GroupGroupType
            item={item}
            groupIndex={groupIndex}
            itemIndex={index}
            handleGroupDelete={handleGroupDelete}
            handleGroupDrawer={handleGroupDrawer}
          />
        );
      default:
        return null;
    }
  };

  const groupId = `group-${item.name}`;

  return (
    <Box sx={{ width: '100%' }} {...rest}>
      <Grid container>
        <Grid container item xs={6} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <Tooltip title={'Group field'}>
              <CustomIcon>
                <GroupIcon />
              </CustomIcon>
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
          <Box
            ref={provided.innerRef}
            sx={
              snapshot.isDraggingOver
                ? { minHeight: 300, width: '100%', backgroundColor: 'grey.500' }
                : { minHeight: 300, width: '100%', border: '1px dotted black' }
            }>
            {item.content && Array.isArray(item.content) && item.content.length > 0 ? (
              item.content.map(
                (
                  groupItem: any, //todo fix this
                  index: number
                ) => (
                  <Draggable
                    key={groupItem.name}
                    draggableId={groupItem.name}
                    index={index}
                    isDragDisabled>
                    {(provided) => (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column-reverse',
                          padding: 2,
                          marginBottom: 2,
                        }}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}>
                        <Box width={'99%'}>{handleGroupContent(groupItem, index)}</Box>
                        <Box display={'flex'} flexDirection={'column'} width={'99%'} mb={2}>
                          <Box display={'flex'} width={'100%'} justifyContent={'space-between'}>
                            <Box display={'flex'}>
                              <Typography variant={'body2'} sx={{ marginRight: 8 }}>
                                {groupItem.name}
                              </Typography>
                            </Box>
                            <Box display={'flex'}>
                              <GroupItemIcon>
                                <DeleteIcon
                                  color="error"
                                  onClick={() => handleDelete(index, groupIndex)}
                                />
                              </GroupItemIcon>
                              <GroupItemIcon>
                                <SettingsIcon
                                  color="primary"
                                  onClick={() => handleDrawer(groupItem, index, groupIndex)}
                                />
                              </GroupItemIcon>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Draggable>
                )
              )
            ) : (
              <Box>Place items</Box>
            )}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Box>
  );
};

export default GroupType;
