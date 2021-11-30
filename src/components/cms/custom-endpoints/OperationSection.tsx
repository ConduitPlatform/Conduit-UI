import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  MenuItem,
  TextField,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import OperationsEnum from '../../../models/OperationsEnum';
import { findFieldsWithTypes, getAvailableFieldsOfSchema } from '../../../utils/cms';
import { setEndpointData, setSchemaFields } from '../../../redux/slices/customEndpointsSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { Schema } from '../../../models/cms/CmsModels';
import { Assignment } from '../../../models/customEndpoints/customEndpointsModels';
import TableDialog from '../../common/TableDialog';
import { Pagination, Search } from '../../../models/http/HttpModels';
import { asyncGetCmsSchemasDialog } from '../../../redux/slices/cmsSlice';
import { Loop } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: 180,
  },
  divider: {
    '&.MuiDivider-root': {
      height: '2px',
      background: '#000000',
      borderRadius: '4px',
    },
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

interface Props {
  schemas: any;
  editMode: boolean;
  availableSchemas: Schema[];
}

const OperationSection: FC<Props> = ({ schemas, editMode, availableSchemas }) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [drawer, setDrawer] = useState<boolean>(false);
  const [displayedSchema, setDisplayedSchema] = useState<Schema[]>([]);
  const { endpoint, schemaFields } = useAppSelector((state) => state.customEndpointsSlice.data);

  useEffect(() => {
    if (endpoint.selectedSchema) {
      const foundSchema = availableSchemas.find((schema) => schema._id === endpoint.selectedSchema);
      foundSchema && setDisplayedSchema([foundSchema]);
    } else {
      setDisplayedSchema([]);
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
    if (endpoint.operation && endpoint.operation === OperationsEnum.POST) {
      const fieldKeys = Object.keys(fields);

      fieldKeys.forEach((field) => {
        const assignment: Assignment = {
          schemaField: field,
          action: 0,
          assignmentField: { type: '', value: '' },
        };
        assignments.push(assignment);
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
    (state) => state.cmsSlice.data.dialogSchemas
  );

  const getData = useCallback(
    (params: Pagination & Search) => {
      if (drawer) {
        dispatch(asyncGetCmsSchemasDialog({ ...params }));
      }
    },
    [dispatch, drawer]
  );

  const headers = [
    { title: '_id' },
    { title: 'Name' },
    { title: 'Authenticated' },
    { title: 'CRUD' },
    { title: 'Enabled' },
    { title: 'Created at' },
    { title: 'Updated at' },
  ];

  const formatSchemas = (schemasToFormat: Schema[]) => {
    return schemasToFormat.map((d) => ({
      _id: d._id,
      name: d.name,
      authentication: d.authentication,
      crudOperations: d.crudOperations,
      enabled: d.enabled,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
  };

  return (
    <>
      <Grid item container spacing={6} xs={12}>
        <Grid item xs={1} />
        <Grid item xs={3} className={classes.container}>
          <TextField
            select
            fullWidth
            label={'Select Operation'}
            variant="outlined"
            className={classes.formControl}
            value={endpoint.operation}
            disabled={!editMode}
            onChange={handleOperationChange}>
            <MenuItem aria-label="None" value="" />
            <MenuItem value={OperationsEnum.GET}>Find/Get</MenuItem>
            <MenuItem value={OperationsEnum.POST}>Create</MenuItem>
            <MenuItem value={OperationsEnum.PUT}>Update/Edit</MenuItem>
            <MenuItem value={OperationsEnum.DELETE}>Delete</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={3} className={classes.container}>
          <Grid item sm={12}>
            <Button
              variant="contained"
              color="secondary"
              disabled={!editMode}
              endIcon={editMode && <Loop />}
              onClick={() => setDrawer(true)}>
              {displayedSchema[0] ? `Schema: ${displayedSchema[0].name}` : 'Select Schema'}
            </Button>
          </Grid>
        </Grid>

        <Grid item xs={1}>
          <FormControl>
            <FormLabel>
              <FormGroup>
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
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      disabled={!editMode || endpoint.operation !== OperationsEnum.GET}
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
              </FormGroup>
            </FormLabel>
          </FormControl>
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
