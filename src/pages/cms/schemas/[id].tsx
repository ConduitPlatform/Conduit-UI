import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, resetServerContext } from 'react-beautiful-dnd';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import BuildTypesList from '../../../components/cms/BuildTypesList';
import BuildTypesContent from '../../../components/cms/BuildTypesContent';
import BuildTypesDrawer from '../../../components/cms/BuildTypesDrawer';
import Header, { headerHeight } from '../../../components/cms/Header';
import {
  addToChildGroup,
  addToGroup,
  cloneItem,
  cmsExtension,
  deleteItem,
  getSchemaFieldsWithExtra,
  prepareFields,
  reorderItems,
  updateGroupChildItem,
  updateGroupItem,
  updateItem,
} from '../../../utils/type-functions';
import { useRouter } from 'next/router';
import {
  asyncCreateNewSchema,
  asyncEditSchema,
  asyncGetCmsSchemas,
  clearSelectedSchema,
} from '../../../redux/slices/cmsSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { ModifyOptions, Permissions, Schema } from '../../../models/cms/CmsModels';
import { Typography } from '@material-ui/core';

resetServerContext();

const items = ['Text', 'Number', 'Date', 'Boolean', 'Enum', 'ObjectId', 'Group', 'Relation'];

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    backgroundColor: theme.palette.background.default,
  },
  cmsContainer: {
    minHeight: '100vh',
    flexDirection: 'column',
    display: 'flex',
    justifyContent: 'space-between',
  },
  contentContainer: {
    width: '75%',
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2, 14),
    justifyContent: 'center',
    paddingTop: headerHeight,
  },
  listContainer: {
    height: `calc(100vh - ${headerHeight}px)`,
    width: '25%',
    backgroundColor: '#262840',
    padding: theme.spacing(2),
    position: 'fixed',
    top: headerHeight,
    right: 0,
    bottom: 0,
  },
  list: {
    width: '100%',
    height: '100%',
    border: '1px',
    background: '#262840',
    borderRadius: 4,
  },
}));

