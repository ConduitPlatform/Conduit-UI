import React, { FC, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
  Container,
  Grid,
  Box,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ModifyOptions, Permissions, Schema } from '../../../models/CmsModels';
import { DoneOutline, InfoOutlined } from '@mui/icons-material';
import { useForm, FormProvider } from 'react-hook-form';
import { FormInputSelect } from '../../../../../components/common/FormComponents/FormInputSelect';
import { FormInputCheckBox } from '../../../../../components/common/FormComponents/FormInputCheckbox';

interface Props {
  permissions: Permissions;
  introspection?: boolean;
  setPermissions: (permissions: Permissions) => void;
  open: boolean;
  selectedSchema?: Schema;
  handleClose: () => void;
}

const options = [
  { label: 'Everything', value: ModifyOptions.Everything },
  { label: 'Nothing', value: ModifyOptions.Nothing },
  { label: 'Extensions Only', value: ModifyOptions.ExtensionOnly },
];

const PermissionsDialog: FC<Props> = ({
  open,
  introspection,
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

  const { handleSubmit, reset, register } = methods;

  const onSubmit = (data: Permissions) => {
    setPermissions({ ...data });
    handleClose();
  };

  const handleCloseDialog = () => {
    reset();
    handleClose();
  };

  const isDisabled = () => {
    if (selectedSchema && selectedSchema.ownerModule !== 'database' && !introspection) {
      return true;
    } else return false;
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog} PaperProps={{ sx: { borderRadius: '16px' } }}>
      <DialogTitle id="simple-dialog-title">
        Extension Permissions
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
              <Grid container alignItems="center" columnSpacing={5} rowSpacing={2}>
                <Grid item sm={6}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <FormInputCheckBox
                      {...register('extendable', { disabled: isDisabled() })}
                      label="Extendable"
                    />
                    <Tooltip title="Allows the model to be extended by modules">
                      <InfoOutlined />
                    </Tooltip>
                  </Box>
                </Grid>
                <Grid item sm={6}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <FormInputCheckBox
                      {...register('canCreate', { disabled: isDisabled() })}
                      label="Create"
                    />
                    <Tooltip title="Allows the creation of model entries by extension models">
                      <InfoOutlined />
                    </Tooltip>
                  </Box>
                </Grid>
                <Grid item sm={6}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <FormInputCheckBox
                      {...register('canDelete', { disabled: isDisabled() })}
                      label="Delete"
                    />
                    <Tooltip title="Allows the deletion of model entries by extension models">
                      <InfoOutlined />
                    </Tooltip>
                  </Box>
                </Grid>
                <Grid item sm={6}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <FormInputSelect
                      textFieldProps={{ sx: { maxWidth: '200px' } }}
                      label={'Modify'}
                      {...register('canModify', { disabled: isDisabled() })}
                      options={options.map((option) => ({
                        label: option.label,
                        value: option.value,
                      }))}
                    />
                    <Tooltip title="Allows the modification of target model entry fields by extension schemas">
                      <InfoOutlined />
                    </Tooltip>
                  </Box>
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
