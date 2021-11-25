import React, { FC } from 'react';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import OperationsEnum from '../../../models/OperationsEnum';
import { findFieldsWithTypes, getAvailableFieldsOfSchema } from '../../../utils/cms';
import { setEndpointData, setSchemaFields } from '../../../redux/slices/customEndpointsSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { Schema } from '../../../models/cms/CmsModels';
import { Assignment } from '../../../models/customEndpoints/customEndpointsModels';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 180,
  },
  divider: {
    '&.MuiDivider-root': {
      height: '2px',
      background: '#000000',
      borderRadius: '4px',
    },
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

  const { endpoint, schemaFields } = useAppSelector((state) => state.customEndpointsSlice.data);

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

  const handleSchemaChange = (event: React.ChangeEvent<{ value: any }>) => {
    const assignments: Assignment[] = [];
    const selectedSchema = event.target.value;
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

  return (
    <>
      <Grid item xs={3}>
        <TextField
          select
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
      <Grid item xs={3}>
        <TextField
          select
          label={'Select Schema'}
          disabled={!editMode}
          variant="outlined"
          className={classes.formControl}
          value={endpoint.selectedSchema}
          onChange={handleSchemaChange}>
          {availableSchemas.map((schema, index: number) => (
            <MenuItem key={`schema-${index}`} value={schema._id}>
              {schema.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={endpoint.operation === OperationsEnum.GET ? 2 : 4}>
        <FormControlLabel
          control={
            <Checkbox
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
        <Grid item xs={2}>
          <FormControlLabel
            control={
              <Checkbox
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
      )}
      {endpoint.operation === OperationsEnum.GET && (
        <Grid item xs={2}>
          <FormControlLabel
            control={
              <Checkbox
                disabled={!editMode}
                color={'primary'}
                checked={endpoint.sorted}
                onChange={handleSortedChange}
                name="sorted"
              />
            }
            label="Sorted"
          />
        </Grid>
      )}
    </>
  );
};

export default OperationSection;
