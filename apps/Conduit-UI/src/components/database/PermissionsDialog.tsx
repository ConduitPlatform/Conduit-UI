import React, { useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
  Container,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ModifyOptions, Permissions, Schema } from '../../models/database/CmsModels';
import { DoneOutline } from '@mui/icons-material';
import { useForm, FormProvider } from 'react-hook-form';
import { FormInputSelect } from '../common/FormComponents/FormInputSelect';
import { FormInputCheckBox } from '../common/FormComponents/FormInputCheckbox';

interface Props {
  permissions: Permissions;
  setPermissions: (permissions: Permissions) => void;
  open: boolean;
  selectedSchema?: Schema;
  handleClose: () => void;
}

const options = [
  { label: 'Everything', value: ModifyOptions.Everything },
  { label: 'Nothing', value: ModifyOptions.Nothing },
  { label: 'ExtensionOnly', value: ModifyOptions.ExtensionOnly },
];

const PermissionsDialog: React.FC<Props> = ({
  open,
  handleClose,
  permissions,
  selectedSchema,
  setPermissions,
}) => {
  const methods = useForm<Permissions>({
    defaultValues: useMemo(() => {
      return permissions;
    }, [permissions]),
  });

  useEffect(() => {
    methods.reset(permissions);
  }, [methods, permissions]);

  const { handleSubmit, reset } = methods;

  const onSubmit = (data: Permissions) => {
    setPermissions({ ...data });
    handleClose();
  };

  const handleCloseDialog = () => {
    reset();
    handleClose();
  };

  const isDisabled = () => {
    if (selectedSchema && selectedSchema.ownerModule !== 'database') {
      return true;
    } else return false;
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog}>
      <DialogTitle id="simple-dialog-title">
        Permissions
        <IconButton
          onClick={handleCloseDialog}
          sx={{ position: 'absolute', left: '92%', top: '1%', color: 'gray' }}
          size="large">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Container
          sx={{
            flexGrow: 6,
            alignItems: 'center',
            justifyContent: 'center',
            justifyItems: 'center',
            justifySelf: 'center',
          }}
          maxWidth="sm">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item sm={6}>
                  <FormInputCheckBox
                    name="extendable"
                    label="Is extendable"
                    disabled={isDisabled()}
                  />
                </Grid>
                <Grid item sm={6}>
                  <FormInputCheckBox name="canCreate" label="Can create" disabled={isDisabled()} />
                </Grid>
                <Grid item sm={6}>
                  <FormInputCheckBox name="canDelete" label="Can delete" disabled={isDisabled()} />
                </Grid>
                <Grid item sm={6}>
                  <FormInputSelect
                    disabled={isDisabled()}
                    label={'Can modify'}
                    name="canModify"
                    options={options.map((option) => ({
                      label: option.label,
                      value: option.value,
                    }))}
                  />
                </Grid>
                <Grid item sm={12}>
                  <Button
                    disabled={isDisabled()}
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
