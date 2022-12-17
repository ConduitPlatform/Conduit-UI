import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import GroupIcon from '@mui/icons-material/PlaylistAdd';
import React, { FC } from 'react';
import { FieldIndicators } from '@conduitplatform/ui-components';
import { IGroupChildContentData, IGroupChildData, IGroupData } from '../../models/BuildTypesModels';
import GroupTypeChildViewer from './GroupTypeChildViewer';
import SimpleTypeViewer from '../types/SimpleType/SimpleTypeViewer';
import ObjectIdTypeViewer from '../types/ObjectIdType/ObjectIdTypeViewer';
import BooleanTypeViewer from '../types/BooleanType/BooleanTypeViewer';
import RelationTypeViewer from '../types/RelationType/RelationTypeViewer';
import EnumTypeViewer from '../types/EnumType/EnumTypeViewer';
import { useTheme } from '@mui/material';
import { Schema } from '../../models/CmsModels';
import JSONTypeViewer from '../types/JSONType/JSONTypeViewer';

interface IProps {
  item: IGroupData;
  groupIndex: number;
  schemaToEdit?: Schema;
  setSchemaToEdit?: (schemaToEdit: Schema) => void;
}

const GroupTypeViewer: FC<IProps> = ({ item, groupIndex, ...rest }) => {
  const theme = useTheme();
  const handleGroupContent = (
    item: IGroupChildContentData | IGroupChildData,
    index: number,
    parent: string
  ) => {
    switch (item.type) {
      case 'Text':
      case 'Number':
      case 'Date':
        return item.isEnum ? (
          <EnumTypeViewer item={item} /> //needs changes
        ) : (
          <SimpleTypeViewer item={item} />
        );
      case 'ObjectId':
        return <ObjectIdTypeViewer item={item} />;
      case 'Boolean':
        return <BooleanTypeViewer item={item} />;
      case 'Relation':
        return <RelationTypeViewer item={item} />;
      case 'JSON':
        return <JSONTypeViewer item={item} />;
      case 'Group':
        return (
          <GroupTypeChildViewer
            item={item}
            parent={parent}
            groupIndex={groupIndex}
            itemIndex={index}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {Array.isArray(item.content) && item.content.length > 0 && (
        <Box
          sx={{
            width: '100%',
            background: theme.palette.background.default,
            borderRadius: '16px',
            px: 3,
            pt: 2,
            mt: 2,
          }}
          {...rest}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column-reverse',
              padding: 2,
              mb: 0.5,
            }}>
            {item.content.map(
              (
                groupItem: any, //todo fix this
                index: number
              ) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column-reverse',
                  }}>
                  <Box display={'flex'} flexDirection={'column'} mb={2}>
                    <Grid container alignItems="center">
                      <Grid item xs={6}>
                        <Typography variant={'body2'} sx={{ marginRight: 8 }}>
                          <strong>{groupItem.name}</strong>
                        </Typography>
                      </Grid>
                      {groupItem.type === 'Group' && (
                        <Grid item xs={6} display="flex" justifyContent="space-between">
                          <Tooltip title={'Group field'}>
                            <GroupIcon sx={{ opacity: 0.6 }} />
                          </Tooltip>
                          <Box display={'flex'}>
                            <FieldIndicators item={item} />
                          </Box>
                        </Grid>
                      )}
                      <Grid item xs={groupItem.type === 'Group' ? 12 : 6}>
                        {handleGroupContent(groupItem, index, item.name)}
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              )
            )}
          </Box>
        </Box>
      )}
    </>
  );
};

export default GroupTypeViewer;
