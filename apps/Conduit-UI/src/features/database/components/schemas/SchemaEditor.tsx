import React, { FC, useEffect, useState } from 'react';
import { DragDropContext, Droppable, resetServerContext } from 'react-beautiful-dnd';
import Box from '@mui/material/Box';
import BuildTypesList from './EditSchema/BuildTypesList';
import BuildTypesContent from './EditSchema/BuildTypesContent';
import BuildTypesDrawer from './EditSchema/BuildTypesDrawer';
import Header, { headerHeight } from './EditSchema/Header';
import {
  addToChildGroup,
  addToGroup,
  cloneItem,
  databaseExtension,
  deleteItem,
  getSchemaFieldsWithExtra,
  prepareFields,
  reorderItems,
  updateGroupChildItem,
  updateGroupItem,
  updateItem,
} from '../../../../utils/type-functions';
import { useRouter } from 'next/router';
import {
  asyncCreateNewSchema,
  asyncEditSchema,
  asyncFinalizeIntrospectedSchema,
  asyncGetIntrospectionSchemaById,
  asyncGetSchemaById,
  asyncModifyExtension,
  clearIntrospectionSchema,
  clearSelectedSchema,
} from '../../store/databaseSlice';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import { ICrudOperations, ModifyOptions, Permissions, Schema } from '../../models/CmsModels';
import { Chip, Typography, useTheme } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

resetServerContext();

const items = [
  'Text',
  'Number',
  'Date',
  'Boolean',
  'Enum',
  'ObjectId',
  'Group',
  'Relation',
  'JSON',
];

interface Props {
  introspection?: boolean;
}

const defaultFields = {
  _id: 'ObjectId',
  createdAt: 'Date',
  updatedAt: 'Date',
};

