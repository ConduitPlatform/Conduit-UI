import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import GroupIcon from '@mui/icons-material/PlaylistAdd';
import React, { FC } from 'react';
import { FieldIndicators } from '@conduitplatform/ui-components';
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
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { Schema } from '../../../models/database/CmsModels';

interface IProps {
  item: IGroupData;
  groupIndex: number;
  editable?: boolean;
  schemaToEdit?: any;
  setSchemaToEdit?: any;
}

const GroupTypeViewer: FC<IProps> = ({
  item,
  groupIndex,
  editable,
  schemaToEdit,
  setSchemaToEdit,
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
        return (
          <GroupTypeChildViewer
            editable={editable}
            item={item}
            groupIndex={groupIndex}
            itemIndex={index}
          />
        );
      default:
        return null;
    }
  };

  const handleEditGrp = (item: any, type: 'select' | 'unique' | 'required') => {
    const foundItem = schemaToEdit?.fields[item];

    if (schemaToEdit?.fields[item] && foundItem !== undefined)
      setSchemaToEdit({
        ...schemaToEdit,
        fields: {
          ...schemaToEdit?.fields,
          [item]: { ...foundItem, [type]: !foundItem[type] },
        },
      });
  };

  console.log(schemaToEdit);
  const handleEditGrpItem = (
    groupItem: any,
    item: any,
    typeOf: 'select' | 'unique' | 'required'
  ) => {
    const foundGroup = schemaToEdit?.fields[item];
    const foundItem = foundGroup?.type[0][groupItem];
    const foundItems = foundGroup?.type;

    // console.log({ ...foundItems[groupItem], [typeOf]: foundItem });

    // // // console.log(foundItems[groupItem].required);
    // // const modifiedItems = {
    // //   ...foundItems,
    // //   [groupItem]: { ...foundItems[groupItem], [typeOf]: !foundItems[groupItem][typeOf] },
    // // };

    // // console.log('modified', modifiedItems);

    // // if (schemaToEdit?.fields[item] && foundItem !== undefined)
    // //   console.log({
    // //     ...schemaToEdit,
    // //     fields: {
    // //       ...schemaToEdit?.fields,
    // //       [item]: { ...foundItem, type: foundItem },
    // //     },
    // //   });
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
                    <Checkbox size="small" onChange={() => handleEditGrp(item.name, 'select')} />
                  }
                  label="S"
                />
              </Tooltip>
              <Tooltip title="Required field">
                <FormControlLabel
                  control={
                    <Checkbox size="small" onChange={() => handleEditGrp(item.name, 'required')} />
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
                    {handleGroupContent(groupItem, index)}
                    {editable && !groupItem.isArray && (
                      <Grid item container xs={3} alignItems="center" justifyContent={'flex-end'}>
                        <FormGroup sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                          <Tooltip title="Selected field">
                            <FormControlLabel control={<Checkbox size="small" />} label="S" />
                          </Tooltip>
                          <Tooltip title="Unique field">
                            <FormControlLabel control={<Checkbox size="small" />} label="U" />
                          </Tooltip>
                          <Tooltip title="Required field">
                            <FormControlLabel
                              onChange={() =>
                                handleEditGrpItem(groupItem.name, item.name, 'required')
                              }
                              control={<Checkbox size="small" />}
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
