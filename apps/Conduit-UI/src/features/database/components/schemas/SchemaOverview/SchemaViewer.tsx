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
import { Checkbox, FormControlLabel, FormGroup, Grid, Paper, Tooltip } from '@mui/material';
import { Schema } from '../../../models/CmsModels';
import JSONTypeViewer from '../../types/JSONType/JSONTypeViewer';

interface Props extends BoxProps {
  dataKey: any;
  data: any;
  editable?: boolean;
  schemaToEdit?: Schema;
  setSchemaToEdit?: (schemaToEdit: Schema) => void;
}

const SchemaViewer: FC<Props> = ({
  dataKey,
  data,
  editable,
  schemaToEdit,
  setSchemaToEdit,
  ...rest
}) => {
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
      case 'JSON':
        return <JSONTypeViewer item={item} />;
      case 'Group':
        return (
          <GroupTypeViewer
            editable={editable}
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

  const handleChangeField = (item: string, type: 'select' | 'unique' | 'required') => {
    const foundItem = schemaToEdit?.fields[item];

    if (schemaToEdit?.fields[item] && foundItem !== undefined && setSchemaToEdit)
      setSchemaToEdit({
        ...schemaToEdit,
        fields: {
          ...schemaToEdit?.fields,
          [item]: { ...foundItem, [type]: !foundItem[type] },
        },
      });
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
                <Grid item xs={editable ? 3 : 6}>
                  <Typography variant={'body2'} sx={{ marginRight: 8 }}>
                    <strong>{item.name}</strong>
                  </Typography>
                </Grid>
                {handleItemContent(item, index)}
                {editable &&
                  !item.isArray &&
                  item.name !== '_id' &&
                  item.name !== 'createdAt' &&
                  item.name !== 'updatedAt' &&
                  item.type !== 'Group' && (
                    <Grid container item xs={3} justifyContent="flex-end">
                      <FormGroup sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                        <Tooltip title="Selected field">
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={item.select}
                                onChange={() => handleChangeField(item.name, 'select')}
                                size="small"
                              />
                            }
                            label="S"
                          />
                        </Tooltip>
                        <Tooltip title="Unique field">
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={item.unique}
                                onChange={() => handleChangeField(item.name, 'unique')}
                                size="small"
                              />
                            }
                            label="U"
                          />
                        </Tooltip>
                        <Tooltip title="Required field">
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={item.required}
                                size="small"
                                onChange={() => handleChangeField(item.name, 'required')}
                              />
                            }
                            label="R"
                          />
                        </Tooltip>
                      </FormGroup>
                    </Grid>
                  )}
              </Grid>
            </Box>
          ))}
      </Paper>
    </Box>
  );
};

export default SchemaViewer;
