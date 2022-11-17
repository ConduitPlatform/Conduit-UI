import { Delete, Edit } from '@mui/icons-material';
import { Box, Button, TextField } from '@mui/material';
import React, { FC } from 'react';
import { Endpoint } from '../../../models/customEndpoints/customEndpointsModels';
import { Filters, Schema } from '../../../models/database/CmsModels';
import { OperationsEnum } from '../../../models/OperationsEnum';
import { setEndpointData, setSelectedEndPoint } from '../../../redux/slices/customEndpointsSlice';
import {
  asyncCreateCustomEndpoints,
  asyncUpdateCustomEndpoints,
} from '../../../redux/slices/databaseSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { disableSubmit, prepareQuery } from '../../../utils/cms';
import AssignmentsSection from './AssignmentsSection';
import InformationTooltip from './InformationTooltip';
import InputsSection from './InputsSection';
import OperationSection from './OperationSection';
import QueriesSection from './QueriesSection';
import SaveSection from './SaveSection';

interface Props {
  endpoint: Endpoint;
  createMode: boolean;
  setCreateMode: (createMode: boolean) => void;
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  setConfirmationOpen: (confirmationOpen: boolean) => void;
  schemaDocuments: any;
  selectedEndpoint: Endpoint;
  filters: Filters;
  initializeData: () => void;
}

const MainContent: FC<Props> = ({
  endpoint,
  createMode,
  setCreateMode,
  editMode,
  setEditMode,
  setConfirmationOpen,
  schemaDocuments,
  selectedEndpoint,
  filters,
  initializeData,
}) => {
  const dispatch = useAppDispatch();

  const { endpoints } = useAppSelector((state) => state.databaseSlice.data.customEndpoints);

  const handleNameChange = (event: any) => {
    dispatch(setEndpointData({ name: event.target.value }));
  };

  const handleSubmit = (edit = false) => {
    const schemaToSubmit = schemaDocuments.find(
      (schemaDocument: Schema) => schemaDocument._id === endpoint.selectedSchema
    );

    const query = prepareQuery(endpoint.queries);

    const data = {
      name: endpoint.name,
      operation: Number(endpoint.operation),
      selectedSchema: schemaToSubmit?._id,
      authentication: endpoint.authentication,
      paginated: endpoint.paginated,
      sorted: endpoint.sorted,
      inputs: endpoint.inputs,
      query,
      assignments: endpoint.assignments,
    };

    if (edit) {
      const _id = selectedEndpoint._id;
      dispatch(
        asyncUpdateCustomEndpoints({
          _id,
          endpointData: data,
          filters,
          endpointsLength: endpoints.length,
        })
      );
      dispatch(setSelectedEndPoint(''));
    } else {
      dispatch(
        asyncCreateCustomEndpoints({
          endpointData: data,
          filters,
          endpointsLength: endpoints.length,
        })
      );
    }
    setCreateMode(false);
    setEditMode(false);
  };

  const handleDeleteClick = () => {
    setConfirmationOpen(true);
  };

  const handleEditClick = () => {
    setEditMode(true);
    setCreateMode(false);
  };

  const handleCancelClick = () => {
    setCreateMode(false);
    setEditMode(false);
    initializeData();
  };

  const renderDetails = () => {
    if (!endpoint.selectedSchema || endpoint.operation === -1) return null;
    return (
      <>
        <InputsSection editMode={editMode} />
        {endpoint.operation !== OperationsEnum.POST && <QueriesSection editMode={editMode} />}
        {(endpoint.operation === OperationsEnum.PUT ||
          endpoint.operation === OperationsEnum.POST ||
          endpoint.operation === OperationsEnum.PATCH) && (
          <AssignmentsSection editMode={editMode} />
        )}
      </>
    );
  };
  return (
    <Box display="flex" pt={2} gap={2} flexDirection="column">
      <Box display="flex" gap={2} alignItems="center">
        <TextField
          size="small"
          sx={{ maxWidth: 300 }}
          fullWidth
          disabled={!editMode}
          variant={'outlined'}
          label={'Name'}
          value={endpoint.name}
          onChange={handleNameChange}
        />
        <InformationTooltip />
        <Box display="flex" px={2} gap={2} justifyContent="flex-end" width="100%">
          {!editMode && (
            <Button
              variant="outlined"
              color="error"
              aria-label="delete"
              onClick={handleDeleteClick}
              size="small">
              <Delete />
            </Button>
          )}
          {!editMode && (
            <Button
              variant="outlined"
              color="primary"
              aria-label="edit"
              onClick={handleEditClick}
              size="small">
              <Edit />
            </Button>
          )}
        </Box>
      </Box>
      <OperationSection
        editMode={editMode}
        createMode={createMode}
        availableSchemas={schemaDocuments}
      />
      {renderDetails()}
      {(editMode || createMode) && (
        <SaveSection
          editMode={editMode}
          createMode={createMode}
          disableSubmit={disableSubmit(endpoint)}
          handleSaveClick={() => handleSubmit(true)}
          handleCreateClick={() => handleSubmit(false)}
          handleCancelClick={handleCancelClick}
        />
      )}
    </Box>
  );
};

export default MainContent;
