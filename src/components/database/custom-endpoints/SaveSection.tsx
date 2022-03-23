import React, { FC } from 'react';
import { Button, Grid } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

interface Props {
  editMode: boolean;
  createMode: boolean;
  disableSubmit: any;
  handleSaveClick: any;
  handleCreateClick: any;
  handleCancelClick: () => void;
}

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
  },
}));

const SaveSection: FC<Props> = ({
  editMode,
  createMode,
  disableSubmit,
  handleSaveClick,
  handleCreateClick,
  handleCancelClick,
}) => {
  const classes = useStyles();
  return (
    <Grid container justifyContent="flex-end" spacing={1} className={classes.container}>
      <Grid item xs={3} md={1}>
        <Button variant="contained" color="secondary" onClick={handleCancelClick}>
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
