import React, { useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ICrudOperations, Schema } from '../../../models/CmsModels';
import { DoneOutline } from '@mui/icons-material';
import { useForm, FormProvider } from 'react-hook-form';
import { FormInputCheckBox } from '../../../../../components/common/FormComponents/FormInputCheckbox';

interface Props {
  crudOperations: ICrudOperations;
  introspection?: boolean;
  setCrudOperations: (crudOperations: ICrudOperations) => void;
  open: boolean;
  selectedSchema?: Schema;
  handleClose: () => void;
}

const CrudOperationsDialog: React.FC<Props> = ({
  open,
  introspection,
  handleClose,
  crudOperations,
  selectedSchema,
  setCrudOperations,
}) => {
  const methods = useForm<ICrudOperations>({
    defaultValues: useMemo(() => {
      return crudOperations;
    }, [crudOperations]),
  });

  useEffect(() => {
    methods.reset(crudOperations);
  }, [methods, crudOperations]);

  const { handleSubmit, reset, register } = methods;

  const onSubmit = (data: ICrudOperations) => {
    setCrudOperations({ ...data });
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
    <Dialog open={open} onClose={handleCloseDialog}>
      <DialogTitle id="simple-dialog-title">
        CRUD operations
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
                <Grid item sm={6} p={2}>
                  <Typography>Create:</Typography>
                  <FormInputCheckBox
                    {...register('create.enabled', { disabled: isDisabled() })}
                    label="enabled"
                  />
                  <FormInputCheckBox
                    {...register('create.authenticated', { disabled: isDisabled() })}
                    label="authenticated"
                  />
                </Grid>
                <Grid item sm={6} p={2}>
                  <Typography>Delete:</Typography>
                  <FormInputCheckBox
                    {...register('delete.enabled', { disabled: isDisabled() })}
                    label="enabled"
                  />
                  <FormInputCheckBox
                    {...register('delete.authenticated', { disabled: isDisabled() })}
                    label="authenticated"
                  />
                </Grid>
                <Grid item sm={6} p={2}>
                  <Typography>Read:</Typography>
                  <FormInputCheckBox
                    {...register('read.enabled', { disabled: isDisabled() })}
                    label="enabled"
                  />
                  <FormInputCheckBox
                    {...register('read.authenticated', { disabled: isDisabled() })}
                    label="authenticated"
                  />
                </Grid>
                <Grid item sm={6} p={2}>
                  <Typography>Update:</Typography>
                  <FormInputCheckBox
                    {...register('update.enabled', { disabled: isDisabled() })}
                    label="enabled"
                  />
                  <FormInputCheckBox
                    {...register('update.authenticated', { disabled: isDisabled() })}
                    label="authenticated"
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

export default CrudOperationsDialog;
