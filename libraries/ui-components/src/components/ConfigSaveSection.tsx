import React, { FC } from 'react';
import { Button, Grid } from '@mui/material';

interface Props {
  edit: boolean;
  setEdit: (edit: boolean) => void;
  handleCancel: () => void;
}

const ConfigSaveSection: FC<Props> = ({ edit, setEdit, handleCancel }) => {
  return (
    <>
      {edit && (
        <Grid item container xs={12} sx={{ justifyContent: 'flex-end' }}>
          <Button onClick={() => handleCancel()} sx={{ marginRight: 2 }} color={'primary'} variant="outlined">
            Cancel
          </Button>
          <Button variant="contained" color="primary" sx={{ alignSelf: 'flex-end' }} type="submit">
            Save
          </Button>
        </Grid>
      )}
      {!edit && (
        <Grid item container xs={12} sx={{ justifyContent: 'flex-end', padding: 1 }}>
          <Button onClick={() => setEdit(true)} color={'primary'}>
            Edit
          </Button>
        </Grid>
      )}
    </>
  );
};

export default ConfigSaveSection;