const SchemaEditor: FC<Props> = ({ introspection }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { id } = router.query;
  const { isNew } = router.query;
  resetServerContext();
  const theme = useTheme();

  const initialCrudOperations = {
    create: { enabled: false, authenticated: false },
    read: { enabled: false, authenticated: false },
    delete: { enabled: false, authenticated: false },
    update: { enabled: false, authenticated: false },
  };

  const { schemaToEdit } = useAppSelector((state) => state.databaseSlice.data);
  const { introspectionSchemaToEdit } = useAppSelector((state) => state.databaseSlice.data);
  const [editableFields, setEditableFields] = useState<any>({ newTypeFields: [] });
  const [modified, setModified] = useState<boolean>(false);
  const [nonEditableFields, setNonEditableFields] = useState<any[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<Schema>();
  const [schemaName, setSchemaName] = useState<string>('');
  const [authentication, setAuthentication] = useState(false);
  const [crudOperations, setCrudOperations] = useState<ICrudOperations>(initialCrudOperations);
  const [schemaPermissions, setSchemaPermissions] = useState<Permissions>({
    extendable: true,
    canCreate: true,
    canModify: ModifyOptions.Everything,
    canDelete: true,
  });
  const [drawerData, setDrawerData] = useState<any>({
    open: false,
    type: '',
    destination: null,
  });
  const [duplicateId, setDuplicateId] = useState(false);
  const [invalidName, setInvalidName] = useState(false);
  const [selectedProps, setSelectedProps] = useState<any>({
    item: undefined,
    index: undefined,
    type: 'standard',
  });
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    if (!introspection && id && !isNew) {
      dispatch(asyncGetSchemaById({ id, noError: true }));
    } else if (isNew) {
      const formattedFields = getSchemaFieldsWithExtra(defaultFields);
      setEditableFields({ newTypeFields: formattedFields });
    }
  }, [dispatch, introspection, id, isNew]);

  useEffect(() => {
    if (introspection && id) {
      dispatch(asyncGetIntrospectionSchemaById({ id }));
    }
  }, [dispatch, introspection, id]);

  useEffect(() => {
    if (schemaToEdit && !introspection) {
      setSelectedSchema(schemaToEdit);
    } else if (introspectionSchemaToEdit && introspection) {
      setSelectedSchema(introspectionSchemaToEdit);
    }
  }, [introspection, introspectionSchemaToEdit, schemaToEdit]);

  useEffect(() => {
    if (selectedSchema) {
      setReadOnly(true);
    }
    if (introspection && selectedSchema) {
      setCrudOperations(initialCrudOperations);
      setSchemaPermissions({
        extendable: false,
        canCreate: false,
        canModify: ModifyOptions.Nothing,
        canDelete: false,
      });
      const formattedFields = getSchemaFieldsWithExtra(selectedSchema.fields);
      setSchemaName(selectedSchema.name);
      setEditableFields({ newTypeFields: formattedFields });
    } else if (schemaToEdit && selectedSchema && selectedSchema.ownerModule === 'database') {
      setSchemaName(selectedSchema.name);
      if (
        selectedSchema.modelOptions.conduit.cms.crudOperations !== null &&
        selectedSchema.modelOptions.conduit.cms.crudOperations !== undefined
      ) {
        setCrudOperations(selectedSchema.modelOptions.conduit.cms.crudOperations);
      }
      if (
        selectedSchema.modelOptions.conduit.permissions !== null &&
        selectedSchema.modelOptions.conduit.permissions !== undefined
      ) {
        setSchemaPermissions(selectedSchema.modelOptions.conduit.permissions);
      }
      const formattedFields = getSchemaFieldsWithExtra(selectedSchema.fields);

      setEditableFields({ newTypeFields: formattedFields });
    } else if (
      schemaToEdit &&
      selectedSchema &&
      selectedSchema.ownerModule === 'database' &&
      selectedSchema.extensions
    ) {
      setSchemaName(selectedSchema.name);
      setAuthentication(false);
      setCrudOperations(initialCrudOperations);
      setSchemaPermissions(selectedSchema.modelOptions.conduit.permissions);
      const extensionSchemas = selectedSchema.extensions.map((ext) => ({
        [ext.ownerModule]: getSchemaFieldsWithExtra(ext.fields),
      }));
      setNonEditableFields(extensionSchemas);
      const formattedFields = getSchemaFieldsWithExtra(selectedSchema.fields);
      setEditableFields({ newTypeFields: formattedFields });
    } else if (schemaToEdit && selectedSchema && selectedSchema.ownerModule !== 'database') {
      setSchemaName(selectedSchema.name);
      setAuthentication(false);
      setCrudOperations(initialCrudOperations);
      setSchemaPermissions(selectedSchema.modelOptions.conduit.permissions);
      if (
        selectedSchema.extensions &&
        selectedSchema.extensions.length &&
        selectedSchema.modelOptions.conduit.permissions.extendable
      ) {
        if (databaseExtension(selectedSchema.extensions)) {
          const foundCmsSchemaFields = databaseExtension(selectedSchema.extensions);
          const formattedFields = getSchemaFieldsWithExtra(foundCmsSchemaFields);
          setEditableFields({ newTypeFields: formattedFields });

          const extensionSchemas = selectedSchema.extensions.map((ext) => ({
            [ext.ownerModule]: getSchemaFieldsWithExtra(ext.fields),
          }));
          const mainField = {
            [selectedSchema.name]: getSchemaFieldsWithExtra(selectedSchema.fields),
          };
          const finalizedArray = [mainField, ...extensionSchemas].filter(
            (obj: any) => !obj.database
          );
          setNonEditableFields(finalizedArray);
        } else {
          const extensionSchemas = selectedSchema.extensions.map((ext) => ({
            [ext.ownerModule]: getSchemaFieldsWithExtra(ext.fields),
          }));
          const mainField = {
            [selectedSchema.name]: getSchemaFieldsWithExtra(selectedSchema.fields),
          };
          const finalizedArray = [mainField, ...extensionSchemas];
          setNonEditableFields(finalizedArray);
        }
      } else {
        const mainField = {
          [selectedSchema.name]: getSchemaFieldsWithExtra(selectedSchema.fields),
        };
        const finalizedArray = [mainField];
        setNonEditableFields(finalizedArray);
      }
    } else if (router.query.id) {
      setSchemaName(router.query.id.toString());
    }
  }, [selectedSchema]);

  const onDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      setEditableFields({
        newTypeFields: reorderItems(
          editableFields[source.droppableId],
          source.index,
          destination.index
        ),
      });
    }

    const droppableIdString = `${destination.droppableId}`;
    const groupIsGroupChild = droppableIdString.slice(0, 5);

    if (draggableId === 'Group' && groupIsGroupChild === 'child') {
      return;
    }

    if (source.droppableId === 'ITEMS') {
      setDrawerData({
        ...drawerData,
        open: true,
        type: items[source.index],
        destination: destination,
      });
    }
  };

  const handleDrawerClose = () => {
    setDrawerData({ ...drawerData, open: false });
    setSelectedProps({ ...selectedProps, item: undefined });
    setDuplicateId(false);
  };

  const handleSubmit = (typeData: any) => {
    const array = editableFields.newTypeFields;
    if (!Array.isArray(array)) {
      return;
    }
    let hasDuplicate = false;
    let hasInvalidName = false;
    let droppableIdString = '';
    let isGroup = '';
    let groupId = '';
    if (drawerData.destination) {
      droppableIdString = `${drawerData?.destination?.droppableId}`;
      isGroup = droppableIdString.slice(0, 5);
      groupId = droppableIdString.substr(6);
    }

    hasInvalidName = typeData.name === 'type';
    if (hasInvalidName) {
      setInvalidName(true);
      return;
    }
    setInvalidName(false);

    if (isGroup !== 'group' && isGroup !== 'child') {
      hasDuplicate = array.some((item) => {
        if (selectedProps.item) {
          if (selectedProps.item.name === item.name) {
            return false;
          }
        }
        return item.name === typeData.name;
      });
    } else if (isGroup === 'group') {
      const group = array.find((s) => s.name === groupId);
      if (!group) {
        return;
      }
      const content = group.content;
      hasDuplicate = content.some((item: any) => {
        if (selectedProps.item) {
          if (selectedProps.item.name === item.name) {
            return false;
          }
        }
        return item.name === typeData.name;
      });
    } else if (isGroup === 'child') {
      const allGroups = array.filter((s) => s.type === 'Group');
      const parentGroup = allGroups.find((object) => {
        if (object.content) {
          return object.content.find((contentItem: any) => contentItem.name === groupId);
        }
        return false;
      });
      if (!parentGroup) return;
      const innerGroup = parentGroup.content.find((object2: any) => object2.name === groupId);
      if (!innerGroup) return;
      const content = innerGroup.content;
      hasDuplicate = content.some((item: any) => {
        if (selectedProps.item) {
          if (selectedProps?.item?.name === item.name) {
            return false;
          }
        }
        return item.name === typeData.name;
      });
    }

    if (hasDuplicate) {
      setDuplicateId(true);
      return;
    }
    setDuplicateId(false);

    if (selectedProps.item) {
      if (selectedProps.type === 'standard') {
        setEditableFields({
          newTypeFields: updateItem(editableFields.newTypeFields, typeData, selectedProps.index),
        });
      }

      if (selectedProps.type === 'group') {
        setEditableFields({
          newTypeFields: updateGroupItem(
            editableFields.newTypeFields,
            groupId,
            typeData,
            selectedProps.index
          ),
        });
      }

      if (selectedProps.type === 'group-child') {
        setEditableFields({
          newTypeFields: updateGroupChildItem(
            editableFields.newTypeFields,
            groupId,
            typeData,
            selectedProps.index
          ),
        });
      }
    } else if (isGroup === 'group') {
      setEditableFields({
        newTypeFields: addToGroup(
          editableFields.newTypeFields,
          groupId,
          typeData,
          drawerData.destination
        ),
      });
    } else if (isGroup === 'child') {
      setEditableFields({
        newTypeFields: addToChildGroup(
          editableFields.newTypeFields,
          groupId,
          typeData,
          drawerData.destination
        ),
      });
    } else {
      setEditableFields({
        newTypeFields: cloneItem(editableFields.newTypeFields, typeData, drawerData.destination),
      });
    }

    setModified(true);

    handleDrawerClose();
  };

  const handleDrawer = (item: any, index: any) => {
    setSelectedProps({ item: item, index: index, type: 'standard' });
    setDrawerData({
      ...drawerData,
      open: true,
      type: editableFields.newTypeFields[index].isEnum
        ? 'Enum'
        : editableFields.newTypeFields[index].type,
    });
  };

  const handleDelete = (index: number) => {
    setModified(true);
    setEditableFields({
      newTypeFields: deleteItem(editableFields.newTypeFields, index),
    });
  };

  const handleGroupDrawer = (item: any, index: number, groupIndex: number) => {
    setModified(true);
    setSelectedProps({ item: item, index: index, type: 'group' });
    setDrawerData({
      ...drawerData,
      open: true,
      type: editableFields.newTypeFields[groupIndex].content[index].isEnum
        ? 'Enum'
        : editableFields.newTypeFields[groupIndex].content[index].type,
      destination: {
        ...drawerData.destination,
        droppableId: `group-${editableFields.newTypeFields[groupIndex].name}`,
      },
    });
  };

  const handleGroupDelete = (index: number, groupIndex: number) => {
    setModified(true);
    const deleted: any = Array.from(editableFields.newTypeFields);
    deleted[groupIndex].content.splice(index, 1);
    setEditableFields({
      newTypeFields: deleted,
    });
  };

  const handleGroupInGroupDrawer = (
    item: any,
    index: number,
    groupIndex: number,
    itemIndex: number
  ) => {
    setModified(true);
    setSelectedProps({ item: item, index: index, type: 'group-child' });
    setDrawerData({
      ...drawerData,
      open: true,
      type: editableFields.newTypeFields[groupIndex].content[itemIndex].content[index].isEnum
        ? 'Enum'
        : editableFields.newTypeFields[groupIndex].content[itemIndex].content[index].type,
      destination: {
        ...drawerData.destination,
        droppableId: `group-${editableFields.newTypeFields[groupIndex].content[itemIndex].name}`,
      },
    });
  };

  const handleGroupInGroupDelete = (index: number, groupIndex: number, itemIndex: number) => {
    setModified(true);
    const deleted: any = Array.from(editableFields.newTypeFields);
    deleted[groupIndex].content[itemIndex].content.splice(index, 1);
    setEditableFields({
      newTypeFields: deleted,
    });
  };

  const handleSave = (name: string, crudOperations: ICrudOperations, permissions: Permissions) => {
    if (introspection && selectedSchema) {
      const newSchemaFields = prepareFields(editableFields.newTypeFields);
      const newSchema = {
        ...selectedSchema,
        modelOptions: {
          ...selectedSchema.modelOptions,
          conduit: {
            cms: { crudOperations: crudOperations, enabled: true },
            permissions: permissions,
          },
        },
        fields: newSchemaFields,
      };

      dispatch(asyncFinalizeIntrospectedSchema([newSchema]));
    } else if (
      selectedSchema &&
      selectedSchema?.ownerModule !== 'database' &&
      selectedSchema.modelOptions.conduit.permissions.extendable
    ) {
      const { _id } = selectedSchema;
      const schemaFields = prepareFields(editableFields.newTypeFields);

      dispatch(asyncModifyExtension({ _id, data: schemaFields }));
    } else {
      if (schemaToEdit && selectedSchema) {
        const { _id } = selectedSchema;
        const editableSchemaFields = prepareFields(editableFields.newTypeFields);
        const editableSchema = {
          fields: { ...editableSchemaFields },
          conduitOptions: {
            cms: {
              crudOperations,
            },
            permissions,
          },
        };

        dispatch(asyncEditSchema({ _id, data: editableSchema }));
      } else {
        const newSchemaFields = prepareFields(editableFields.newTypeFields);
        const newSchema = {
          name: name,
          fields: newSchemaFields,
          conduitOptions: {
            cms: {
              crudOperations,
            },
            permissions,
          },
        };

        dispatch(asyncCreateNewSchema(newSchema));
      }
    }
    if (!introspection) {
      dispatch(clearSelectedSchema());
      router.push({ pathname: '/database/schemas' });
    } else {
      dispatch(clearIntrospectionSchema());
      router.push({ pathname: '/database/introspection' });
    }
  };

  const extractEditableTitle = () => {
    if (nonEditableFields.length) {
      return `Extended Fields `;
    } else {
      return 'Model Fields';
    }
  };

  const editableFieldsChip = () => {
    if (editableFields.newTypeFields.length > 0) {
      return (
        <Chip
          color="primary"
          variant="outlined"
          sx={{ marginLeft: '30px', cursor: 'pointer' }}
          label={`Fields: ${editableFields.newTypeFields.length}`}
        />
      );
    }
  };

  const showEditableFields = () => {
    if (selectedSchema?.ownerModule === 'database' || !selectedSchema || introspection) {
      return true;
    } else if (selectedSchema.modelOptions.conduit.permissions.extendable) {
      return true;
    } else {
      return false;
    }
  };

  const disabledFields = () => {
    if (selectedSchema && selectedSchema?.ownerModule !== 'database') {
      return true;
    } else {
      return false;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', width: '75%' }}>
      <Header
        introspection={introspection}
        name={schemaName}
        authentication={authentication}
        crudOperations={crudOperations}
        permissions={schemaPermissions}
        readOnly={readOnly}
        handleSave={handleSave}
        selectedSchema={selectedSchema}
        editableFields={editableFields}
        modified={modified}
      />

      <Box sx={{ marginTop: '60px', padding: '20px' }}>
        <DragDropContext onDragEnd={onDragEnd}>
          {nonEditableFields.length
            ? nonEditableFields.map((ext, i) => {
                return (
                  <Accordion
                    sx={{
                      '&.MuiPaper-root': {
                        '&.MuiAccordion-root': { borderRadius: '16px' },
                        borderRadius: '32px',
                      },
                    }}
                    key={i}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header">
                      <Typography sx={{ flexBasis: '88%', flexShrink: 0 }} variant="h6">
                        {Object.keys(ext).toString().toUpperCase()}
                      </Typography>
                      <Chip
                        color="primary"
                        sx={{ marginLeft: '30px', cursor: 'pointer' }}
                        label="READ ONLY"
                      />
                    </AccordionSummary>
                    <AccordionDetails
                      sx={{
                        '&.MuiAccordionDetails-root': {
                          alignItems: 'center',
                          justifyContent: 'center',
                          display: 'flex',
                        },
                      }}>
                      {nonEditableFields.length &&
                        Object.keys(ext).map((dataKey, i) => (
                          <BuildTypesContent
                            dataKey={dataKey}
                            data={ext}
                            handleDelete={handleDelete}
                            handleDrawer={handleDrawer}
                            handleGroupDelete={handleGroupDelete}
                            handleGroupDrawer={handleGroupDrawer}
                            handleGroupInGroupDelete={handleGroupInGroupDelete}
                            handleGroupInGroupDrawer={handleGroupInGroupDrawer}
                            key={i}
                            style={{ width: '100%', maxWidth: '1000px' }}
                            disabled
                          />
                        ))}
                    </AccordionDetails>
                  </Accordion>
                );
              })
            : ''}
          {showEditableFields() ? (
            <Accordion
              defaultExpanded
              disableGutters
              elevation={0}
              sx={{
                '&.MuiPaper-root': {
                  '&.MuiAccordion-root': { borderRadius: '20px' },
                  borderRadius: '32px',
                },
              }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon color="action" />}
                aria-controls="panel1a-content"
                id="panel1a-header">
                <Typography sx={{ flexBasis: '88%', flexShrink: 0 }} variant="h6">
                  {extractEditableTitle()}
                </Typography>
                {editableFieldsChip()}
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  '&.MuiAccordionDetails-root': {
                    alignItems: 'center',
                    justifyContent: 'center',
                    display: 'flex',
                  },
                }}>
                {editableFields &&
                  Object.keys(editableFields).map((dataKey, i) => (
                    <BuildTypesContent
                      dataKey={dataKey}
                      data={editableFields}
                      handleDelete={handleDelete}
                      handleDrawer={handleDrawer}
                      handleGroupDelete={handleGroupDelete}
                      handleGroupDrawer={handleGroupDrawer}
                      handleGroupInGroupDelete={handleGroupInGroupDelete}
                      handleGroupInGroupDrawer={handleGroupInGroupDrawer}
                      key={i}
                      style={{ width: '100%', maxWidth: '1000px' }}
                    />
                  ))}
              </AccordionDetails>
            </Accordion>
          ) : (
            <Typography sx={{ textAlign: 'center', marginTop: '60px' }}>
              Model cannot be extended
            </Typography>
          )}
          <Box
            sx={{
              height: `calc(100vh - ${headerHeight}px)`,
              width: '25%',
              padding: 2,
              position: 'fixed',
              top: headerHeight,
              right: 0,
              bottom: 0,
            }}>
            <Droppable droppableId="ITEMS" isDropDisabled={true}>
              {(provided) => (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    border: '1px',
                    borderRadius: 4,
                  }}
                  ref={provided.innerRef}>
                  {items.map((item, index) => (
                    <BuildTypesList item={item} index={index} key={item} />
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </Box>
        </DragDropContext>
      </Box>
      <BuildTypesDrawer
        disabledProps={disabledFields()}
        readOnly={readOnly}
        drawerData={drawerData}
        duplicateId={duplicateId}
        invalidName={invalidName}
        selectedItem={selectedProps.item}
        onClose={handleDrawerClose}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};

export default SchemaEditor;
