import { Delete, Edit } from '@mui/icons-material';
import { Box, IconButton, TextField } from '@mui/material';
import React, { FC } from 'react';
import { Endpoint } from '../../../models/customEndpoints/customEndpointsModels';
import { OperationsEnum } from '../../../models/OperationsEnum';
import { setEndpointData } from '../../../redux/slices/customEndpointsSlice';
import { useAppDispatch } from '../../../redux/store';
import { disableSubmit } from '../../../utils/cms';
import AssignmentsSection from './AssignmentsSection';
import InformationTooltip from './InformationTooltip';
import InputsSection from './InputsSection';
import OperationSection from './OperationSection';
import QueriesSection from './QueriesSection';
import SaveSection from './SaveSection';

interface Props {
  endpoint: Endpoint;
  editMode: boolean;
  createMode: boolean;
  schemaDocuments: any;
  handleEditClick: () => void;
  handleDeleteClick: () => void;
  handleCancelClick: () => void;
  handleSubmit: (edit: boolean) => void;
}

const MainContent: FC<Props> = ({
  endpoint,
  editMode,
  createMode,
  schemaDocuments,
  handleEditClick,
  handleCancelClick,
  handleDeleteClick,

  handleSubmit,
}) => {
  const dispatch = useAppDispatch();

  const handleNameChange = (event: any) => {
    dispatch(setEndpointData({ name: event.target.value }));
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
        <Box display="flex" justifyContent="flex-end" width="100%">
          {!editMode && (
            <IconButton disableRipple aria-label="delete" onClick={handleDeleteClick} size="large">
              <Delete color="error" />
            </IconButton>
          )}
          {!editMode && (
            <IconButton
              disableRipple
              color="primary"
              aria-label="edit"
              onClick={handleEditClick}
              size="large">
              <Edit />
            </IconButton>
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
