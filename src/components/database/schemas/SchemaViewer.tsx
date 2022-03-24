import React, { FC } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import EnumType from '../types/EnumType/EnumType';
import { BoxProps } from '@mui/material/Box/Box';
import GroupTypeViewer from './GroupTypeViewer';
import RelationTypeViewer from '../types/RelationType/RelationTypeViewer';
import BooleanTypeViewer from '../types/BooleanType/BooleanTypeViewer';
import ObjectIdTypeViewer from '../types/ObjectIdType/ObjectIdTypeViewer';
import SimpleTypeViewer from '../types/SimpleType/SimpleTypeViewer';
import { Grid } from '@mui/material';

interface Props extends BoxProps {
  dataKey: any;
  data: any;
}

const SchemaViewer: FC<Props> = ({ dataKey, data, ...rest }) => {
  const handleItemContent = (item: any, index: number) => {
    switch (item.type) {
      case 'Text':
        return item.isEnum ? <EnumType item={item} /> : <SimpleTypeViewer item={item} />;
      case 'Number':
        return item.isEnum ? <EnumType item={item} /> : <SimpleTypeViewer item={item} />;
      case 'Date':
        return <SimpleTypeViewer item={item} />;
      case 'ObjectId':
        return <ObjectIdTypeViewer item={item} />;
      case 'Boolean':
        return <BooleanTypeViewer item={item} />;
      case 'Relation':
        return <RelationTypeViewer item={item} />;
      case 'Group':
        return <GroupTypeViewer item={item} groupIndex={index} />;
      default:
        return null;
    }
  };

  return (
    <Box {...rest}>
      <Box
        sx={{
          maxHeight: '70vh',
          border: '1px',
          padding: 5,
          minHeight: 65,
          borderRadius: '4px',
        }}>
        {data &&
          Array.isArray(data[dataKey]) &&
          data[dataKey].length > 0 &&
          data[dataKey].map((item: any, index: number) => (
            <Box
              key={index}
              sx={{ display: 'flex', flexDirection: 'column-reverse', padding: 1, mb: 1 }}>
              <Grid container>
                <Grid item xs={6}>
                  <Typography variant={'body2'} style={{ marginRight: 8 }}>
                    <strong>{item.name}</strong>
                  </Typography>
                </Grid>
                {handleItemContent(item, index)}
              </Grid>
            </Box>
          ))}
      </Box>
    </Box>
  );
};

export default SchemaViewer;
