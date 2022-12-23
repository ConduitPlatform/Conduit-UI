import React, { FC } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import Box from '@mui/material/Box';
import Content from '@mui/icons-material/PermMedia';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import SimpleType from '../../types/SimpleType/SimpleType';
import BooleanType from '../../types/BooleanType/BooleanType';
import GroupType from '../../types/GroupType/GroupType';
import EnumType from '../../types/EnumType/EnumType';
import ObjectIdType from '../../types/ObjectIdType/ObjectIdType';
import RelationType from '../../types/RelationType/RelationType';
import Button from '@mui/material/Button';
import { BoxProps } from '@mui/material/Box/Box';
import { styled } from '@mui/material';
import JSONType from '../../types/JSONType/JSONType';

const CustomizedButton = styled(Button)(({ theme }) => ({
  minWidth: 0,
  minHeight: 0,
  padding: 0,
  marginLeft: theme.spacing(1),
}));

interface Props extends BoxProps {
  dataKey: any;
  data: any;
  disabled?: boolean;
  handleDrawer: (item: any, index: number) => void;
  handleDelete: (index: number) => void;
  handleGroupDrawer: (groupItem: any, index: number, groupIndex: number) => void;
  handleGroupDelete: (index: number, groupIndex: number) => void;
  handleGroupInGroupDelete: (index: number, groupIndex: number, itemIndex: number) => void;
  handleGroupInGroupDrawer: (
    groupItem: any,
    index: number,
    groupIndex: number,
    itemIndex: number
  ) => void;
}

const BuildTypesContent: FC<Props> = ({
  dataKey,
  data,
  disabled,
  handleDrawer,
  handleDelete,
  handleGroupDelete,
  handleGroupDrawer,
  handleGroupInGroupDelete,
  handleGroupInGroupDrawer,

  ...rest
}) => {
  const handleItemContent = (item: any, index: number) => {
    switch (item.type) {
      case 'Text':
        return item.isEnum ? <EnumType item={item} /> : <SimpleType item={item} />;
      case 'Number':
        return item.isEnum ? <EnumType item={item} /> : <SimpleType item={item} />;
      case 'Date':
        return <SimpleType item={item} />;
      case 'ObjectId':
        return <ObjectIdType item={item} />;
      case 'Boolean':
        return <BooleanType item={item} />;
      case 'Relation':
        return <RelationType item={item} />;
      case 'JSON':
        return <JSONType item={item} />;
      case 'Group':
        return (
          <GroupType
            item={item}
            groupIndex={index}
            handleDelete={handleGroupDelete}
            handleDrawer={handleGroupDrawer}
            handleGroupDelete={handleGroupInGroupDelete}
            handleGroupDrawer={handleGroupInGroupDrawer}
          />
        );
      default:
        return null;
    }
  };

  const checkIfDisabled = (name: string) => {
    return name === '_id' || name === 'createdAt' || name === 'updatedAt';
  };

  return (
    <Box {...rest}>
      <Droppable isDropDisabled={disabled} droppableId={dataKey}>
        {(provided, snapshot) => (
          <Box
            sx={{
              height: '100%',
              border: '1px',
              background: 'inherit',
              padding: 4,
              minHeight: 550,
              borderRadius: '4px',
            }}
            ref={provided.innerRef}>
            {data && Array.isArray(data[dataKey]) && data[dataKey].length > 0 ? (
              data[dataKey].map((item: any, index: number) => (
                <Draggable
                  key={item.name}
                  isDragDisabled={disabled}
                  draggableId={item.name}
                  index={index}>
                  {(provided) => (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column-reverse',
                        py: 2,
                      }}
                      ref={provided.innerRef}
                      {...provided.draggableProps}>
                      <Box width={'99%'}>{handleItemContent(item, index)}</Box>
                      <Box display={'flex'} flexDirection={'column'} width={'99%'} mb={2}>
                        <Box display={'flex'} width={'100%'} justifyContent={'space-between'}>
                          <Box display={'flex'}>
                            <Typography variant={'body2'} sx={{ marginRight: 8 }}>
                              <strong>{item.name}</strong>
                            </Typography>
                          </Box>
                          <Box display={'flex'}>
                            <CustomizedButton
                              onClick={() => handleDelete(index)}
                              disabled={disabled ? true : checkIfDisabled(item.name)}>
                              <DeleteIcon color="error" sx={{ height: 25, width: 25 }} />
                            </CustomizedButton>
                            <CustomizedButton
                              onClick={() => handleDrawer(item, index)}
                              disabled={disabled ? true : checkIfDisabled(item.name)}>
                              <SettingsIcon sx={{ height: 25, width: 25 }} />
                            </CustomizedButton>
                            <Box
                              {...provided.dragHandleProps}
                              sx={
                                !disabled
                                  ? {
                                      height: 25,
                                      width: 25,
                                      marginLeft: 1,
                                      cursor: 'pointer',
                                    }
                                  : {
                                      height: 25,
                                      width: 25,
                                      marginLeft: 1,
                                      color: 'grey',
                                    }
                              }>
                              <DragHandleIcon />
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Draggable>
              ))
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 420,
                  border: 'dashed 1px #667587',
                  opacity: snapshot.isDraggingOver ? 0.4 : undefined,
                }}>
                <Content sx={{ mb: 2 }} />
                <Typography variant={'subtitle2'} sx={{ marginBottom: 2 }}>
                  Simply drag and drop
                </Typography>
                <Typography variant={'body2'}>
                  The fields or elements you want in this custom type
                </Typography>
              </Box>
            )}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Box>
  );
};

export default BuildTypesContent;
