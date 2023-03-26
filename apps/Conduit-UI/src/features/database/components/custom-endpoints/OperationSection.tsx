import React, { FC, useCallback, useEffect, useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, MenuItem, TextField } from '@mui/material';
import { OperationsEnum } from '../../models/OperationsEnum';
import { findFieldsWithTypes } from '../../utils/cms';
import {
  setAccessibleSchemaFields,
  setCompiledSchemaFields,
  setEndpointData,
} from '../../store/customEndpointsSlice';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import { Schema } from '../../models/CmsModels';
import { Assignment } from '../../models/customEndpointsModels';
import TableDialog from '../../../../components/common/TableDialog';
import { Pagination, Search } from '../../../../models/http/HttpModels';
import { asyncGetSchemasDialog } from '../../store/databaseSlice';
import { getAccesssibleSchemaFields, getSchemaByIdRequest } from '../../http/DatabaseRequests';
import { enqueueInfoNotification } from '../../../../hooks/useNotifier';

interface Props {
  createMode: boolean;
  editMode: boolean;
  availableSchemas: Schema[];
}

const OperationSection: FC<Props> = ({ createMode, editMode, availableSchemas }) => {
  const dispatch = useAppDispatch();
  const [drawer, setDrawer] = useState<boolean>(false);
  const [displayedSchema, setDisplayedSchema] = useState<Schema[]>([]);
  const { endpoint, schemaFields } = useAppSelector((state) => state.customEndpointsSlice.data);

  useEffect(() => {
    if (endpoint.selectedSchema) {
      setDisplayedSchema([]);
      const foundSchema = availableSchemas.find((schema) => schema._id === endpoint.selectedSchema);
      foundSchema && setDisplayedSchema([foundSchema]);
    }
  }, [endpoint.selectedSchema, availableSchemas]);

  useEffect(() => {
    if (createMode) {
      setDisplayedSchema([]);
    }
  }, [createMode]);

  const handleOperationChange = async (event: React.ChangeEvent<{ value: any }>) => {
    const operation = Number(event.target.value);
    setDisplayedSchema([]);
    dispatch(setEndpointData({ selectedSchema: '' }));
    const assignments: Assignment[] = [];
    if (operation === 1) {
      if (endpoint.selectedSchema) {
        if (schemaFields?.length > 0) {
          schemaFields.forEach((field: string) => {
            const assignment: Assignment = {
              schemaField: field,
              action: 0,
              assignmentField: { type: '', value: '' },
            };
            assignments.push(assignment);
          });
        }
      }
    }
    dispatch(setEndpointData({ operation, assignments }));

    if (endpoint.selectedSchema !== '') {
      const selectedSchema = endpoint.selectedSchema;
      const fields = await getAccesssibleSchemaFields(selectedSchema, operation);
      const schema = await getSchemaByIdRequest(selectedSchema);

      if (Object.keys(fields.data.accessibleFields).length === 0) {
        dispatch(
          enqueueInfoNotification('Current model does not have accessible fields!', 'duplicate')
        );
      }

      const fieldsWithTypes = findFieldsWithTypes(fields.data.accessibleFields);
      const compiledFieldsWithTypes = findFieldsWithTypes(schema.data.compiledFields);

      if (
        endpoint.operation &&
        (endpoint.operation === OperationsEnum.POST || endpoint.operation === OperationsEnum.PATCH)
      ) {
        const fieldKeys = Object.keys(fields);

        fieldKeys.forEach((field) => {
          const assignment: Assignment = {
            schemaField: field,
            action: 0,
            assignmentField: { type: '', value: '' },
          };

          if (fields[field].required) assignments.push(assignment);
        });
      }
      dispatch(setEndpointData({ selectedSchema, assignments }));
      dispatch(setAccessibleSchemaFields(fieldsWithTypes));
      dispatch(setCompiledSchemaFields(compiledFieldsWithTypes));
    }
  };

  const handleSchemaChange = async (changedSchema: Schema[]) => {
    const assignments: Assignment[] = [];
    const selectedSchema = changedSchema[0]._id;
    const fields = await getAccesssibleSchemaFields(selectedSchema, endpoint.operation);
    const schema = await getSchemaByIdRequest(selectedSchema);

    if (Object.keys(fields.data.accessibleFields).length === 0) {
      dispatch(
        enqueueInfoNotification('Current model does not have accessible fields!', 'duplicate')
      );
    }

    const fieldsWithTypes = findFieldsWithTypes(fields.data.accessibleFields);
    const compiledFieldsWithTypes = findFieldsWithTypes(schema.data.compiledFields);

    if (
      endpoint.operation &&
      (endpoint.operation === OperationsEnum.POST || endpoint.operation === OperationsEnum.PATCH)
    ) {
      const fieldKeys = Object.keys(fields);

      fieldKeys.forEach((field) => {
        const assignment: Assignment = {
          schemaField: field,
          action: 0,
          assignmentField: { type: '', value: '' },
        };

        if (fields[field].required) assignments.push(assignment);
      });
    }
    dispatch(setEndpointData({ selectedSchema, assignments }));
    dispatch(setAccessibleSchemaFields(fieldsWithTypes));
    dispatch(setCompiledSchemaFields(compiledFieldsWithTypes));
  };

  const handleAuthenticationChange = (event: React.ChangeEvent<{ checked: boolean }>) => {
    dispatch(setEndpointData({ authentication: event.target.checked }));
  };

  const handlePaginatedChange = (event: React.ChangeEvent<{ checked: boolean }>) => {
    dispatch(setEndpointData({ paginated: event.target.checked }));
  };

  const handleSortedChange = (event: React.ChangeEvent<{ checked: boolean }>) => {
    dispatch(setEndpointData({ sorted: event.target.checked }));
  };

  const { schemas: schemasForDialog, schemasCount } = useAppSelector(
    (state) => state.databaseSlice.data.dialogSchemas
  );

  const getData = useCallback(
    (params: Pagination & Search) => {
      if (drawer) {
        dispatch(asyncGetSchemasDialog({ ...params, enabled: true, sort: 'name' }));
      }
    },
    [dispatch, drawer]
  );

  const headers = [
    { title: '_id' },
    { title: 'Name' },
    { title: 'Owner' },
    { title: 'Read' },
    { title: 'Create' },
    { title: 'Update' },
    { title: 'Delete' },
    { title: '' },
  ];

  const formatSchemas = (schemasToFormat: Schema[]) => {
    return schemasToFormat?.map((d) => ({
      _id: d._id,
      name: d.name,
      ownerModule: d.ownerModule.toString(),
      get: d.modelOptions.conduit.cms?.crudOperations.read.enabled ?? false,
      post: d.modelOptions.conduit.cms?.crudOperations.create.enabled ?? false,
      update: d.modelOptions.conduit.cms?.crudOperations.update.enabled ?? false,
      delete: d.modelOptions.conduit.cms?.crudOperations.delete.enabled ?? false,
    }));
  };

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
      <Box display="flex" gap={3} alignItems="center">
        <TextField
          select
          fullWidth
          size="small"
          label={'Select Operation'}
          variant="outlined"
          sx={{ minWidth: 220 }}
          value={endpoint.operation}
          disabled={!editMode}
          onChange={handleOperationChange}>
          <MenuItem aria-label="None" value="-1" />
          <MenuItem value={OperationsEnum.GET}>Find/Get</MenuItem>
          <MenuItem value={OperationsEnum.POST}>Create</MenuItem>
          <MenuItem value={OperationsEnum.PUT}>Update/Edit</MenuItem>
          <MenuItem value={OperationsEnum.DELETE}>Delete</MenuItem>
          <MenuItem value={OperationsEnum.PATCH}>Patch</MenuItem>
        </TextField>
        <Button
          fullWidth
          size="small"
          variant="contained"
          color="primary"
          disabled={!editMode || endpoint.operation === -1}
          onClick={() => setDrawer(true)}>
          {displayedSchema[0] ? `Schema: ${displayedSchema[0].name}` : 'Select Schema'}
        </Button>
      </Box>
      <Box display="flex" justifyContent="flex-end">
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              disabled={!editMode}
              color={'primary'}
              checked={endpoint.authentication}
              onChange={handleAuthenticationChange}
              name="authentication"
            />
          }
          label="Authenticated"
        />

        {endpoint.operation === OperationsEnum.GET && (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  disabled={!editMode}
                  color={'primary'}
                  checked={endpoint.paginated}
                  onChange={handlePaginatedChange}
                  name="paginated"
                />
              }
              label="Paginated"
            />

            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  disabled={!editMode || endpoint.operation !== OperationsEnum.GET}
                  color={'primary'}
                  checked={endpoint.sorted}
                  onChange={handleSortedChange}
                  name="sorted"
                />
              }
              label="Sorted"
            />
          </>
        )}
      </Box>
      {editMode && (
        <TableDialog
          open={drawer}
          singleSelect
          title={'Select schema'}
          headers={headers}
          getData={getData}
          data={{
            tableData: formatSchemas(schemasForDialog),
            count: schemasCount,
          }}
          handleClose={() => setDrawer(false)}
          buttonText={'Select schema'}
          dialogAction={handleSchemaChange}
          setExternalElements={setDisplayedSchema}
          externalElements={displayedSchema}
          disableSelectAllButton
        />
      )}
    </Box>
  );
};

export default OperationSection;
