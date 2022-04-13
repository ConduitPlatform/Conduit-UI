import Box from '@mui/material/Box';
import React, { FC } from 'react';
import Tooltip from '@mui/material/Tooltip';
import GroupIcon from '@mui/icons-material/PlaylistAdd';
import FieldIndicators from '../FieldIndicators';
import Grid from '@mui/material/Grid';
import { IGroupChildData } from '../../../models/database/BuildTypesModels';
import { SimpleGroupTypeViewer } from '../types/SimpleType/SimpleTypeViewer';
import { BooleanGroupTypeViewer } from '../types/BooleanType/BooleanTypeViewer';

interface IProps {
  item: IGroupChildData;
  groupIndex: number;
  itemIndex: number;
}

const GroupTypeChildViewer: FC<IProps> = ({ item, groupIndex, itemIndex, ...rest }) => {
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
    <Box sx={{ width: '100%' }} {...rest}>
      <Grid container>
        <Grid container item xs={6} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <Tooltip title={'Group field'}>
              <GroupIcon
                sx={{
                  height: 3,
                  width: 3,
                  marginRight: 1,
                  opacity: 0.6,
                  display: 'flex',
                  alignItems: 'center',
                }}
              />
            </Tooltip>
          </Box>
        </Grid>
        <Grid container item xs={5} alignItems={'center'} justifyContent={'flex-end'}>
          <Box display={'flex'} alignItems={'center'}>
            <FieldIndicators item={item} />
          </Box>
        </Grid>
      </Grid>
      <Box
        sx={{
          minHeight: 100,
          width: '100%',
          border: '1px dotted black',
          padding: 3,
        }}>
        {item.content &&
          Array.isArray(item.content) &&
          item.content.length > 0 &&
          item.content.map((groupItem, index) => {
            return (
              <Grid container sx={{ padding: 2 }} key={index}>
                <Grid item xs={6}>
                  {groupItem.name}
                </Grid>
                {handleGroupContent(groupItem)}
              </Grid>
            );
          })}
      </Box>
    </Box>
  );
};

export default GroupTypeChildViewer;
