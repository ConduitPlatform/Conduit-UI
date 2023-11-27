import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import React from 'react';
import { Button, Paper } from '@mui/material';
import { Product } from '../models/PaymentsModels';
import ProductForm from './Forms/ProductForm';
import { ExtractDrawerInfo } from '@conduitplatform/ui-components';

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
  handleClose,
}) => {
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
        <Paper
          elevation={0}
          sx={{
            p: 2,
            color: 'text.primary',
            mt: 2,
          }}>
          <Grid container spacing={2} justifyContent="space-around">
            {edit ? (
              <ProductForm
                preloadedValues={product}
                handleSubmitData={handleSaveClick}
                handleClose={handleClose}
              />
            ) : (
              <ExtractDrawerInfo valuesToShow={product} />
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
