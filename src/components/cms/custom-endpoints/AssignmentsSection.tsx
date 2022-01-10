import React, { FC } from 'react';
import { Button, Divider, Grid, Typography } from '@material-ui/core';
import { OperationsEnum } from '../../../models/OperationsEnum';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import EndpointAssignments from './EndpointAssignments';
import { setEndpointData } from '../../../redux/slices/customEndpointsSlice';
import { makeStyles } from '@material-ui/core/styles';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { Assignment } from '../../../models/customEndpoints/customEndpointsModels';

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
    textTransform: 'none',
  },
  divider: {
    paddingBottom: theme.spacing(1),
  },
  addAssignmentBtn: {
    textAlign: 'end',
    padding: '0',
  },
}));

interface Props {
  editMode: boolean;
}

const AssignmentsSection: FC<Props> = ({ editMode }) => {
  const classes = useStyles();
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
      <Grid item xs={6} className={classes.addAssignmentBtn}>
        <Button
          disabled={
            !editMode ||
            (endpoint.operation === OperationsEnum.POST &&
              schemaFields.length <= endpoint.assignments.length)
          }
          variant="text"
          color={'secondary'}
          className={classes.button}
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddAssignment}>
          Add assignment
        </Button>
      </Grid>
      <Grid item xs={12} className={classes.divider}>
        <Divider />
      </Grid>
      <EndpointAssignments
        editMode={editMode}
        selectedInputs={endpoint.inputs}
        selectedAssignments={endpoint.assignments}
        setSelectedAssignments={handleAssignmentChanges}
        availableFieldsOfSchema={schemaFields}
      />
    </>
  );
};

export default AssignmentsSection;
