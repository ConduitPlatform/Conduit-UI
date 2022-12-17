import React, { FC } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import EnumType from '../../types/EnumType/EnumType';
import { BoxProps } from '@mui/material/Box/Box';
import GroupTypeViewer from '../GroupTypeViewer';
import RelationTypeViewer from '../../types/RelationType/RelationTypeViewer';
import BooleanTypeViewer from '../../types/BooleanType/BooleanTypeViewer';
import ObjectIdTypeViewer from '../../types/ObjectIdType/ObjectIdTypeViewer';
import SimpleTypeViewer from '../../types/SimpleType/SimpleTypeViewer';
import { Grid, Paper, Tooltip } from '@mui/material';
import { Schema } from '../../../models/CmsModels';
import JSONTypeViewer from '../../types/JSONType/JSONTypeViewer';
import { FieldIndicators } from '@conduitplatform/ui-components';
import GroupIcon from '@mui/icons-material/PlaylistAdd';

interface Props extends BoxProps {
  dataKey: any;
  data: any;
  schemaToEdit?: Schema;
  setSchemaToEdit?: (schemaToEdit: Schema) => void;
}

const SchemaViewer: FC<Props> = ({ dataKey, data, schemaToEdit, setSchemaToEdit, ...rest }) => {
  const handleItemContent = (item: any, index: number) => {
    switch (item.type) {
      case 'Text':
      case 'Number':
      case 'Date':
        return item.isEnum ? <EnumType item={item} /> : <SimpleTypeViewer item={item} />;
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
          <GroupTypeViewer
            schemaToEdit={schemaToEdit}
            setSchemaToEdit={setSchemaToEdit}
            item={item}
            groupIndex={index}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box {...rest} sx={{ borderRadius: 4, overflow: 'hidden', height: '100%' }}>
      <Paper elevation={0} sx={{ overflow: 'auto', height: '100%', padding: 2 }}>
        {data &&
          Array.isArray(data[dataKey]) &&
          data[dataKey].length > 0 &&
          data[dataKey].map((item: any, index: number) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column-reverse',
                padding: 1,
              }}>
              <Grid container alignItems="center">
                <Grid item xs={6}>
                  <Typography variant={'body2'} sx={{ marginRight: 8 }}>
                    <strong>{item.name}</strong>
                  </Typography>
                </Grid>
                {item.type === 'Group' && (
                  <Grid
                    item
                    xs={6}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between">
                    <GroupIcon sx={{ opacity: 0.6 }} />
                    <Box display="flex">
                      <FieldIndicators item={item} />
                    </Box>
                  </Grid>
                )}
                <Grid item xs={item.type === 'Group' ? 12 : 6}>
                  {handleItemContent(item, index)}
                </Grid>
              </Grid>
            </Box>
          ))}
      </Paper>
    </Box>
  );
};

export default SchemaViewer;
