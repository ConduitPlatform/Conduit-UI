import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, resetServerContext } from 'react-beautiful-dnd';
import { renderToString } from 'react-dom/server';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import BuildTypesList from '../../components/cms/BuildTypesList';
import BuildTypesContent from '../../components/cms/BuildTypesContent';
import BuildTypesDrawer from '../../components/cms/BuildTypesDrawer';
import Header, { headerHeight } from '../../components/cms/Header';
import {
  addToChildGroup,
  addToGroup,
  cloneItem,
  deleteItem,
  getSchemaFields,
  getSchemaFieldsWithExtra,
  prepareFields,
  reorderItems,
  updateGroupChildItem,
  updateGroupItem,
  updateItem,
} from '../../utils/type-functions';
import { useRouter } from 'next/router';
import { privateRoute } from '../../components/utils/privateRoute';
import { useDispatch, useSelector } from 'react-redux';
import { createNewSchema, editSchema } from '../../redux/thunks/cmsThunks';
import { clearSelectedSchema } from '../../redux/actions';

const items = [
  'Text',
  'Number',
  'Date',
  'Boolean',
  'Enum',
  'ObjectId',
  'Group',
  'Relation',
];

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    backgroundColor: '#f5f6f9',
  },
  cmsContainer: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'space-between',
  },
  contentContainer: {
    width: '75%',
    display: 'flex',
    padding: theme.spacing(2, 14),
    justifyContent: 'center',
    paddingTop: headerHeight,
  },
  listContainer: {
    height: `calc(100vh - ${headerHeight}px)`,
    width: '25%',
    backgroundColor: '#f9f9fb',
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
    background: '#fff',
    borderRadius: 4,
  },
}));

