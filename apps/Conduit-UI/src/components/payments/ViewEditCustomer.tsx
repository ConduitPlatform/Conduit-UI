import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { Cancel } from '@mui/icons-material';
import React from 'react';
import { Button, Paper } from '@mui/material';
import { useAppDispatch } from '../../redux/store';
import { Customer } from '../../models/payments/PaymentsModels';
import { enqueueErrorNotification } from '../../utils/useNotifier';
import CustomerForm from './Forms/CustomerForm';
import { ExtractDrawerInfo } from '@conduitplatform/ui-components';

interface Props {
  handleCreate: (customer: Customer) => void;
  handleSave: (customer: Customer) => void;
  customer: Customer;
  edit: boolean;
  setEdit: (value: boolean) => void;
  create: boolean;
  setCreate: (value: boolean) => void;
  handleClose: () => void;
}

const ViewEditCustomer: React.FC<Props> = ({
  handleCreate,
  handleSave,
  customer,
  edit,
  setEdit,
  create,
  setCreate,
  handleClose,
}) => {
  const dispatch = useAppDispatch();

  const handleSaveClick = (data: Customer) => {
    const regex = /^\S+@\S+\.\S+$/;
    if (!regex.test(data.email)) {
      dispatch(
        enqueueErrorNotification('The email address you provided is not valid', 'emailError')
      );
      return;
    }
    if (create) {
      handleCreate(data);
    } else {
      handleSave(data);
    }
    setCreate(false);
    setEdit(!edit);
  };

  return (
    <Container>
      <Box>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            color: 'text.secondary',
            mt: 2,
          }}>
          <Grid container spacing={2} justifyContent="space-around">
            {edit ? (
              <CustomerForm preloadedValues={customer} handleSubmitData={handleSaveClick} />
            ) : (
              <ExtractDrawerInfo valuesToShow={customer} />
            )}
          </Grid>
        </Paper>
        <Grid container item xs={12} justifyContent="space-around" sx={{ marginTop: '15px' }}>
          {!edit && (
            <Button
              disabled
              variant="outlined"
              color="primary"
              startIcon={<Cancel />}
              onClick={() => setEdit(true)}>
              Edit
            </Button>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default ViewEditCustomer;
