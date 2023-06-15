import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import React from 'react';
import { ExtractDrawerInfo } from '@conduitplatform/ui-components';
import { Button, Paper } from '@mui/material';
import FunctionForm from './FunctionForm';
import { FunctionType } from '../models/FunctionsModels';

interface Props {
  handleCreate: (templateState: FunctionType) => void;
  handleSave: (templateState: FunctionType) => void;
  template: FunctionType;
  edit: boolean;
  setEdit: (value: boolean) => void;
  create: boolean;
  setCreate: (value: boolean) => void;
}

const FunctionDrawerContent: React.FC<Props> = ({
  handleCreate,
  handleSave,
  template,
  edit,
  setEdit,
  create,
  setCreate,
}) => {
  const handleSaveClick = (data: FunctionType) => {
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
          <Grid container spacing={2} justifyContent="space-around">
            {edit ? (
              <FunctionForm preloadedValues={template} handleSubmitData={handleSaveClick} />
            ) : (
              <>
                <ExtractDrawerInfo valuesToShow={template} />
              </>
            )}
          </Grid>
        </Paper>
        {!edit && (
          <Grid container alignItems={'center'} direction={'column'}>
            <Grid item>
              <Button size={'large'} variant={'outlined'} onClick={() => setEdit(!edit)}>
                Edit
              </Button>
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default FunctionDrawerContent;