const BuildTypes: React.FC = () => {
  const classes = useStyles();
  const router = useRouter();
  const dispatch = useAppDispatch();
  resetServerContext();

  const { data } = useAppSelector((state) => state.cmsSlice);
  const [editableFields, setEditableFields] = useState<any>({ newTypeFields: [] });
  const [nonEditableFields, setNonEditableFields] = useState<any[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<Schema>();
  const [schemaName, setSchemaName] = useState<string>('');
  const [authentication, setAuthentication] = useState(false);
  const [crudOperations, setCrudOperations] = useState(false);
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
    dispatch(asyncGetCmsSchemas({ skip: 0, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    const { id } = router.query;
    const foundSchema = data.schemas.schemaDocuments.find((schema) => schema._id === id);
    setSelectedSchema(foundSchema);
  }, [data.schemas.schemaDocuments, router.query]);

  useEffect(() => {
    if (selectedSchema) {
      setReadOnly(true);
    }
    if (!selectedSchema) {
      setCrudOperations(true);
    }
    console.log(selectedSchema);
    if (
      data &&
      selectedSchema &&
      selectedSchema.ownerModule === 'cms' &&
      !selectedSchema.extensions.length
    ) {
      setSchemaName(selectedSchema.name);
      if (
        selectedSchema.modelOptions.conduit.cms.authentication !== null &&
        selectedSchema.modelOptions.conduit.cms.authentication !== undefined
      ) {
        setAuthentication(selectedSchema.modelOptions.conduit.cms.authentication);
      }
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
      data &&
      selectedSchema &&
      selectedSchema.ownerModule === 'cms' &&
      selectedSchema.extensions
    ) {
      setSchemaName(selectedSchema.name);
      setAuthentication(false);
      setCrudOperations(false);
      setSchemaPermissions(selectedSchema.modelOptions.conduit.permissions);
      const extensionSchemas = selectedSchema.extensions.map((ext) => ({
        [ext.ownerModule]: getSchemaFieldsWithExtra(ext.fields),
      }));
      setNonEditableFields(extensionSchemas);
      const formattedFields = getSchemaFieldsWithExtra(selectedSchema.fields);
      setEditableFields({ newTypeFields: formattedFields });
    } else if (data && selectedSchema && selectedSchema.ownerModule !== 'cms') {
      setSchemaName(selectedSchema.name);
      setAuthentication(false);
      setCrudOperations(false);
      setSchemaPermissions(selectedSchema.modelOptions.conduit.permissions);
      if (
        selectedSchema.extensions &&
        selectedSchema.extensions.length &&
        selectedSchema.modelOptions.conduit.permissions.extendable
      ) {
        if (cmsExtension(selectedSchema.extensions)) {
          const foundCmsSchemaFields = cmsExtension(selectedSchema.extensions);
          const formattedFields = getSchemaFieldsWithExtra(foundCmsSchemaFields);
          setEditableFields({ newTypeFields: formattedFields });

          const extensionSchemas = selectedSchema.extensions.map((ext) => ({
            [ext.ownerModule]: getSchemaFieldsWithExtra(ext.fields),
          }));
          const mainField = {
            [selectedSchema.name]: getSchemaFieldsWithExtra(selectedSchema.fields),
          };
          const finalizedArray = [mainField, ...extensionSchemas].filter((obj) => !obj.cms);
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
  }, [data]);

  // useEffect(() => {
  //   if (!selectedSchema) {
  //     const initialFields = [
  //       {
  //         default: '',
  //         isArray: false,
  //         name: '_id',
  //         required: false,
  //         select: true,
  //         type: 'ObjectId',
  //         unique: true,
  //       },
  //       {
  //         default: '',
  //         isArray: false,
  //         name: 'createdAt',
  //         required: false,
  //         select: true,
  //         type: 'Date',
  //         unique: false,
  //       },
  //       {
  //         default: '',
  //         isArray: false,
  //         name: 'updatedAt',
  //         required: false,
  //         select: true,
  //         type: 'Date',
  //         unique: false,
  //       },
  //     ];
  //     setEditableFields({ newTypeFields: initialFields });
  //   }
  // }, [selectedSchema]);

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
    setEditableFields({
      newTypeFields: deleteItem(editableFields.newTypeFields, index),
    });
  };

  const handleGroupDrawer = (item: any, index: number, groupIndex: number) => {
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
    const deleted: any = Array.from(editableFields.newTypeFields);
    deleted[groupIndex].content[itemIndex].content.splice(index, 1);
    setEditableFields({
      newTypeFields: deleted,
    });
  };

  const handleSave = (
    name: string,
    authenticate: boolean,
    allowCrud: boolean,
    permissions: Permissions
  ) => {
    if (data && selectedSchema) {
      const { _id } = selectedSchema;
      const editableSchemaFields = prepareFields(editableFields.newTypeFields);
      const editableSchema = {
        authentication: authenticate,
        crudOperations: allowCrud,
        permissions,
        fields: { ...editableSchemaFields },
      };

      dispatch(asyncEditSchema({ _id, data: editableSchema }));
    } else {
      const newSchemaFields = prepareFields(editableFields.newTypeFields);
      const newSchema = {
        name: name,
        authentication: authenticate,
        crudOperations: allowCrud,
        permissions,
        fields: newSchemaFields,
      };

      dispatch(asyncCreateNewSchema(newSchema));
    }
    dispatch(clearSelectedSchema());
    router.push({ pathname: '/cms/schemas' });
  };

  const extractEditableTitle = () => {
    if (editableFields.newTypeFields.length <= 0 && nonEditableFields.length) {
      return 'Would you like to extend this Schema?';
    } else {
      return 'Editable fields (CMS)';
    }
  };

  console.log(editableFields);
  console.log(nonEditableFields);

  return (
    <Box className={classes.root}>
      {selectedSchema && (
        <Header
          name={schemaName}
          authentication={authentication}
          crudOperations={crudOperations}
          permissions={schemaPermissions}
          readOnly={readOnly}
          handleSave={handleSave}
          selectedSchema={selectedSchema}
        />
      )}
      <Box className={classes.cmsContainer}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Box className={classes.contentContainer}>
            <Typography style={{ textAlign: 'center' }} variant="h6">
              {extractEditableTitle()}
            </Typography>
            {editableFields &&
              Object.keys(editableFields).map((dataKey) => (
                <BuildTypesContent
                  dataKey={dataKey}
                  data={editableFields}
                  handleDelete={handleDelete}
                  handleDrawer={handleDrawer}
                  handleGroupDelete={handleGroupDelete}
                  handleGroupDrawer={handleGroupDrawer}
                  handleGroupInGroupDelete={handleGroupInGroupDelete}
                  handleGroupInGroupDrawer={handleGroupInGroupDrawer}
                  key={dataKey}
                  style={{ width: '100%' }}
                />
              ))}
          </Box>
          {nonEditableFields.length &&
            nonEditableFields.map((ext, i) => {
              return (
                <Box key={i} className={classes.contentContainer}>
                  <Typography style={{ textAlign: 'center' }} variant="h6">
                    {Object.keys(ext).toString() !== 'cms'
                      ? `${Object.keys(ext).toString().toUpperCase()} (read only)`
                      : Object.keys(ext).toString().toUpperCase()}
                  </Typography>
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
                        key={dataKey}
                        style={{ width: '100%' }}
                        disabled
                      />
                    ))}
                </Box>
              );
            })}
          <Box className={classes.listContainer}>
            <Droppable droppableId="ITEMS" isDropDisabled={true}>
              {(provided) => (
                <div className={classes.list} ref={provided.innerRef}>
                  {items.map((item, index) => (
                    <BuildTypesList item={item} index={index} key={item} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Box>
        </DragDropContext>
      </Box>
      <BuildTypesDrawer
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

export default BuildTypes;
