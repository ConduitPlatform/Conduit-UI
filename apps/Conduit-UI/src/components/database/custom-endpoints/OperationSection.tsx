import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  styled,
  TextField,
} from '@mui/material';
import { OperationsEnum } from '../../../models/OperationsEnum';
import { findFieldsWithTypes, getAvailableFieldsOfSchema } from '../../../utils/cms';
import { setEndpointData, setSchemaFields } from '../../../redux/slices/customEndpointsSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { Schema } from '../../../models/database/CmsModels';
import { Assignment } from '../../../models/customEndpoints/customEndpointsModels';
import TableDialog from '../../common/TableDialog';
import { Pagination, Search } from '../../../models/http/HttpModels';
import { asyncGetSchemasDialog } from '../../../redux/slices/databaseSlice';
import { Loop } from '@mui/icons-material';

const CustomizedGrid = styled(Grid)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
}));

interface Props {
  schemas: any;
  editMode: boolean;
  availableSchemas: Schema[];
}

const OperationSection: FC<Props> = ({ schemas, editMode, availableSchemas }) => {
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

  const handleOperationChange = (event: React.ChangeEvent<{ value: any }>) => {
    const operation = Number(event.target.value);
    const assignments: Assignment[] = [];
    if (operation === 1) {
      if (endpoint.selectedSchema) {
        if (schemaFields.length > 0) {
          schemaFields.forEach((field) => {
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
  };

  const handleSchemaChange = (changedSchema: Schema[]) => {
    const assignments: Assignment[] = [];
    const selectedSchema = changedSchema[0]._id;
    const fields = getAvailableFieldsOfSchema(selectedSchema, schemas);
    const fieldsWithTypes = findFieldsWithTypes(fields);

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
        dispatch(asyncGetSchemasDialog({ ...params, owner: ['database'] }));
      }
    },
    [dispatch, drawer]
  );

  const headers = [
    { title: '_id' },
    { title: 'Name' },
    { title: 'Can read' },
    { title: 'Can update' },
    { title: 'Can update' },
    { title: 'Can delete' },
  ];

  const formatSchemas = (schemasToFormat: Schema[]) => {
    return schemasToFormat?.map((d) => ({
      _id: d._id,
      name: d.name,
      get: d.modelOptions.conduit.cms.crudOperations.read.enabled,
      post: d.modelOptions.conduit.cms.crudOperations.create.enabled,
      update: d.modelOptions.conduit.cms.crudOperations.update.enabled,
      delete: d.modelOptions.conduit.cms.crudOperations.delete.enabled,
    }));
  };

  return (
    <>
      <Grid item container spacing={6} xs={12}>
        <Grid item xs={3} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TextField
            select
            fullWidth
            size="small"
            label={'Select Operation'}
            variant="outlined"
            sx={{ minWidth: 180 }}
            value={endpoint.operation}
            disabled={!editMode}
            onChange={handleOperationChange}>
            <MenuItem aria-label="None" value="" />
            <MenuItem value={OperationsEnum.GET}>Find/Get</MenuItem>
            <MenuItem value={OperationsEnum.POST}>Create</MenuItem>
            <MenuItem value={OperationsEnum.PUT}>Update/Edit</MenuItem>
            <MenuItem value={OperationsEnum.DELETE}>Delete</MenuItem>
            <MenuItem value={OperationsEnum.PATCH}>Patch</MenuItem>
          </TextField>
        </Grid>
        <CustomizedGrid item xs={3}>
          <Grid item sm={12}>
            <Button
              size="small"
              variant="contained"
              color="secondary"
              disabled={!editMode}
              endIcon={editMode && <Loop />}
              onClick={() => setDrawer(true)}>
              {displayedSchema[0] ? `Schema: ${displayedSchema[0].name}` : 'Select Schema'}
            </Button>
          </Grid>
        </CustomizedGrid>
        <CustomizedGrid item xs={endpoint.operation === OperationsEnum.GET ? 2 : 3}>
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
        </CustomizedGrid>
        {endpoint.operation === OperationsEnum.GET ? (
          <>
            <CustomizedGrid item xs={2}>
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
            </CustomizedGrid>
            <CustomizedGrid item xs={2}>
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
            </CustomizedGrid>
          </>
        ) : (
          <Grid item xs={4} />
        )}
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