const BuildTypes = () => {
  resetServerContext();
  renderToString(BuildTypes);

  const classes = useStyles();
  const router = useRouter();
  const dispatch = useDispatch();

  const { data } = useSelector((state) => state.cmsReducer);

  const [schemaFields, setSchemaFields] = useState({ newTypeFields: [] });
  const [schemaName, setSchemaName] = useState('');
  const [authentication, setAuthentication] = useState(false);
  const [crudOperations, setCrudOperations] = useState(false);
  const [drawerData, setDrawerData] = useState({
    open: false,
    type: '',
    destination: null,
  });
  const [duplicateId, setDuplicateId] = useState(false);
  const [invalidName, setInvalidName] = useState(false);
  const [selectedProps, setSelectedProps] = useState({
    item: undefined,
    index: undefined,
    type: 'standard',
  });
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    if (data.selectedSchema) {
      setReadOnly(true);
    }
    if (!data.selectedSchema) {
      setCrudOperations(true);
    }
    if (data && data.selectedSchema) {
      setSchemaName(data.selectedSchema.name);
      if (
        data.selectedSchema.authentication !== null &&
        data.selectedSchema.authentication !== undefined
      ) {
        setAuthentication(data.selectedSchema.authentication);
      }
      if (
        data.selectedSchema.crudOperations !== null &&
        data.selectedSchema.crudOperations !== undefined
      ) {
        setCrudOperations(data.selectedSchema.crudOperations);
      }
      const formattedFields = getSchemaFieldsWithExtra(data.selectedSchema.fields);
      setSchemaFields({ newTypeFields: formattedFields });
    }
  }, [data]);

  useEffect(() => {
    if (!data.selectedSchema) {
      let initialFields = [
        {
          default: '',
          isArray: false,
          name: '_id',
          required: false,
          select: true,
          type: 'ObjectId',
          unique: true,
        },
        {
          default: '',
          isArray: false,
          name: 'createdAt',
          required: false,
          select: true,
          type: 'Date',
          unique: false,
        },
        {
          default: '',
          isArray: false,
          name: 'updatedAt',
          required: false,
          select: true,
          type: 'Date',
          unique: false,
        },
      ];
      setSchemaFields({ newTypeFields: initialFields });
    }
  }, [data.selectedSchema]);

  useEffect(() => {
    if (router.query.name) {
      setSchemaName(router.query.name);
    }
  }, [router.query.name, router.query.schema, router.query.schemaId]);

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      setSchemaFields({
        newTypeFields: reorderItems(
          schemaFields[source.droppableId],
          source.index,
          destination.index
        ),
      });
    }

    let droppableIdString = `${destination.droppableId}`;
    let groupIsGroupChild = droppableIdString.slice(0, 5);

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

  const handleSubmit = (typeData) => {
    const array = schemaFields.newTypeFields;
    if (!Array.isArray(array)) {
      return;
    }
    let hasDuplicate = false;
    let hasInvalidName = false;
    let droppableIdString = '';
    let isGroup = '';
    let groupId = '';
    if (drawerData.destination) {
      droppableIdString = `${drawerData.destination.droppableId}`;
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
      hasDuplicate = content.some((item) => {
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
          return object.content.find((content) => content.name === groupId);
        }
        return false;
      });
      if (!parentGroup) return;
      const innerGroup = parentGroup.content.find((object2) => object2.name === groupId);
      if (!innerGroup) return;
      const content = innerGroup.content;
      hasDuplicate = content.some((item) => {
        if (selectedProps.item) {
          if (selectedProps.item.name === item.name) {
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
        setSchemaFields({
          newTypeFields: updateItem(
            schemaFields.newTypeFields,
            typeData,
            selectedProps.index
          ),
        });
      }

      if (selectedProps.type === 'group') {
        setSchemaFields({
          newTypeFields: updateGroupItem(
            schemaFields.newTypeFields,
            groupId,
            typeData,
            selectedProps.index
          ),
        });
      }

      if (selectedProps.type === 'group-child') {
        setSchemaFields({
          newTypeFields: updateGroupChildItem(
            schemaFields.newTypeFields,
            groupId,
            typeData,
            selectedProps.index
          ),
        });
      }
    } else if (isGroup === 'group') {
      setSchemaFields({
        newTypeFields: addToGroup(
          schemaFields.newTypeFields,
          groupId,
          typeData,
          drawerData.destination
        ),
      });
    } else if (isGroup === 'child') {
      setSchemaFields({
        newTypeFields: addToChildGroup(
          schemaFields.newTypeFields,
          groupId,
          typeData,
          drawerData.destination
        ),
      });
    } else {
      setSchemaFields({
        newTypeFields: cloneItem(
          schemaFields.newTypeFields,
          typeData,
          drawerData.destination
        ),
      });
    }

    handleDrawerClose();
  };

  const handleDrawer = (item, index) => {
    setSelectedProps({ item: item, index: index, type: 'standard' });
    setDrawerData({
      ...drawerData,
      open: true,
      type: schemaFields.newTypeFields[index].isEnum
        ? 'Enum'
        : schemaFields.newTypeFields[index].type,
    });
  };

  const handleDelete = (index) => {
    setSchemaFields({
      newTypeFields: deleteItem(schemaFields.newTypeFields, index),
    });
  };

  const handleGroupDrawer = (item, index, groupIndex) => {
    setSelectedProps({ item: item, index: index, type: 'group' });
    setDrawerData({
      ...drawerData,
      open: true,
      type: schemaFields.newTypeFields[groupIndex].content[index].isEnum
        ? 'Enum'
        : schemaFields.newTypeFields[groupIndex].content[index].type,
      destination: {
        ...drawerData.destination,
        droppableId: `group-${schemaFields.newTypeFields[groupIndex].name}`,
      },
    });
  };

  const handleGroupDelete = (index, groupIndex) => {
    const deleted = Array.from(schemaFields.newTypeFields);
    deleted[groupIndex].content.splice(index, 1);
    setSchemaFields({
      newTypeFields: deleted,
    });
  };

  const handleGroupInGroupDrawer = (item, index, groupIndex, itemIndex) => {
    setSelectedProps({ item: item, index: index, type: 'group-child' });
    setDrawerData({
      ...drawerData,
      open: true,
      type: schemaFields.newTypeFields[groupIndex].content[itemIndex].content[index]
        .isEnum
        ? 'Enum'
        : schemaFields.newTypeFields[groupIndex].content[itemIndex].content[index].type,
      destination: {
        ...drawerData.destination,
        droppableId: `group-${schemaFields.newTypeFields[groupIndex].content[itemIndex].name}`,
      },
    });
  };

  const handleGroupInGroupDelete = (index, groupIndex, itemIndex) => {
    const deleted = Array.from(schemaFields.newTypeFields);
    deleted[groupIndex].content[itemIndex].content.splice(index, 1);
    setSchemaFields({
      newTypeFields: deleted,
    });
  };

  const handleSave = (name, authentication) => {
    if (data && data.selectedSchema) {
      const { _id } = data.selectedSchema;
      const editableSchemaFields = prepareFields(schemaFields.newTypeFields);
      const editableSchema = {
        authentication,
        crudOperations,
        fields: { ...editableSchemaFields },
      };

      dispatch(editSchema(_id, editableSchema));
    } else {
      const newSchemaFields = prepareFields(schemaFields.newTypeFields);
      const newSchema = {
        name: name,
        authentication,
        crudOperations,
        fields: newSchemaFields,
      };
      dispatch(createNewSchema(newSchema));
    }
    dispatch(clearSelectedSchema());
    router.push({ pathname: '/cms' });
  };

  return (
    <Box className={classes.root}>
      <Header
        name={schemaName}
        authentication={authentication}
        crudOperations={crudOperations}
        readOnly={readOnly}
        handleSave={handleSave}
      />
      <Box className={classes.cmsContainer}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Box className={classes.contentContainer}>
            {schemaFields &&
              Object.keys(schemaFields).map((dataKey) => (
                <BuildTypesContent
                  dataKey={dataKey}
                  data={schemaFields}
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
          <Box className={classes.listContainer}>
            <Droppable droppableId="ITEMS" isDropDisabled={true}>
              {(provided) => (
                <Box className={classes.list} ref={provided.innerRef}>
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

export default privateRoute(BuildTypes);