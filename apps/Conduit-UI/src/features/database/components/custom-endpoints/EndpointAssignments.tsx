import React, { FC, Fragment, useCallback } from 'react';
import { Box, Grid, IconButton, MenuItem, styled, TextField, Typography } from '@mui/material';
import { ActionTypes } from '../../models/ActionTypes.enum';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { deepClone } from '../../../../utils/deepClone';
import { Assignment, Input } from '../../models/customEndpointsModels';
import { extractInputValueType, getTypeOfValue, isValueIncompatible } from '../../utils/cms';
import { enqueueInfoNotification } from '../../../../hooks/useNotifier';
import { useAppDispatch } from '../../../../redux/store';

interface Props {
  editMode: boolean;
  selectedInputs: Input[];
  selectedAssignments: any;
  setSelectedAssignments: (assignments: Assignment[]) => void;
  availableFieldsOfSchema: [];
}

const CustomMenuItem = styled(MenuItem)(({ theme }) => ({
  minHeight: 0,
  margin: theme.spacing(0),
  padding: theme.spacing(0),
  '&.MuiMenuItem-dense': {
    paddingLeft: 12,
    fontWeight: 'bold',
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },
  },
}));

const EndpointAssignments: FC<Props> = ({
  editMode,
  selectedInputs,
  selectedAssignments,
  setSelectedAssignments,
  availableFieldsOfSchema,
}) => {
  const dispatch = useAppDispatch();

  const handleAssignmentFieldChange = (event: React.ChangeEvent<{ value: any }>, index: number) => {
    const value = event.target.value;
    const currentAssignments = selectedAssignments.slice();

    const input = { ...currentAssignments[index] };

    if (input) {
      input.schemaField = value;
      currentAssignments[index] = input;
      setSelectedAssignments(currentAssignments);
    }
  };

  const isArrayType = useCallback(
    (fieldName: any) => {
      if (typeof fieldName === 'string' && fieldName.indexOf('.') !== -1) {
        const splitQuery = fieldName.split('.');
        const foundInnerSchema: any = availableFieldsOfSchema.find(
          (innerField: any) => innerField.name === splitQuery[0]
        );
        if (foundInnerSchema?.type) {
          const innerSchemaType = foundInnerSchema?.type[splitQuery[1]]?.type;
          return Array.isArray(innerSchemaType);
        }
      }

      const field: any = availableFieldsOfSchema.find((f: any) => f.name === fieldName);
      if (field) {
        return Array.isArray(field.type);
      }
      return false;
    },
    [availableFieldsOfSchema]
  );

  const isNumberType = useCallback(
    (fieldName: any) => {
      if (typeof fieldName === 'string' && fieldName.indexOf('.') !== -1) {
        const splitQuery = fieldName.split('.');
        const foundInnerSchema: any = availableFieldsOfSchema.find(
          (innerField: any) => innerField.name === splitQuery[0]
        );
        if (foundInnerSchema?.type) {
          const innerSchemaType = foundInnerSchema?.type[splitQuery[1]]?.type;
          return innerSchemaType === 'Number';
        }
      }
      const field: any = availableFieldsOfSchema.find((f: any) => f.name === fieldName);
      if (field) {
        return field.type === 'Number';
      }
      return false;
    },
    [availableFieldsOfSchema]
  );

  const handleAssignmentActionChange = (
    event: React.ChangeEvent<{ value: any }>,
    index: number
  ) => {
    const value = event.target.value;
    const currentAssignments = deepClone(selectedAssignments);
    const input = currentAssignments[index];

    if (input) {
      input.action = Number(value);
      setSelectedAssignments(currentAssignments);
    }
  };

  const handleAssignmentValueFieldChange = (
    event: React.ChangeEvent<{ value: any }>,
    index: number
  ) => {
    const value = event.target.value;
    const type = value.split('-')[0];
    const actualValue = value.split('-')[1];
    const currentAssignments = deepClone(selectedAssignments);
    const assignment = currentAssignments[index];
    if (assignment) {
      assignment.assignmentField.type = type;
      assignment.assignmentField.value = actualValue ? actualValue : '';

      setSelectedAssignments(currentAssignments);
    }
  };

  const handleAssignmentCustomValueChange = (
    event: React.ChangeEvent<{ value: any }>,
    index: number,
    schemaField: any
  ) => {
    let value = event.target.value;
    const schemaType = getTypeOfValue(schemaField, availableFieldsOfSchema);

    if (schemaType === 'Boolean') {
      value = value !== 'false';
    }
    if (schemaType === 'Number') {
      value = parseInt(value);
    }
    if (schemaType === 'Array') {
      dispatch(enqueueInfoNotification('Split elements with comma, without spaces', 'duplicate'));
      value = value.split(',');
    }

    const currentAssignments = deepClone(selectedAssignments);
    const assignment = currentAssignments[index];
    if (assignment) {
      assignment.assignmentField.value = value;
      setSelectedAssignments(currentAssignments);
    }
  };

  const handleAssignmentContextValueChange = (
    event: React.ChangeEvent<{ value: any }>,
    index: number
  ) => {
    const value = event.target.value;
    const currentAssignments = deepClone(selectedAssignments);
    const assignment = currentAssignments[index];
    if (assignment) {
      assignment.assignmentField.value = value;
      setSelectedAssignments(currentAssignments);
    }
  };

  const handleRemoveAssignment = (index: number) => {
    const currentAssignments = selectedAssignments.slice();
    currentAssignments.splice(index, 1);
    setSelectedAssignments(currentAssignments);
  };

  const getSecondSubField = (field: any, valuePrefix: any, suffix: any) => {
    const keys = Object?.keys(field?.type);
    const itemTop = (
      <CustomMenuItem
        dense
        disabled={selectedAssignments.find((assignment: any) =>
          assignment.schemaField.includes(`${valuePrefix}.${suffix}`)
        )}
        value={`${valuePrefix}.${suffix}`}>
        {suffix}
      </CustomMenuItem>
    );

    const restItems = keys?.map((item, i) => {
      if (typeof field.type === 'string' || Array.isArray(field.type)) {
        return (
          <CustomMenuItem
            disabled={
              Array.isArray(field.type) ||
              selectedAssignments.find((assignment: any) =>
                assignment.schemaField.includes(field.name)
              )
            }
            style={{
              background: 'rgba(0, 0, 0, 0.15)',
              paddingLeft: 24,
            }}
            key={`ido-${i}-field`}
            value={`${valuePrefix}.${suffix}.${item}`}>
            {item}
          </CustomMenuItem>
        );
      }
    });

    return [itemTop, ...restItems];
  };

  const extractCustomLabel = (assignmentField: any, schemaField: any) => {
    if (assignmentField === 'Custom') {
      return `Custom (${getTypeOfValue(schemaField, availableFieldsOfSchema)})`;
    } else {
      return 'Context value';
    }
  };

  const getSubFields = (field: any) => {
    if (field?.type) {
      const keys = Object?.keys(field?.type);

      const itemTop = (
        <CustomMenuItem disabled value={field.name}>
          {field.name}
        </CustomMenuItem>
      );

      const restItems = keys?.map((item, i) => {
        if (
          typeof field.type?.[item]?.type === 'string' ||
          field.type?.[item]?.type instanceof String ||
          field.type?.[item]?.type === undefined ||
          Array.isArray(field.type?.[item]?.type)
        ) {
          return (
            <MenuItem
              sx={{ paddingLeft: 3 }}
              disabled={
                Array.isArray(field.type) ||
                (selectedAssignments &&
                  selectedAssignments.find(
                    (assignment: any) => assignment.schemaField === `${field.name}.${item}`
                  ))
              }
              key={`idSec-${i}-field`}
              value={`${field.name}.${item}`}>
              {item}
            </MenuItem>
          );
        } else {
          return getSecondSubField(field.type?.[item], field.name, item);
        }
      });

      return [itemTop, ...restItems];
    }
  };

  const prepareOptions = () => {
    return availableFieldsOfSchema.map((field: any, index: number) => {
      if (typeof field.type === 'string' || Array.isArray(field.type)) {
        return (
          <MenuItem
            disabled={
              selectedAssignments &&
              selectedAssignments.find((assignment: any) => assignment.schemaField === field.name)
            }
            sx={{ paddingLeft: 1 }}
            key={`idxO-${index}-field`}
            value={field.name}>
            {field.name}
          </MenuItem>
        );
      }
      return getSubFields(field);
    });
  };

  return selectedAssignments.map((assignment: Assignment, index: number) => (
    <Fragment key={`assignment-${index}`}>
      <Grid item container xs={12} spacing={3} pb={4} alignItems="center" justifyContent="center">
        <Grid item xs={4}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography>{index + 1}.</Typography>
            <TextField
              select
              size="small"
              label={'Schema Field'}
              variant="outlined"
              fullWidth
              value={assignment.schemaField}
              disabled={!editMode}
              onChange={(event) => handleAssignmentFieldChange(event, index)}>
              <MenuItem aria-label="None" value="-" />
              {prepareOptions()}
            </TextField>
          </Box>
        </Grid>
        <Grid item xs={2}>
          <TextField
            select
            size="small"
            label={'Actions'}
            variant="outlined"
            fullWidth
            value={assignment.action}
            disabled={!editMode}
            onChange={(event) => handleAssignmentActionChange(event, index)}>
            <MenuItem aria-label="None" value="" />
            <MenuItem value={ActionTypes.SET}>SET</MenuItem>
            <MenuItem
              disabled={!isNumberType(assignment.schemaField)}
              value={ActionTypes.INCREMENT}>
              INCREMENT
            </MenuItem>
            <MenuItem
              disabled={!isNumberType(assignment.schemaField)}
              value={ActionTypes.DECREMENT}>
              DECREMENT
            </MenuItem>
            <MenuItem disabled={!isArrayType(assignment.schemaField)} value={ActionTypes.APPEND}>
              APPEND
            </MenuItem>
            <MenuItem disabled={!isArrayType(assignment.schemaField)} value={ActionTypes.REMOVE}>
              REMOVE
            </MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={2}>
          <TextField
            select
            size="small"
            label={'Assignment value'}
            variant="outlined"
            fullWidth
            value={
              assignment.assignmentField.type === 'Custom' ||
              assignment.assignmentField.type === 'Context'
                ? assignment.assignmentField.type
                : assignment.assignmentField.type + '-' + assignment.assignmentField.value
            }
            disabled={!editMode}
            onChange={(event) => handleAssignmentValueFieldChange(event, index)}>
            <MenuItem aria-label="None" value="-" />
            <MenuItem disabled sx={{ fontWeight: 'inherit', opacity: '1' }}>
              Custom Value
            </MenuItem>
            <MenuItem sx={{ paddingLeft: 4 }} value={'Custom'}>
              Add a custom value
            </MenuItem>
            <MenuItem disabled sx={{ fontWeight: 'inherit', opacity: '1' }}>
              Context Value
            </MenuItem>
            <MenuItem sx={{ paddingLeft: 4 }} value={'Context'}>
              Add a value from context
            </MenuItem>
            <MenuItem disabled sx={{ fontWeight: 'inherit', opacity: '1' }}>
              Input Fields
            </MenuItem>
            {selectedInputs.map((input: any, index: number) => (
              <MenuItem
                disabled={isValueIncompatible(
                  assignment.schemaField,
                  input.type,
                  availableFieldsOfSchema,
                  input.array
                )}
                sx={{ paddingLeft: 4 }}
                key={`idx-${index}-input`}
                value={'Input-' + input.name}>
                {`${input.name} ${extractInputValueType(input.type)}`}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        {getTypeOfValue(assignment.schemaField, availableFieldsOfSchema) === 'Boolean' &&
          assignment.assignmentField.type === 'Custom' && (
            <Grid item xs={2}>
              <TextField
                size="small"
                select
                disabled={!editMode}
                label="Custom (Boolean)"
                value={assignment.assignmentField.value}
                fullWidth
                onChange={(event: any) =>
                  handleAssignmentCustomValueChange(event, index, assignment.schemaField)
                }>
                <MenuItem value="true">true</MenuItem>
                <MenuItem value="false">false</MenuItem>
              </TextField>
            </Grid>
          )}
        {(getTypeOfValue(assignment.schemaField, availableFieldsOfSchema) !== 'Boolean' &&
          assignment.assignmentField.type === 'Custom') ||
        assignment.assignmentField.type === 'Context' ? (
          <Grid item xs={2}>
            <TextField
              size="small"
              label={extractCustomLabel(assignment.assignmentField.type, assignment.schemaField)}
              type={
                assignment.assignmentField.type === 'Custom' &&
                getTypeOfValue(assignment.schemaField, availableFieldsOfSchema)
              }
              variant={'outlined'}
              disabled={!editMode}
              fullWidth
              placeholder={'Value'}
              value={assignment.assignmentField.value}
              onChange={(event) =>
                assignment.assignmentField.type === 'Custom'
                  ? handleAssignmentCustomValueChange(event, index, assignment.schemaField)
                  : handleAssignmentContextValueChange(event, index)
              }
            />
          </Grid>
        ) : (
          <Grid item xs={2} />
        )}
        <Grid item xs={1} />
        <Grid item xs={1}>
          <IconButton
            sx={{ marginLeft: 1 }}
            disabled={!editMode}
            size="small"
            onClick={() => handleRemoveAssignment(index)}>
            <RemoveCircleOutlineIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Fragment>
  ));
};

export default EndpointAssignments;
