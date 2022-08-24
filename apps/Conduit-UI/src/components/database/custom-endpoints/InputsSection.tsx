import React, { FC } from 'react';
import { Button, Divider, Grid, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EndpointInputs from './EndpointInputs';
import { setEndpointData } from '../../../redux/slices/customEndpointsSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { Input } from '../../../models/customEndpoints/customEndpointsModels';

interface Props {
  editMode: boolean;
}

const InputsSection: FC<Props> = ({ editMode }) => {
  const dispatch = useAppDispatch();

  const { endpoint, schemaFields } = useAppSelector((state) => state.customEndpointsSlice.data);

  const handleAddInput = () => {
    const input = {
      name: '',
      type: '',
      location: -1,
      array: false,
      optional: false,
    };
    dispatch(setEndpointData({ inputs: [...endpoint.inputs, input] }));
  };

  const maxInputs = () => {
    return endpoint.inputs.length === schemaFields.length;
  };

  const deconstructQueries = (queries: any) => {
    let allQueries: any = [];
    queries.forEach((query: any) => {
      if ('operator' in query) {
        allQueries = allQueries.concat(deconstructQueries(query.queries));
      } else {
        allQueries.push(query);
      }
    });

    return allQueries;
  };

  const handleRemoveInput = (index: number) => {
    const input: any = endpoint.inputs[index];
    const currentInputs = endpoint.inputs.slice();
    currentInputs.splice(index, 1);

    const updatedQueries = endpoint.queries.slice();
    const queries = deconstructQueries(updatedQueries);

    queries.map((q: any) => {
      const comparisonField = q.comparisonField;
      if (comparisonField.name === input.value) {
        return {
          ...q,
          comparisonField: {
            type: '',
            value: '',
          },
        };
      } else {
        return q;
      }
    });

    const updatedAssignments = endpoint.assignments.slice().map((a: any) => {
      const assignmentField: any = a.assignmentField;
      if (assignmentField.name === input.value) {
        return {
          ...a,
          assignmentField: {
            type: '',
            value: '',
          },
        };
      } else {
        return a;
      }
    });

    dispatch(
      setEndpointData({
        inputs: currentInputs,
        queries: updatedQueries,
        assignments: updatedAssignments,
      })
    );
  };

  const handleInputsChanges = (inputs: Input) => {
    dispatch(setEndpointData({ inputs }));
  };

  return (
    <Grid container pl={2} mt={2}>
      <Grid>
        <Typography>
          <strong>Inputs</strong>
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Divider />
      </Grid>
      <EndpointInputs
        editMode={editMode}
        operationType={endpoint && endpoint.operation}
        selectedInputs={endpoint.inputs}
        setSelectedInputs={handleInputsChanges}
        handleRemoveInput={handleRemoveInput}
      />
      <Grid item xs={12} sx={{ textAlign: 'center', padding: '0' }}>
        <Button
          disabled={!editMode || maxInputs()}
          variant="text"
          color={'primary'}
          sx={{ margin: 1, textTransform: 'none' }}
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddInput}>
          Add input
        </Button>
      </Grid>
    </Grid>
  );
};
export default InputsSection;
