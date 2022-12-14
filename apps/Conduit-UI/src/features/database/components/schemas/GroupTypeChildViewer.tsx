import Box from '@mui/material/Box';
import React, { FC } from 'react';
import Tooltip from '@mui/material/Tooltip';
import GroupIcon from '@mui/icons-material/PlaylistAdd';
import { FieldIndicators } from '@conduitplatform/ui-components';
import Grid from '@mui/material/Grid';
import { IGroupChildData } from '../../models/BuildTypesModels';
import { SimpleGroupTypeViewer } from '../types/SimpleType/SimpleTypeViewer';
import { BooleanGroupTypeViewer } from '../types/BooleanType/BooleanTypeViewer';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { isArray } from 'lodash';
import { Schema } from '../../models/CmsModels';

interface IProps {
  item: IGroupChildData;
  groupIndex: number;
  itemIndex: number;
  editable?: boolean;
  parent: string;
  schemaToEdit?: Schema;
  setSchemaToEdit?: (schemaToEdit: Schema) => void;
}

const GroupTypeChildViewer: FC<IProps> = ({
  item,
  groupIndex,
  itemIndex,
  parent,
  editable,
  schemaToEdit,
  setSchemaToEdit,
  ...rest
}) => {
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

  const handleEditSubGroup = (item: string, type: 'select' | 'unique' | 'required') => {
    const foundGroupType = schemaToEdit?.fields[parent].type;
    if (schemaToEdit && setSchemaToEdit) {
      if (isArray(foundGroupType)) {
        const modifiedItemGrp = {
          ...schemaToEdit?.fields[parent].type[0],
          [item]: {
            ...schemaToEdit.fields[parent].type[0][item],
            [type]: !schemaToEdit.fields[parent].type[0][item][type],
          },
        };

        setSchemaToEdit({
          ...schemaToEdit,
          fields: {
            ...schemaToEdit.fields,
            [parent]: {
              ...schemaToEdit?.fields[parent],
              type: [modifiedItemGrp],
            },
          },
        });
      } else {
        setSchemaToEdit({
          ...schemaToEdit,
          fields: {
            ...schemaToEdit?.fields,
            [parent]: {
              ...schemaToEdit?.fields[parent],
              type: {
                ...schemaToEdit.fields[parent].type,
                [item]: {
                  ...schemaToEdit.fields[parent].type[item],
                  [type]: !schemaToEdit?.fields[parent]?.type[item][type],
                },
              },
            },
          },
        });
      }
    }
  };

  const handleEditGrpItem = (
    groupItem: string,
    item: string,
    typeOf: 'select' | 'unique' | 'required'
  ) => {
    const foundGroupType = schemaToEdit?.fields[parent].type;

    if (schemaToEdit && setSchemaToEdit) {
      if (isArray(foundGroupType)) {
        setSchemaToEdit({
          ...schemaToEdit,
          fields: {
            ...schemaToEdit.fields,
            [parent]: {
              ...schemaToEdit?.fields[parent],
              type: [
                {
                  ...schemaToEdit?.fields[parent].type[0],
                  [item]: {
                    ...schemaToEdit?.fields[parent].type[0][item],
                    type: [
                      {
                        ...schemaToEdit?.fields[parent].type[0][item].type[0],
                        [groupItem]: {
                          ...schemaToEdit?.fields[parent].type[0][item].type[0][groupItem],
                          [typeOf]:
                            !schemaToEdit?.fields[parent].type[0][item].type[0][groupItem][typeOf],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        });
      } else {
        setSchemaToEdit({
          ...schemaToEdit,
          fields: {
            ...schemaToEdit?.fields,
            [parent]: {
              ...schemaToEdit?.fields[parent],
              type: {
                ...schemaToEdit.fields[parent].type,
                [item]: {
                  ...schemaToEdit.fields[parent].type[item],
                  type: {
                    ...schemaToEdit?.fields[parent]?.type[item].type,
                    [groupItem]: {
                      ...schemaToEdit?.fields[parent]?.type[item].type[groupItem],
                      [typeOf]: !schemaToEdit?.fields[parent]?.type[item].type[groupItem][typeOf],
                    },
                  },
                },
              },
            },
          },
        });
      }
    }
  };

  return (
    <Box sx={{ width: '100%' }} {...rest}>
      <Grid container>
        <Grid container item xs={editable ? 3 : 6} alignItems={'center'}>
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
        {editable && (
          <Grid container item xs={4} justifyContent={'flex-end'}>
            <FormGroup sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              <Tooltip title="Selected field">
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={item.select}
                      onChange={() => handleEditSubGroup(item.name, 'select')}
                    />
                  }
                  label="S"
                />
              </Tooltip>
              <Tooltip title="Unique field">
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      onChange={() => handleEditSubGroup(item.name, 'unique')}
                    />
                  }
                  label="U"
                />
              </Tooltip>
              <Tooltip title="Required field">
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={() => handleEditSubGroup(item.name, 'required')}
                      size="small"
                    />
                  }
                  label="R"
                />
              </Tooltip>
            </FormGroup>
          </Grid>
        )}
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
                <Grid item xs={editable ? 3 : 6}>
                  {groupItem.name}
                </Grid>
                {handleGroupContent(groupItem)}
                {editable && (
                  <Grid item container xs={3} justifyContent={'flex-end'}>
                    <FormGroup sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                      <Tooltip title="Selected field">
                        <FormControlLabel
                          control={
                            <Checkbox
                              onChange={() =>
                                handleEditGrpItem(groupItem.name, item.name, 'select')
                              }
                              checked={groupItem.select}
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
                              onChange={() =>
                                handleEditGrpItem(groupItem.name, item.name, 'unique')
                              }
                              checked={groupItem.unique}
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
                              onChange={() =>
                                handleEditGrpItem(groupItem.name, item.name, 'required')
                              }
                              checked={groupItem.required}
                              size="small"
                            />
                          }
                          label="R"
                        />
                      </Tooltip>
                    </FormGroup>
                  </Grid>
                )}
              </Grid>
            );
          })}
      </Box>
    </Box>
  );
};

export default GroupTypeChildViewer;
