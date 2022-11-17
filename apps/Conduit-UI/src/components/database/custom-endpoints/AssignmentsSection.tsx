import React, { FC } from 'react';
import { Box, Button, Divider, Typography } from '@mui/material';
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

  const { endpoint, accessibleSchemaFields } = useAppSelector(
    (state) => state.customEndpointsSlice.data
  );

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
    <Box>
      <Typography fontWeight="bold">Assignments</Typography>
      <Divider sx={{ mb: 4 }} />
      <EndpointAssignments
        editMode={editMode}
        selectedInputs={endpoint.inputs}
        selectedAssignments={endpoint.assignments}
        setSelectedAssignments={handleAssignmentChanges}
        availableFieldsOfSchema={accessibleSchemaFields}
      />
      <Box display="flex" justifyContent="center">
        <Button
          disabled={
            !editMode ||
            (endpoint.operation === OperationsEnum.POST &&
              accessibleSchemaFields.length <= endpoint.assignments.length)
          }
          variant="text"
          color={'primary'}
          sx={{ margin: 1, textTransform: 'none' }}
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddAssignment}>
          Add assignment
        </Button>
      </Box>
    </Box>
  );
};

export default AssignmentsSection;
