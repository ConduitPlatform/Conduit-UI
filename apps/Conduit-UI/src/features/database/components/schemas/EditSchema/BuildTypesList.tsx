import React, { FC } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import Box from '@mui/material/Box';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import Card from '@mui/material/Card';
import TextIcon from '@mui/icons-material/Title';
import CodeIcon from '@mui/icons-material/Code';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import NumberIcon from '@mui/icons-material/Filter7';
import SelectIcon from '@mui/icons-material/FormatListBulleted';
import BooleanIcon from '@mui/icons-material/ToggleOn';
import DateIcon from '@mui/icons-material/DateRange';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import { IntegrationInstructionsRounded } from '@mui/icons-material';

interface Props {
  item: any; //todo fix this
  // | 'Text'
  // | 'Number'
  // | 'Date'
  // | 'Boolean'
  // | 'Enum'
  // | 'ObjectId'
  // | 'Group'
  // | 'Relation';
  index: number;
}

const BuildTypesList: FC<Props> = ({ item, index, ...rest }) => {
  const handleIcon = (
    item:
      | 'Text'
      | 'Number'
      | 'Date'
      | 'Boolean'
      | 'Enum'
      | 'ObjectId'
      | 'Group'
      | 'Relation'
      | 'JSON'
  ) => {
    switch (item) {
      case 'Text':
        return <TextIcon />;
      case 'Number':
        return <NumberIcon />;
      case 'Date':
        return <DateIcon />;
      case 'Boolean':
        return <BooleanIcon />;
      case 'Enum':
        return <SelectIcon />;
      case 'ObjectId':
        return <CodeIcon />;
      case 'Group':
        return <SettingsEthernetIcon />;
      case 'Relation':
        return <DeviceHubIcon />;
      case 'JSON':
        return <IntegrationInstructionsRounded />;
      default:
        return <TextIcon />;
    }
  };

  const handleItem = (
    item: 'Text' | 'Number' | 'Date' | 'Boolean' | 'Enum' | 'ObjectId' | 'Group' | 'Relation'
  ) => {
    return (
      <>
        <Box display={'flex'} alignItems={'center'}>
          {handleIcon(item)}
          <Box ml={2}>{item}</Box>
        </Box>
        <DragHandleIcon sx={{ fill: '#dce0e5' }} />
      </>
    );
  };

  return (
    <Draggable draggableId={item} index={index} {...rest}>
      {(provided, snapshot) => (
        <>
          <Card
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 2,
              marginBottom: 2,
              userSelect: 'none',
            }}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}>
            {handleItem(item)}
          </Card>
          {snapshot.isDragging && (
            <Card
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 2,
                marginBottom: 2,
                userSelect: 'none',
                '&~div': {
                  transform: 'none !important',
                },
              }}>
              {handleItem(item)}
            </Card>
          )}
        </>
      )}
    </Draggable>
  );
};

export default BuildTypesList;
