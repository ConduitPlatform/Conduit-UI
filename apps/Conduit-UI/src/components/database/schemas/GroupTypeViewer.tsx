import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import GroupIcon from '@mui/icons-material/PlaylistAdd';
import React, { FC } from 'react';
import { ConduitCheckbox, FieldIndicators } from '@conduitplatform/ui-components';
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
import { FormControlLabel, FormGroup } from '@mui/material';
import { isArray } from 'lodash';
import { Schema } from '../../../models/database/CmsModels';
import { JSONGroupTypeViewer } from '../types/JSONType/JSONTypeViewer';

interface IProps {
  item: IGroupData;
  groupIndex: number;
  editable?: boolean;
  schemaToEdit?: Schema;
  setSchemaToEdit?: (schemaToEdit: Schema) => void;
}

const GroupTypeViewer: FC<IProps> = ({
  item,
  groupIndex,
  editable,
  schemaToEdit,
  setSchemaToEdit,
  ...rest
}) => {
  const handleGroupContent = (
    item: IGroupChildContentData | IGroupChildData,
    index: number,
    parent: string
  ) => {
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
      case 'JSON':
        return <JSONGroupTypeViewer item={item} />;
      case 'Group':
        return (
          <GroupTypeChildViewer
            editable={editable}
            item={item}
            parent={parent}
            groupIndex={groupIndex}
            itemIndex={index}
            schemaToEdit={schemaToEdit}
            setSchemaToEdit={setSchemaToEdit}
          />
        );
      default:
        return null;
    }
  };

  const handleEditGrp = (item: string, type: 'select' | 'unique' | 'required') => {
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

  const handleEditGrpItem = (
    groupItem: string,
    item: string,
    typeOf: 'select' | 'unique' | 'required'
  ) => {
    const foundGroup = schemaToEdit?.fields[item];

    const foundItem = foundGroup?.type[groupItem];

    if (isArray(foundGroup.type) && schemaToEdit && setSchemaToEdit) {
      const modifiedItemGrp = {
        ...schemaToEdit?.fields[item].type[0],
        [groupItem]: {
          ...schemaToEdit.fields[item].type[0][groupItem],
          [typeOf]: !schemaToEdit.fields[item].type[0][groupItem][typeOf],
        },
      };

      setSchemaToEdit({
        ...schemaToEdit,
        fields: {
          ...schemaToEdit.fields,
          [item]: {
            ...schemaToEdit?.fields[item],
            type: [modifiedItemGrp],
          },
        },
      });
    } else if (schemaToEdit?.fields[item] && foundItem !== undefined && setSchemaToEdit)
      setSchemaToEdit({
        ...schemaToEdit,
        fields: {
          ...schemaToEdit?.fields,
          [item]: {
            ...schemaToEdit?.fields[item],
            type: {
              ...schemaToEdit.fields[item].type,
              [groupItem]: {
                ...schemaToEdit.fields[item].type[groupItem],
                [typeOf]: !schemaToEdit?.fields[item]?.type[groupItem][typeOf],
              },
            },
          },
        },
      });
  };

  return (
    <Box sx={{ width: '100%' }} {...rest}>
      <Grid container>
        <Grid container item xs={editable ? 3 : 6} alignItems={'center'}>
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
        {editable && (
          <Grid container item xs={4} alignItems="center" justifyContent={'flex-end'}>
            <FormGroup sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              <Tooltip title="Selected field">
                <FormControlLabel
                  control={
                    <ConduitCheckbox
                      size="small"
                      checked={item.select}
                      onChange={() => handleEditGrp(item.name, 'select')}
                    />
                  }
                  label="S"
                />
              </Tooltip>
              <Tooltip title="Required field">
                <FormControlLabel
                  control={
                    <ConduitCheckbox
                      checked={item.required}
                      size="small"
                      onChange={() => handleEditGrp(item.name, 'required')}
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
                  <Grid container alignItems="center">
                    <Grid item xs={editable ? 3 : 6}>
                      <Typography variant={'body2'} sx={{ marginRight: 8 }}>
                        {groupItem.name}
                      </Typography>
                    </Grid>
                    {handleGroupContent(groupItem, index, item.name)}
                    {editable &&
                      !groupItem.isArray &&
                      groupItem.name !== '_id' &&
                      groupItem.name !== 'createdAt' &&
                      groupItem.name !== 'updatedAt' && (
                        <Grid item container xs={3} alignItems="center" justifyContent={'flex-end'}>
                          <FormGroup sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                            <Tooltip title="Selected field">
                              <FormControlLabel
                                control={
                                  <ConduitCheckbox
                                    checked={groupItem.select}
                                    onChange={() =>
                                      handleEditGrpItem(groupItem.name, item.name, 'select')
                                    }
                                    size="small"
                                  />
                                }
                                label="S"
                              />
                            </Tooltip>
                            <Tooltip title="Unique field">
                              <FormControlLabel
                                control={
                                  <ConduitCheckbox
                                    checked={groupItem.unique}
                                    onChange={() =>
                                      handleEditGrpItem(groupItem.name, item.name, 'unique')
                                    }
                                    size="small"
                                  />
                                }
                                label="U"
                              />
                            </Tooltip>
                            <Tooltip title="Required field">
                              <FormControlLabel
                                control={
                                  <ConduitCheckbox
                                    checked={groupItem.required}
                                    onChange={() =>
                                      handleEditGrpItem(groupItem.name, item.name, 'required')
                                    }
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
                </Box>
              </Box>
            )
          )}
      </Box>
    </Box>
  );
};

export default GroupTypeViewer;
