import React from 'react';
import { Box, Container, Grid, Button, Paper } from '@mui/material';
import Image from 'next/dist/client/image';
import FormsImage from '../../assets/svgs/forms.svg';
import { FormsModel } from '../../models/forms/FormsModels';
import EditableForm from './EditableForm';
import { ExtractDrawerInfo } from '@conduitplatform/ui-components';

interface Props {
  handleCreate: (formsState: FormsModel) => void;
  handleSave: (formsState: FormsModel) => void;
  form: FormsModel;
  edit: boolean;
  setEdit: (value: boolean) => void;
  create: boolean;
  setCreate: (value: boolean) => void;
}

const FormDrawerContent: React.FC<Props> = ({
  handleCreate,
  handleSave,
  form,
  edit,
  setEdit,
  create,
  setCreate,
}) => {
  const handleSaveClick = (data: FormsModel) => {
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
            padding: 2,
            color: 'text.primary',
            mt: 2,
          }}>
          <Grid container spacing={2}>
            {edit ? (
              <>
                <EditableForm preloadedValues={form} handleSubmitData={handleSaveClick} />
              </>
            ) : (
              <ExtractDrawerInfo valuesToShow={form} />
            )}
          </Grid>
        </Paper>
        {!edit && (
          <>
            <Grid container justifyContent="center">
              <Grid item>
                <Button onClick={() => setEdit(!edit)}>Edit</Button>
              </Grid>
            </Grid>
            <Grid item container justifyContent={'center'}>
              <Image
                src={FormsImage}
                width="200px"
                height="200px"
                objectFit={'contain'}
                alt="mail"
              />
            </Grid>
          </>
        )}
      </Box>
    </Container>
  );
};

export default FormDrawerContent;
