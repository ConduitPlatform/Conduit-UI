import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button, FormControlLabel, Grid, MenuItem, TextField } from '@mui/material';
import { OperationsEnum } from '../../../models/OperationsEnum';
import { findFieldsWithTypes } from '../../../utils/cms';
import { setEndpointData, setSchemaFields } from '../../../redux/slices/customEndpointsSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { Schema } from '../../../models/database/CmsModels';
import { Assignment } from '../../../models/customEndpoints/customEndpointsModels';
import TableDialog from '../../common/TableDialog';
import { Pagination, Search } from '../../../models/http/HttpModels';
import { asyncGetSchemasDialog } from '../../../redux/slices/databaseSlice';
import { Loop } from '@mui/icons-material';
import { getAccesssibleSchemaFields } from '../../../http/requests/DatabaseRequests';
import { enqueueInfoNotification } from '../../../utils/useNotifier';
import { ConduitCheckbox } from '@conduitplatform/ui-components';

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
        if (schemaFields.length > 0) {
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

      if (Object.keys(fields.data.accessibleFields).length === 0) {
        dispatch(
          enqueueInfoNotification('Current schema does not have accessible fields!', 'duplicate')
        );
      }

      const fieldsWithTypes = findFieldsWithTypes(fields.data.accessibleFields);

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
      dispatch(setSchemaFields(fieldsWithTypes));
    }
  };

  const handleSchemaChange = async (changedSchema: Schema[]) => {
    const assignments: Assignment[] = [];
    const selectedSchema = changedSchema[0]._id;
    const fields = await getAccesssibleSchemaFields(selectedSchema, endpoint.operation);

    if (Object.keys(fields.data.accessibleFields).length === 0) {
      dispatch(
        enqueueInfoNotification('Current schema does not have accessible fields!', 'duplicate')
      );
    }

    const fieldsWithTypes = findFieldsWithTypes(fields.data.accessibleFields);

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
    dispatch(setSchemaFields(fieldsWithTypes));
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
        dispatch(asyncGetSchemasDialog({ ...params, enabled: true }));
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
    <>
      <Grid item container spacing={2} xs={12} wrap={'nowrap'} justifyContent={'space-between'}>
        <Grid item container sx={{ alignItems: 'center', flex: 1 }} spacing={2}>
          <Grid item container sx={{ flex: 0 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={'Select Operation'}
              variant="outlined"
              sx={{ minWidth: 170 }}
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
          </Grid>

          <Grid item sx={{ flex: 1 }}>
            <Button
              size="small"
              variant="contained"
              color="primary"
              disabled={!editMode || endpoint.operation === -1}
              endIcon={editMode && <Loop />}
              onClick={() => setDrawer(true)}>
              {displayedSchema[0] ? `Schema: ${displayedSchema[0].name}` : 'Select Schema'}
            </Button>
          </Grid>
        </Grid>

        <Grid container item spacing={2} sx={{ flex: 1, pr: 1 }} justifyContent={'flex-end'}>
          <Grid item>
            <FormControlLabel
              control={
                <ConduitCheckbox
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
          </Grid>
          {endpoint.operation === OperationsEnum.GET && (
            <>
              <Grid item sx={{ flex: 0 }}>
                <FormControlLabel
                  control={
                    <ConduitCheckbox
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
              </Grid>
              <Grid item sx={{ flex: 0 }}>
                <FormControlLabel
                  control={
                    <ConduitCheckbox
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
              </Grid>
            </>
          )}
        </Grid>
      </Grid>
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
        />
      )}
    </>
  );
};

export default OperationSection;
