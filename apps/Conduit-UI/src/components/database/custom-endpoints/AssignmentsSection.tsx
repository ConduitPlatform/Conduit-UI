import React, { FC } from 'react';
import { Button, Divider, Grid, Typography } from '@mui/material';
import { OperationsEnum } from '../../../models/OperationsEnum';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EndpointAssignments from './EndpointAssignments';
import { setEndpointData } from '../../../redux/slices/customEndpointsSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { Assignment } from '../../../models/customEndpoints/customEndpointsModels';

interface Props {
  editMode: boolean;
}

const AssignmentsSection: FC<Props> = ({ editMode }) => {
  const dispatch = useAppDispatch();

  const { endpoint, schemaFields } = useAppSelector((state) => state.customEndpointsSlice.data);

  const handleAddAssignment = () => {
    const assignment: Assignment = {
      schemaField: '',
      action: 0,
      assignmentField: { type: '', value: '' },
    };
    dispatch(setEndpointData({ assignments: [...endpoint.assignments, assignment] }));
  };

  const handleAssignmentChanges = (assignments: Assignment[]) => {
    dispatch(setEndpointData({ assignments }));
  };

  return (
    <>
      <Grid item xs={6}>
        <Typography>
          <strong>Assignments</strong>
        </Typography>
      </Grid>

      <Grid item xs={12} sx={{ paddingBottom: 1 }}>
        <Divider />
      </Grid>
      <EndpointAssignments
        editMode={editMode}
        selectedInputs={endpoint.inputs}
        selectedAssignments={endpoint.assignments}
        setSelectedAssignments={handleAssignmentChanges}
        availableFieldsOfSchema={schemaFields}
      />
      <Grid item xs={12} sx={{ textAlign: 'center' }}>
        <Button
          disabled={
            !editMode ||
            (endpoint.operation === OperationsEnum.POST &&
              schemaFields.length <= endpoint.assignments.length)
          }
          variant="text"
          color={'primary'}
          sx={{ margin: 1, textTransform: 'none' }}
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddAssignment}>
          Add assignment
        </Button>
      </Grid>
    </>
  );
};

export default AssignmentsSection;
