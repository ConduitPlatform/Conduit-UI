import React, { FC } from 'react';
import { Box, Button, Divider, Typography } from '@mui/material';
import EndpointQueries from './EndpointQueries';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { setEndpointData } from '../../../redux/slices/customEndpointsSlice';
import { recursiveNodeIteration } from '../../../utils/cms';
import { v4 as uuidv4 } from 'uuid';
import { deepClone } from '../../../utils/deepClone';
import { useAppDispatch, useAppSelector } from '../../../redux/store';

interface Props {
  editMode: boolean;
}

const QueriesSection: FC<Props> = ({ editMode }) => {
  const dispatch = useAppDispatch();

  const { endpoint } = useAppSelector((state) => state.customEndpointsSlice.data);

  const handleQueryChanges = (queries: any) => {
    dispatch(setEndpointData({ queries }));
  };

  const handleAddParentNode = () => {
    const query = { _id: uuidv4(), operator: 'AND', queries: [] };
    dispatch(setEndpointData({ queries: [...endpoint.queries, query] }));
  };

  const handleAddQuery = (nodeId: any) => {
    if (!nodeId) return;

    const query = {
      _id: uuidv4(),
      schemaField: '',
      operation: -1,
      comparisonField: {
        type: '',
        value: '',
        like: false,
      },
    };

    const queries = deepClone(endpoint.queries);

    queries.forEach((q: any) => {
      const found = recursiveNodeIteration(q, nodeId);
      if (found) {
        if ('queries' in found) {
          found.queries.push(query);
        }
      }
    });

    dispatch(setEndpointData({ queries }));
  };

  const handleAddNode = (nodeId: any) => {
    if (!nodeId) return;

    const queries = deepClone(endpoint.queries);

    const query = {
      _id: uuidv4(),
      schemaField: '',
      operation: -1,
      comparisonField: {
        type: '',
        value: '',
        like: false,
      },
    };

    queries.forEach((q: any) => {
      const found = recursiveNodeIteration(q, nodeId);

      if (found) {
        if ('queries' in found) {
          found.queries.push({ _id: uuidv4(), operator: 'AND', queries: [query] });
        }
        dispatch(setEndpointData({ queries }));
      }
    });
  };

  const handleRemoveNode = (nodeId: any) => {
    const queries = deepClone(endpoint.queries);
    let foundIndex = -1;

    queries.forEach((q: any, index: number) => {
      if (q._id === nodeId) {
        foundIndex = index;
      }
      if (foundIndex !== -1) {
        queries.splice(foundIndex, 1);
      } else {
        if ('queries' in q) {
          q.queries.forEach((q1: any, index1: number) => {
            if (q1._id === nodeId) {
              foundIndex = index1;
            }
            if (foundIndex !== -1) {
              q.queries.splice(foundIndex, 1);
            } else {
              if ('queries' in q1) {
                q1.queries.forEach((q2: any, index2: number) => {
                  if (q2._id === nodeId) {
                    foundIndex = index2;
                  }
                  if (foundIndex !== -1) {
                    q1.queries.splice(foundIndex, 1);
                  }
                });
              }
            }
          });
        }
      }
    });

    dispatch(setEndpointData({ queries }));
  };

  const handleChangeNodeOperator = (nodeId: any, oldOperator: any, newOperator: any) => {
    const queries = JSON.parse(JSON.stringify(endpoint.queries));

    if (!nodeId) return;

    queries.forEach((q: any) => {
      const found = recursiveNodeIteration(q, nodeId);
      if (found) {
        if ('operator' in found) {
          found.operator = newOperator;
        }
      }
    });

    dispatch(setEndpointData({ queries }));
  };

  return (
    <Box>
      <Typography fontWeight="bold">Queries</Typography>
      <Divider sx={{ mb: 2 }} />
      <EndpointQueries
        editMode={editMode}
        selectedInputs={endpoint.inputs}
        selectedSchema={endpoint.selectedSchema}
        selectedQueries={endpoint.queries}
        setSelectedQueries={handleQueryChanges}
        handleAddNode={handleAddNode}
        handleRemoveNode={handleRemoveNode}
        handleAddQuery={handleAddQuery}
        handleChangeNodeOperator={handleChangeNodeOperator}
      />
      <Box display="flex" justifyContent="center">
        <Button
          disabled={!editMode}
          variant="text"
          color={'primary'}
          sx={{ margin: 1, textTransform: 'none' }}
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddParentNode}>
          Add query
        </Button>
      </Box>
    </Box>
  );
};

export default QueriesSection;
