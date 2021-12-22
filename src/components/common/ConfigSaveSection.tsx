import React, { FC } from 'react';
import { Button, Grid } from '@material-ui/core';

interface Props {
  edit: boolean;
  setEdit: (edit: boolean) => void;
  handleCancel: () => void;
}

const ConfigSaveSection: FC<Props> = ({ edit, setEdit, handleCancel }) => {
  return (
    <>
      {edit && (
        <Grid item container xs={12} justifyContent={'flex-end'}>
          <Button onClick={() => handleCancel()} style={{ marginRight: 16 }} color={'primary'}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            style={{ alignSelf: 'flex-end' }}
            type="submit">
            Save
          </Button>
        </Grid>
      )}
      {!edit && (
        <Grid item container xs={12} justifyContent={'flex-end'}>
          <Button onClick={() => setEdit(true)} style={{ marginRight: 16 }} color={'primary'}>
            Edit
          </Button>
        </Grid>
      )}
    </>
  );
};

export default ConfigSaveSection;
