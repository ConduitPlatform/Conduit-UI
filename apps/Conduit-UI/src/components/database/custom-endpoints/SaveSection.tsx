import React, { FC } from 'react';
import { Button, Grid } from '@mui/material';

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
    <Grid container justifyContent="flex-end" spacing={1} sx={{ pt: 4 }}>
      <Grid item xs={3} md={1}>
        <Button onClick={handleCancelClick} variant="outlined">
          Cancel
        </Button>
      </Grid>

      <Grid item xs={3} md={1}>
        <Button
          disabled={disableSubmit}
          variant="contained"
          color="primary"
          onClick={createMode ? handleCreateClick : editMode ? handleSaveClick : ''}>
          {createMode ? 'Create' : editMode ? 'Save' : ''}
        </Button>
      </Grid>
    </Grid>
  );
};

export default SaveSection;
