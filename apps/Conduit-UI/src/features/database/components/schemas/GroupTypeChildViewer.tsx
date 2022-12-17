import Box from '@mui/material/Box';
import React, { FC } from 'react';
import Tooltip from '@mui/material/Tooltip';
import GroupIcon from '@mui/icons-material/PlaylistAdd';
import { FieldIndicators } from '@conduitplatform/ui-components';
import Grid from '@mui/material/Grid';
import { IGroupChildData } from '../../models/BuildTypesModels';
import SimpleTypeViewer from '../types/SimpleType/SimpleTypeViewer';
import BooleanTypeViewer from '../types/BooleanType/BooleanTypeViewer';
import { Typography, useTheme } from '@mui/material';
import ObjectIdTypeViewer from '../types/ObjectIdType/ObjectIdTypeViewer';
import RelationTypeViewer from '../types/RelationType/RelationTypeViewer';
import JSONTypeViewer from '../types/JSONType/JSONTypeViewer';
import EnumTypeViewer from '../types/EnumType/EnumTypeViewer';

interface IProps {
  item: IGroupChildData;
  groupIndex: number;
  itemIndex: number;
  parent: string;
}

const GroupTypeChildViewer: FC<IProps> = ({ item, groupIndex, itemIndex, parent, ...rest }) => {
  const theme = useTheme();

  const handleGroupContent = (item: any) => {
    switch (item.type) {
      case 'Text':
      case 'Number':
      case 'Date':
        return item.isEnum ? (
          <EnumTypeViewer item={item} /> //needs changes
        ) : (
          <SimpleTypeViewer item={item} />
        );
      case 'Boolean':
        return <BooleanTypeViewer item={item} />;
      case 'ObjectId':
        return <ObjectIdTypeViewer item={item} />;
      case 'Boolean':
        return <BooleanTypeViewer item={item} />;
      case 'Relation':
        return <RelationTypeViewer item={item} />;
      case 'JSON':
        return <JSONTypeViewer item={item} />;
      default:
        return null;
    }
  };

  return (
    <>
      {Array.isArray(item.content) && item.content.length > 0 && (
        <Box sx={{ width: '100%', background: theme.palette.background.default }} {...rest}>
          <Box
            sx={{
              minHeight: 100,
              width: '100%',
              background: theme.palette.background.paper,
              borderRadius: '16px',
              px: 3,
              pt: 2,
              pb: 1,
            }}>
            {item.content.map((groupItem, index) => {
              return (
                <Grid container sx={{ padding: 2 }} key={index}>
                  <Grid item xs={6}>
                    <Typography variant={'body2'} sx={{ marginRight: 8 }}>
                      <strong>{groupItem.name}</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    {handleGroupContent(groupItem)}
                  </Grid>
                </Grid>
              );
            })}
          </Box>
        </Box>
      )}
    </>
  );
};

export default GroupTypeChildViewer;
