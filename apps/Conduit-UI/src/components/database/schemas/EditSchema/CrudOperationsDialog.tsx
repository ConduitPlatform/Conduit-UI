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
import { ICrudOperations, Schema } from '../../../../models/database/CmsModels';
import { DoneOutline } from '@mui/icons-material';
import { useForm, FormProvider } from 'react-hook-form';
import { FormInputCheckBox } from '../../../common/FormComponents/FormInputCheckbox';

interface Props {
  crudOperations: ICrudOperations;
  setCrudOperations: (crudOperations: ICrudOperations) => void;
  open: boolean;
  selectedSchema?: Schema;
  handleClose: () => void;
}

const CrudOperationsDialog: React.FC<Props> = ({
  open,
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

  const { handleSubmit, reset } = methods;

  const onSubmit = (data: ICrudOperations) => {
    setCrudOperations({ ...data });
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
                    name="create.enabled"
                    label="enabled"
                    disabled={isDisabled()}
                  />
                  <FormInputCheckBox
                    name="create.authenticated"
                    label="authenticated"
                    disabled={isDisabled()}
                  />
                </Grid>
                <Grid item sm={6} p={2}>
                  <Typography>Delete:</Typography>
                  <FormInputCheckBox
                    name="delete.enabled"
                    label="enabled"
                    disabled={isDisabled()}
                  />
                  <FormInputCheckBox
                    name="delete.authenticated"
                    label="authenticated"
                    disabled={isDisabled()}
                  />
                </Grid>
                <Grid item sm={6} p={2}>
                  <Typography>Read:</Typography>
                  <FormInputCheckBox name="read.enabled" label="enabled" disabled={isDisabled()} />
                  <FormInputCheckBox
                    name="read.authenticated"
                    label="authenticated"
                    disabled={isDisabled()}
                  />
                </Grid>
                <Grid item sm={6} p={2}>
                  <Typography>Update:</Typography>
                  <FormInputCheckBox
                    name="update.enabled"
                    label="enabled"
                    disabled={isDisabled()}
                  />
                  <FormInputCheckBox
                    name="update.authenticated"
                    label="authenticated"
                    disabled={isDisabled()}
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
