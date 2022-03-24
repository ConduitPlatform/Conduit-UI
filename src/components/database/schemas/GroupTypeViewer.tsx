import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import GroupIcon from '@mui/icons-material/PlaylistAdd';
import React, { FC } from 'react';
import FieldIndicators from '../FieldIndicators';
import {
  IGroupChildContentData,
  IGroupChildData,
  IGroupData,
} from '../../../models/database/BuildTypesModels';
import GroupTypeChildViewer from './GroupTypeChildViewer';
import { SimpleGroupTypeViewer } from '../types/SimpleType/SimpleTypeViewer';
import { ObjectIdGroupTypeViewer } from '../types/ObjectIdType/ObjectIdTypeViewer';
import { BooleanGroupTypeViewer } from '../types/BooleanType/BooleanTypeViewer';
import { RelationGroupTypeViewer } from '../types/RelationType/RelationTypeViewer';
import { EnumGroupTypeViewer } from '../types/EnumType/EnumTypeViewer';

interface IProps {
  item: IGroupData;
  groupIndex: number;
}

const GroupTypeViewer: FC<IProps> = ({
  item,
  groupIndex,

  ...rest
}) => {
  const handleGroupContent = (item: IGroupChildContentData | IGroupChildData, index: number) => {
    switch (item.type) {
      case 'Text':
        return item.isEnum ? (
          <EnumGroupTypeViewer item={item} /> //needs changes
        ) : (
          <SimpleGroupTypeViewer item={item} />
        );
      case 'Number':
        return item.isEnum ? (
          <EnumGroupTypeViewer item={item} />
        ) : (
          <SimpleGroupTypeViewer item={item} />
        );
      case 'Date':
        return <SimpleGroupTypeViewer item={item} />;
      case 'ObjectId':
        return <ObjectIdGroupTypeViewer item={item} />;
      case 'Boolean':
        return <BooleanGroupTypeViewer item={item} />;
      case 'Relation':
        return <RelationGroupTypeViewer item={item} />;
      case 'Group':
        return <GroupTypeChildViewer item={item} groupIndex={groupIndex} itemIndex={index} />;
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
              <GroupIcon sx={{ opacity: 0.6 }} />
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
          display: 'flex',
          flexDirection: 'column-reverse',
          padding: 2,
          mb: 0.5,
        }}>
        {item.content &&
          Array.isArray(item.content) &&
          item.content.length > 0 &&
          item.content.map(
            (
              groupItem: any, //todo fix this
              index: number
            ) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  flexDirection: 'column-reverse',
                  padding: 2,
                  marginBottom: 0.5,
                }}>
                <Box width={'99%'}></Box>
                <Box display={'flex'} flexDirection={'column'} width={'99%'} mb={2}>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography variant={'body2'} style={{ marginRight: 8 }}>
                        {groupItem.name}
                      </Typography>
                    </Grid>
                    {handleGroupContent(groupItem, index)}
                  </Grid>
                </Box>
              </Box>
            )
          )}
      </Box>
    </Box>
  );
};

export default GroupTypeViewer;
