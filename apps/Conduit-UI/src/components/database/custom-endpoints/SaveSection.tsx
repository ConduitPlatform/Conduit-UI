import React, { FC } from 'react';
import { Box, Button } from '@mui/material';

interface Props {
  editMode: boolean;
  createMode: boolean;
  disableSubmit: any;
  handleSaveClick: any;
  handleCreateClick: any;
  handleCancelClick: () => void;
}

const SaveSection: FC<Props> = ({
  editMode,
  createMode,
  disableSubmit,
  handleSaveClick,
  handleCreateClick,
  handleCancelClick,
}) => {
  return (
    <Box display="flex" width="100%" justifyContent="flex-end" gap={2} px={4}>
      <Button onClick={handleCancelClick} variant="outlined">
        Cancel
      </Button>
      <Button
        disabled={disableSubmit}
        variant="contained"
        color="primary"
        onClick={createMode ? handleCreateClick : editMode ? handleSaveClick : ''}>
        {createMode ? 'Create' : editMode ? 'Save' : ''}
      </Button>
    </Box>
  );
};

export default SaveSection;
