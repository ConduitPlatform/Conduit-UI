import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import React from 'react';
import { Button, Paper } from '@mui/material';
import { Product } from '../../models/payments/PaymentsModels';
import sharedClasses from '../common/sharedClasses';
import ExtractView from './ExtractView';

import ProductForm from './Forms/ProductForm';

interface Props {
  handleCreate: (product: Product) => void;
  handleSave: (product: Product) => void;
  product: Product;
  edit: boolean;
  setEdit: (value: boolean) => void;
  create: boolean;
  setCreate: (value: boolean) => void;
  handleClose: () => void;
}

const ViewEditProduct: React.FC<Props> = ({
  handleCreate,
  handleSave,
  product,
  edit,
  setEdit,
  create,
  setCreate,
}) => {
  const classes = sharedClasses();

  const handleSaveClick = (data: Product) => {
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
        <Paper elevation={0} className={classes.paper}>
          <Grid container spacing={2} justifyContent="space-around">
            {edit ? (
              <ProductForm preloadedValues={product} handleSubmitData={handleSaveClick} />
            ) : (
              <ExtractView valuesToShow={product} />
            )}
          </Grid>
        </Paper>

        {!edit && (
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button onClick={() => setEdit(!edit)}>Edit</Button>
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default ViewEditProduct;
