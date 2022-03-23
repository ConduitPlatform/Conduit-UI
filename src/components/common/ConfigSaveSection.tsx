import React, { FC } from 'react';
import { Button, Grid } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
  margin: {
    marginRight: theme.spacing(2),
  },
  saveBtn: {
    alignSelf: 'flex-end',
  },
  gridItem: {
    justifyContent: 'flex-end',
    padding: theme.spacing(1),
  },
}));

interface Props {
  edit: boolean;
  setEdit: (edit: boolean) => void;
  handleCancel: () => void;
}

const ConfigSaveSection: FC<Props> = ({ edit, setEdit, handleCancel }) => {
  const classes = useStyles();
  return (
    <>
      {edit && (
        <Grid item container xs={12} className={classes.gridItem}>
          <Button onClick={() => handleCancel()} className={classes.margin} color={'primary'}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" className={classes.saveBtn} type="submit">
            Save
          </Button>
        </Grid>
      )}
      {!edit && (
        <Grid item container xs={12} className={classes.gridItem}>
          <Button onClick={() => setEdit(true)} className={classes.margin} color={'primary'}>
            Edit
          </Button>
        </Grid>
      )}
    </>
  );
};

export default ConfigSaveSection;
