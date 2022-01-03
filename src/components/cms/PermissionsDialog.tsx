import React, { useEffect, useMemo } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogContent';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import { Permissions } from '../../models/cms/CmsModels';
import { Button, Container, Grid } from '@material-ui/core';
import { DoneOutline } from '@material-ui/icons';
import { useForm, FormProvider } from 'react-hook-form';
import { FormInputSelect } from '../common/FormComponents/FormInputSelect';
import { FormInputCheckBox } from '../common/FormComponents/FormInputCheckbox';

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

  const methods = useForm<Permissions>({
    defaultValues: useMemo(() => {
      return permissions;
    }, [permissions]),
  });

  useEffect(() => {
    methods.reset(permissions);
  }, [methods, permissions]);

  const { handleSubmit } = methods;

  const options = ['Everything', 'Nothing', 'ExtensionOnly'];

  const onSubmit = (data: any) => {
    setPermissions({ ...data });
    handleClose();
  };

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
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item sm={6}>
                  <FormInputCheckBox name="extendable" label="Is extendable" />
                </Grid>
                <Grid item sm={6}>
                  <FormInputCheckBox name="canCreate" label="Can create" />
                </Grid>
                <Grid item sm={6}>
                  <FormInputCheckBox name="canDelete" label="Can delete" />
                </Grid>
                <Grid item sm={6}>
                  <FormInputSelect
                    label={'Can modify'}
                    name="canModify"
                    options={options?.map((option) => ({
                      label: option,
                      value: option,
                    }))}
                  />
                </Grid>
                <Grid item sm={12}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<DoneOutline />}>
                    Save
                  </Button>
                </Grid>
              </Grid>
            </form>
          </FormProvider>
        </Container>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionsDialog;
