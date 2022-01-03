import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogContent';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { Permissions } from '../../models/cms/CmsModels';
import { Container, Grid, MenuItem, Typography } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 6,
    alignItems: 'center',
    justifyContent: 'center',
    justifyItems: 'center',
    justifySelf: 'center',
  },
  textField: {
    textAlign: 'center',
  },
  customizedButton: {
    position: 'absolute',
    left: '92%',
    top: '1%',
    color: 'gray',
  },
}));

interface Props {
  permissions: Permissions;
  setPermissions: (permissions: Permissions) => void;
  open: boolean;
  handleClose: () => void;
}

const PermissionsDialog: React.FC<Props> = ({ open, handleClose, permissions, setPermissions }) => {
  const classes = useStyles();

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle id="simple-dialog-title">
        Permissions
        <IconButton onClick={handleClose} className={classes.customizedButton}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Container className={classes.root} maxWidth="sm">
          <Grid container alignItems="center" spacing={2}>
            <Grid item sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={permissions?.extendable}
                    onChange={(event) => {
                      setPermissions({ ...permissions, extendable: event.target.checked });
                    }}
                    name="authentication"
                  />
                }
                label={<Typography variant="caption">Is extendable</Typography>}
              />
            </Grid>
            <Grid item sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={permissions?.canCreate}
                    onChange={(event) => {
                      setPermissions({ ...permissions, canCreate: event.target.checked });
                    }}
                    name="authentication"
                  />
                }
                label={<Typography variant="caption">Can create</Typography>}
              />
            </Grid>
            <Grid item sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={permissions?.canDelete}
                    onChange={(event) => {
                      setPermissions({ ...permissions, canDelete: event.target.checked });
                    }}
                    name="authentication"
                  />
                }
                label={<Typography variant="caption">Can delete</Typography>}
              />
            </Grid>
            <Grid item sm={6}>
              <TextField
                select
                label={'Modify'}
                variant="outlined"
                value={permissions.canModify}
                onChange={(event) => {
                  setPermissions({ ...permissions, canModify: event.target.value });
                }}>
                <MenuItem value={'Everything'}>Everything</MenuItem>
                <MenuItem value={'Nothing'}>Nothing</MenuItem>
                <MenuItem value={'ExtensionOnly'}>Extension Only</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Container>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionsDialog;
